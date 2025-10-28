import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/feedback
 * Save user feedback to Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback_type, message, email, context } = body;

    // Validate required fields
    if (!feedback_type || !message) {
      return NextResponse.json(
        { error: 'feedback_type and message are required' },
        { status: 400 }
      );
    }

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // Create feedback table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        feedback_type TEXT NOT NULL,
        message TEXT NOT NULL,
        email TEXT,
        context TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

      -- Allow authenticated users to insert
      CREATE POLICY IF NOT EXISTS "Users can insert feedback"
        ON feedback FOR INSERT
        TO authenticated
        WITH CHECK (true);

      -- Allow service role to read all
      CREATE POLICY IF NOT EXISTS "Service role can read all feedback"
        ON feedback FOR SELECT
        TO service_role
        USING (true);
    `;

    // Execute table creation (idempotent)
    const createTableResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: createTableQuery }),
      }
    );

    // Insert feedback record
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          feedback_type,
          message,
          email,
          context,
        }),
      }
    );

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Failed to insert feedback:', errorText);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    const result = await insertResponse.json();

    return NextResponse.json({
      success: true,
      feedback: result[0],
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
