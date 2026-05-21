import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const events = body.events

  for (const event of events) {
    const replyToken = event.replyToken

    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [
          {
            type: 'text',
            text: 'บอทตอบแล้วน้า 🎉',
          },
        ],
      }),
    })
  }

  return NextResponse.json({
    success: true,
  })
}

export async function GET() {
  return NextResponse.json({
    success: true,
  })
}