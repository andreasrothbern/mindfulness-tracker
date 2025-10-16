// netlify/functions/motivational-coach.js
// Serverless Function für KI-Motivations-Coach

import Anthropic from '@anthropic-ai/sdk';

export default async (req, context) => {
  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Request Body parsen
    const { userMessage, context: userContext } = await req.json();

    // Claude Client initialisieren (API Key aus Environment Variable)
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY, // Sicher auf Server!
    });

    // System Prompt für Motivations-Coach
    const systemPrompt = `Du bist ein einfühlsamer Motivations-Coach für Menschen bei der Suchtbewältigung.

Deine Aufgaben:
- Ermutige den User positiv und verständnisvoll
- Gib praktische Tipps basierend auf dem Trigger-Tagebuch
- Erkenne Muster und weise darauf hin
- Feiere Erfolge und normalisiere Rückschläge
- Schlage konkrete Bewältigungsstrategien vor
- Bleibe unterstützend, nie urteilend

Kontext des Users (falls vorhanden):
${userContext ? JSON.stringify(userContext, null, 2) : 'Keine zusätzlichen Daten'}`;

    // Claude API Call
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Antwort zurückgeben
    return Response.json({
      success: true,
      response: message.content[0].text,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error('Claude API Error:', error);

    return Response.json(
      {
        success: false,
        error: 'Fehler beim Kontaktieren des Coaches. Bitte versuche es später erneut.',
      },
      { status: 500 }
    );
  }
};
