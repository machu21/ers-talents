import { NextResponse } from 'next/server';

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
    } catch (error) {
        return url;
    }
}

export async function GET() {
    const options = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
            Version: '2021-07-28',
            Accept: 'application/json'
        }
    };

    try {
        const url = `https://services.leadconnectorhq.com/opportunities/search?location_id=${process.env.GHL_LOCATION_ID}&pipeline_id=${process.env.GHL_PIPELINE_ID}`;
        const response = await fetch(url, options);
        const data = await response.json();

        const availableStages = [
            process.env.GHL_AVAILABLE_STAGE_ID,
            process.env.GHL_AVAILABLE_TECH_STAGE_ID,
            process.env.GHL_AVAILABLE_SALES_STAGE_ID
        ];

        const filteredOpps = data.opportunities?.filter((opp: any) => availableStages.includes(opp.pipelineStageId)) || [];
        
        const agents = await Promise.all(
            filteredOpps.map(async (opp: any) => {
                let rawVideoUrl = '';
                
                if (opp.contactId) {
                    const contactRes = await fetch(`https://services.leadconnectorhq.com/contacts/${opp.contactId}`, options);
                    
                    if (contactRes.ok) {
                        const contactData = await contactRes.json();
                        const contactCustomFields = contactData.contact?.customFields || [];
                        

                        // TODO: Once you see the ID in the console, replace 'YOUR_ID_HERE' with it
                        const videoField = contactCustomFields.find((f: any) => f.id === 'f2WEaWF6Fuq8sU1zKDcp');
                        
                        if (videoField) {
                            rawVideoUrl = videoField.value || videoField.fieldValue || '';
                        }
                    }
                }

                const embedUrl = getEmbedUrl(rawVideoUrl);

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
                    loomUrl: embedUrl 
                };
            })
        );

        return NextResponse.json({ agents });
    } catch (error) {
        console.error('Error fetching from GHL:', error);
        return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }
}