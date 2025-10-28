import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/mcp/linear/create-issue
 * Create an issue in Linear via MCP tool
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, team, priority, labels } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'title and description are required' },
        { status: 400 }
      );
    }

    // Get Linear API token from environment
    const linearApiKey = process.env.LINEAR_API_KEY;

    if (!linearApiKey) {
      console.error('Linear API key not configured');
      return NextResponse.json(
        { error: 'Linear integration not configured' },
        { status: 500 }
      );
    }

    // First, get the team by name if provided
    let teamId: string | undefined;

    if (team) {
      const teamsQuery = `
        query {
          teams {
            nodes {
              id
              name
              key
            }
          }
        }
      `;

      const teamsResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': linearApiKey,
        },
        body: JSON.stringify({ query: teamsQuery }),
      });

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        const foundTeam = teamsData.data?.teams?.nodes?.find(
          (t: any) => t.name.toLowerCase() === team.toLowerCase() || t.key.toLowerCase() === team.toLowerCase()
        );
        teamId = foundTeam?.id;
      }
    }

    // Get label IDs if labels provided
    const labelIds: string[] = [];

    if (labels && labels.length > 0) {
      const labelsQuery = `
        query {
          issueLabels {
            nodes {
              id
              name
            }
          }
        }
      `;

      const labelsResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': linearApiKey,
        },
        body: JSON.stringify({ query: labelsQuery }),
      });

      if (labelsResponse.ok) {
        const labelsData = await labelsResponse.json();
        const allLabels = labelsData.data?.issueLabels?.nodes || [];

        for (const labelName of labels) {
          const foundLabel = allLabels.find(
            (l: any) => l.name.toLowerCase() === labelName.toLowerCase()
          );
          if (foundLabel) {
            labelIds.push(foundLabel.id);
          }
        }
      }
    }

    // Create the issue
    const createIssueMutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;

    const issueInput: any = {
      title,
      description,
    };

    if (teamId) {
      issueInput.teamId = teamId;
    }

    if (priority) {
      issueInput.priority = priority;
    }

    if (labelIds.length > 0) {
      issueInput.labelIds = labelIds;
    }

    const createIssueResponse = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': linearApiKey,
      },
      body: JSON.stringify({
        query: createIssueMutation,
        variables: { input: issueInput },
      }),
    });

    if (!createIssueResponse.ok) {
      const errorText = await createIssueResponse.text();
      console.error('Failed to create Linear issue:', errorText);
      return NextResponse.json(
        { error: 'Failed to create issue in Linear' },
        { status: 500 }
      );
    }

    const result = await createIssueResponse.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Failed to create issue', details: result.errors },
        { status: 500 }
      );
    }

    const issue = result.data?.issueCreate?.issue;

    if (!issue) {
      return NextResponse.json(
        { error: 'Failed to create issue' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      issueId: issue.identifier,
      issueUrl: issue.url,
      issue,
    });
  } catch (error) {
    console.error('Error creating Linear issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
