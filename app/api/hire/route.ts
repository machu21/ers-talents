// app/api/hire/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opportunityId, clientName, clientEmail, companyName, notes } = body;

    const options = {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        pipelineStageId: process.env.GHL_REQUESTED_STAGE_ID,
        customFields: [
          { 
            id: 'VGYdUsXSkU4cNtfpJ026', 
            key: 'opportunity.onboarded_by__name', 
            field_value: clientName 
          },
          { 
            id: 'p5BukrIx54jCllAflRzw', 
            key: 'opportunity.onboarded_by__email', 
            field_value: clientEmail 
          },
          { 
            id: 'md44VQ5xQfwvuEbznZgG', 
            key: 'opportunity.client_company__notes', 
            field_value: `Company: ${companyName}\nNotes: ${notes}` 
          }
        ]
      })
    };

    const response = await fetch(`https://services.leadconnectorhq.com/opportunities/${opportunityId}`, options);
    
    if (!response.ok) {
      throw new Error(`GHL API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error updating GHL opportunity:', error);
    return NextResponse.json({ error: 'Failed to process hire request' }, { status: 500 });
  }
}