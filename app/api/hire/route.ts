import { NextRequest, NextResponse } from 'next/server';
import {
  hireRateLimiter,
  opportunityCooldownLimiter,
  getClientIp,
} from '@/lib/rate-limit';
import { agentsCache } from '@/lib/cache';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  // 1. Strict IP Rate Limit (5 requests per 15 minutes)
  const rateLimitResult = hireRateLimiter.check(`hire:${clientIp}`);
  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many hire requests submitted. Please wait before trying again.',
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
    const body = await request.json();
    const {
      opportunityId,
      clientName,
      clientEmail,
      companyName,
      notes = '',
      hp_website, // Honeypot field for bot detection
    } = body;

    // 2. Honeypot check: If the hidden field has any value, a bot filled it out
    if (hp_website && typeof hp_website === 'string' && hp_website.trim().length > 0) {
      console.warn(`[Bot Trap] Trapped bot submission from IP ${clientIp}`);
      // Return synthetic success without touching GoHighLevel
      return NextResponse.json(
        { success: true, message: 'Request processed' },
        { headers: rateLimitResult.headers }
      );
    }

    // 3. Strict Payload Validation & Sanitization
    if (!opportunityId || typeof opportunityId !== 'string' || opportunityId.trim().length < 3) {
      return NextResponse.json(
        { error: 'A valid candidate opportunity ID is required.' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    const trimmedName = typeof clientName === 'string' ? clientName.trim() : '';
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Please provide a valid name (2–100 characters).' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    const trimmedEmail = typeof clientEmail === 'string' ? clientEmail.trim().toLowerCase() : '';
    if (!trimmedEmail || trimmedEmail.length > 150 || !EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    const trimmedCompany = typeof companyName === 'string' ? companyName.trim() : '';
    if (trimmedCompany.length < 1 || trimmedCompany.length > 100) {
      return NextResponse.json(
        { error: 'Please provide a company name (1–100 characters).' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    const sanitizedNotes = typeof notes === 'string' ? notes.trim().slice(0, 2000) : '';

    // 4. Per-Opportunity Cooldown Check
    // Prevents race conditions or repeated requests hijacking the same candidate simultaneously
    const oppCooldown = opportunityCooldownLimiter.check(`opp:${opportunityId}`);
    if (!oppCooldown.success) {
      return NextResponse.json(
        {
          error:
            'A hire request for this candidate was recently submitted and is pending review. Please choose another candidate or wait a moment.',
        },
        { status: 409, headers: rateLimitResult.headers }
      );
    }

    // 5. Send update to GoHighLevel
    const options = {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        pipelineStageId: process.env.GHL_REQUESTED_STAGE_ID,
        customFields: [
          {
            id: 'VGYdUsXSkU4cNtfpJ026',
            key: 'opportunity.onboarded_by__name',
            field_value: trimmedName,
          },
          {
            id: 'p5BukrIx54jCllAflRzw',
            key: 'opportunity.onboarded_by__email',
            field_value: trimmedEmail,
          },
          {
            id: 'md44VQ5xQfwvuEbznZgG',
            key: 'opportunity.client_company__notes',
            field_value: `Company: ${trimmedCompany}\nNotes: ${sanitizedNotes}`,
          },
        ],
      }),
    };

    const response = await fetch(
      `https://services.leadconnectorhq.com/opportunities/${opportunityId}`,
      options
    );

    if (!response.ok) {
      throw new Error(`GHL API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // 6. Invalidate agent cache so public listing reflects candidate removal
    agentsCache.invalidate('ghl_agents_pool');

    return NextResponse.json(
      { success: true, data },
      { headers: rateLimitResult.headers }
    );
  } catch (error) {
    console.error('Error updating GHL opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to process hire request. Please try again later.' },
      { status: 500, headers: rateLimitResult.headers }
    );
  }
}