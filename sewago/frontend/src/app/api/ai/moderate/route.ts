import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // If no API key, allow content (fail-safe)
      return NextResponse.json({ safe: true });
    }
    
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content
      })
    });
    
    if (!response.ok) {
      return NextResponse.json({ safe: true }); // Allow content if moderation fails
    }
    
    const data = await response.json();
    const results = data.results[0];
    
    // Check if content is flagged
    const isSafe = !results.flagged;
    
    return NextResponse.json({ safe: isSafe });
    
  } catch (error) {
    console.error('AI moderation API error:', error);
    return NextResponse.json({ safe: true }); // Allow content if moderation fails
  }
}
