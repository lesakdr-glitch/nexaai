import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }

    // Enable streaming
    const response = await fetch('https://codex.sale/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...body,
        stream: true,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || `API error: ${response.status}` },
        { status: response.status }
      )
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('API route error:', error)
    
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Сервер занят, повторите попытку' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
