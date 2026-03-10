import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, city, surface, basePrice, extraInfo } = body;

        const prompt = `
      You are a professional real estate copywriter.
      Write a compelling, professional, and appealing office listing description in French.
      The description should be 2-3 short paragraphs, highlighting key features, ideal use case, and the atmosphere.
      Keep it concise and persuasive. Do NOT include any title or header, just the body text.
      
      Office Details:
      - Title: ${title || 'N/A'}
      - City: ${city || 'N/A'}
      - Surface: ${surface || 'N/A'} m²
      - Monthly base rent: ${basePrice || 'N/A'} €
      - Additional info provided by the agent: ${extraInfo || 'No additional info'}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const description = response.text?.trim() || '';
        return NextResponse.json({ description }, { status: 200 });
    } catch (error: any) {
        console.error('AI description error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
