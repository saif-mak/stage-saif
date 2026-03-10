import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('plan') as File;

        if (!file) {
            return NextResponse.json({ error: 'No plan image provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = file.type;

        const prompt = `
            You are a real estate AI assistant. Your task is to extract information from the provided office floor plan.
            Analyze the plan and provide estimated details for a real estate listing.
            Return ONLY a raw, valid JSON object (no markdown formatting, no code blocks).
            If a piece of information cannot be determined exactly, make a realistic professional guess based on the visual layout.
            Ensure the JSON has EXACTLY these keys:
            - "title": A catchy title for the office based on what you see (e.g., "Grand Bureau Open Space Moderne").
            - "surface": Estimated total surface area in m2 as a number (e.g., 150). Try to calculate this by looking at room dimensions if available.
            - "basePrice": Estimated monthly rent in euros as a number (e.g., 2500). Estimate based on average office pricing and the quality/size shown.
            - "extractedDetails": A detailed text block listing all inferred surface areas from the plan (e.g., individual room surfaces, total estimated wall surface to paint, ceiling surface, number of windows, etc.). Present this beautifully in French with bullet points.
            - "description": A short, persuasive 2-paragraph description suitable for a listing, highlighting the layout, main rooms, and possibilities.

            Return ONLY the raw JSON string.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                { inlineData: { data: base64Data, mimeType } }
            ]
        });

        let jsonText = response.text?.trim() || '{}';

        // Clean up markdown code blocks if the AI still adds them despite instructions
        if (jsonText.startsWith('\`\`\`json')) {
            jsonText = jsonText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (jsonText.startsWith('\`\`\`')) {
            jsonText = jsonText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const data = JSON.parse(jsonText);

        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('Plan parsing error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
