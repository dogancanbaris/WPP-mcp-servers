/**
 * Platform Metadata API
 *
 * GET /api/metadata/platforms
 *
 * Returns list of all available platforms with their capabilities.
 * Used by agents to discover what data is available.
 */

import { NextResponse } from 'next/server';
import { getAllPlatforms } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

/**
 * GET - List all available platforms
 */
export async function GET() {
  try {
    const platforms = getAllPlatforms();

    return NextResponse.json({
      success: true,
      platforms: platforms.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        metricsCount: p.metrics.length,
        dimensionsCount: p.dimensions.length,
        canBlendWith: p.blending?.compatible_platforms || []
      })),
      total: platforms.length
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
