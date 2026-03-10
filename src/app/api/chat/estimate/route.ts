import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, officeSurface, officeCity, history } = body;

        if (!message || !officeSurface) {
            return NextResponse.json({ error: 'Message and officeSurface are required' }, { status: 400 });
        }

        // Build conversation thread for context
        const conversationThread = (history || [])
            .map((m: { role: string; text: string }) => `[${m.role === 'user' ? 'Client' : 'IA'}]: ${m.text}`)
            .join('\n');

        const prompt = `
      You are a renovation estimation assistant. The office has a total surface of ${officeSurface}m² (located in ${officeCity || 'France'}).

      === CONVERSATION HISTORY ===
      ${conversationThread || '(new conversation)'}
      === NEW CLIENT MESSAGE ===
      ${message}

      STRICT RULES:
      - Always reply in the SAME LANGUAGE as the client (detect it from their message).
      - Keep replies SHORT (max 4-5 lines each). No long paragraphs.
      - Read the FULL conversation history to know which step you are at. NEVER re-ask something already answered.

      EXACT STEP-BY-STEP FLOW YOU MUST FOLLOW:

      STEP A — Client describes a modification (e.g. "Je veux une cuisine"):
        Reply: "Bien sûr ! Sur quelle surface souhaitez-vous l'aménager ? (Surface totale du bureau : ${officeSurface}m²)"
        → Return estimatedPrice: 0

      STEP B — Client gives the surface in m²:
        Reply: List EXACTLY 3 of the most common materials for that modification, with price PER m².
        Format: 
        - Type 1 : XX€/m²
        - Type 2 : XX€/m²
        - Type 3 : XX€/m²
        "Lequel vous intéresse ? Ou indiquez-moi votre modèle spécifique."
        → Return estimatedPrice: 0

      STEP C — Client chooses a material or gives their model:
        Calculate: (chosen price per m²) × (surface given in step B) + labor costs (plomberie, maçonnerie, main-d'œuvre if applicable).
        Reply in this format ONLY:
        - Matériaux : X€
        - Main-d'œuvre : Y€
        - TOTAL : Z€
        "Souhaitez-vous ajouter cela à votre devis ? ✅ Oui / ❌ Non"
        → Return estimatedPrice: 0

      STEP D — Client says YES (oui/yes/ok/c'est bon):
        Reply: "✅ Parfait, [item] ajouté à votre devis pour [total]€."
        → Return estimatedPrice: Z (the total from Step C)

      STEP D — Client says NO (non/no/pas):
        Reply: "D'accord ! Avez-vous d'autres modifications à apporter à votre bureau ?"
        → Return estimatedPrice: 0

      Output ONLY valid JSON, no markdown:
      {
        "reply": "Short reply here",
        "itemName": "e.g. Cuisine 10m² - Carrelage",
        "estimatedPrice": 0
      }
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let aiText = response.text || '{}';
        aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            const parsedData = JSON.parse(aiText);
            return NextResponse.json(parsedData, { status: 200 });
        } catch (parseError) {
            console.error('Failed to parse AI estimate response as JSON:', aiText);
            return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in chat estimation API:', error);
        return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
    }
}
