/**
 * Platform-Specific Metadata API
 *
 * GET /api/metadata/[platform]
 *
 * Returns detailed metadata for a specific platform (metrics, dimensions, blending rules).
 * Agents use this to understand what queries they can build.
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadPlatformMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    platform: string;
  }>;
}

/**
 * GET - Get platform metadata
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const platform = loadPlatformMetadata(params.platform);

    return NextResponse.json({
      success: true,
      platform
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        availablePlatforms: ['gsc'] // TODO: Get from registry
      },
      { status: 404 }
    );
  }
}
