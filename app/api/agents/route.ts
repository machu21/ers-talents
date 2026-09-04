import { NextRequest, NextResponse } from 'next/server';
import { agentsRateLimiter, getClientIp } from '@/lib/rate-limit';
import { agentsCache, type CachedAgent } from '@/lib/cache';

interface GHLOpportunity {
  id: string;
  contactId?: string;
  name: string;
  pipelineStageId: string;
}

interface GHLContactCustomField {
  id: string;
  value?: string;
  fieldValue?: string;
}

interface GHLContactResponse {
  contact?: {
    customFields?: GHLContactCustomField[];
  };
}

function getEmbedUrl(url: string): string {
  if (!url) return '';
  try {
    if (url.includes('loom.com/share/')) return url.replace('/share/', '/embed/');
    if (url.includes('drive.google.com/file/d/')) return url.replace(/\/view.*/, '/preview');
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = new URL(url).searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1].split('/')[0].split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  } catch {
    return url;
  }
}

async function resolveThumbnailUrl(url: string): Promise<string> {
  if (!url) return '';
  try {
    // 1. Google Drive video thumbnail
    if (url.includes('drive.google.com')) {
      const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    }

    // 2. YouTube video thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = new URL(url).searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    // 3. Loom video thumbnail via official oEmbed API
    if (url.includes('loom.com')) {
      const match = url.match(/[a-f0-9]{32}/i);
      if (match && match[0]) {
        const oembedUrl = `https://www.loom.com/v1/oembed?url=https://www.loom.com/share/${match[0]}`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = (await res.json()) as { thumbnail_url?: string };
          if (data?.thumbnail_url) {
            return data.thumbnail_url;
          }
        }
      }
    }

    // 4. Vimeo video thumbnail
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      if (match && match[1]) {
        const vimeoRes = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${match[1]}`);
        if (vimeoRes.ok) {
          const data = (await vimeoRes.json()) as { thumbnail_url?: string };
          if (data?.thumbnail_url) {
            return data.thumbnail_url;
          }
        }
      }
    }

    return '';
  } catch {
    return '';
  }
}

async function fetchAgentsFromGHL(): Promise<CachedAgent[]> {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
      Version: '2021-07-28',
      Accept: 'application/json',
    },
  };

  const url = `https://services.leadconnectorhq.com/opportunities/search?location_id=${process.env.GHL_LOCATION_ID}&pipeline_id=${process.env.GHL_PIPELINE_ID}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`GHL search responded with status ${response.status}`);
  }

  const data = (await response.json()) as { opportunities?: GHLOpportunity[] };

  const availableStages = [
    process.env.GHL_AVAILABLE_STAGE_ID,
    process.env.GHL_AVAILABLE_TECH_STAGE_ID,
    process.env.GHL_AVAILABLE_SALES_STAGE_ID,
  ].filter((stage): stage is string => Boolean(stage));

  const filteredOpps =
    data.opportunities?.filter((opp) => availableStages.includes(opp.pipelineStageId)) || [];

  const agents = await Promise.all(
    filteredOpps.map(async (opp): Promise<CachedAgent> => {
      let rawVideoUrl = '';

      if (opp.contactId) {
        try {
          const contactRes = await fetch(
            `https://services.leadconnectorhq.com/contacts/${opp.contactId}`,
            options
          );

          if (contactRes.ok) {
            const contactData = (await contactRes.json()) as GHLContactResponse;
            const contactCustomFields = contactData.contact?.customFields || [];
            const videoField = contactCustomFields.find((f) => f.id === 'f2WEaWF6Fuq8sU1zKDcp');

            if (videoField) {
              rawVideoUrl = videoField.value || videoField.fieldValue || '';
            }
          }
        } catch (contactErr) {
          console.warn(`Failed to fetch contact ${opp.contactId}:`, contactErr);
        }
      }

      const embedUrl = getEmbedUrl(rawVideoUrl);
      const thumbnailUrl = await resolveThumbnailUrl(rawVideoUrl);

      let role = 'General VA';
      if (opp.pipelineStageId === process.env.GHL_AVAILABLE_TECH_STAGE_ID) {
        role = 'Tech VA';
      } else if (opp.pipelineStageId === process.env.GHL_AVAILABLE_SALES_STAGE_ID) {
        role = 'Cold Caller / Sales';
      }

      return {
        opportunityId: opp.id,
        contactId: opp.contactId,
        name: opp.name,
        role: role,
        stage: 'Available - ' + role,
        loomUrl: embedUrl,
        thumbnailUrl: thumbnailUrl || undefined,
      };
    })
  );

  return agents;
}

export async function GET(request: NextRequest) {
  // 1. Endpoint-level rate limit per IP
  const clientIp = getClientIp(request);
  const rateLimitResult = agentsRateLimiter.check(`agents:${clientIp}`);

  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests for talent listings. Please wait a moment.',
        retryAfter: rateLimitResult.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitResult.headers,
        },
      }
    );
  }

  try {
    // 2. In-memory TTL cache with stampede protection (60s TTL)
    // Prevents massive N+1 quota exhaustion on GHL API
    const agents = await agentsCache.getOrFetch('ghl_agents_pool', fetchAgentsFromGHL, 60 * 1000);

    return NextResponse.json(
      { agents },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          ...rateLimitResult.headers,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching agents from GHL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      {
        status: 500,
        headers: rateLimitResult.headers,
      }
    );
  }
}