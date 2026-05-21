import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const body = await req.json()

  const events = body.events

  for (const event of events) {
    if (event.type !== 'message') continue

    const userMessage = event.message.text
    const replyToken = event.replyToken

    // AI ตอบ
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
คุณคือ AI ผู้ช่วยการเงินสาวน่ารัก

กฎ:
- พูดภาษาไทย
- ตอบธรรมชาติ
- น่ารัก
- เป็นกันเอง
- ใช้ emoji เล็กน้อย
          `,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const aiReply =
      completion.choices[0].message.content ||
      'งื้ออ ตอบไม่ได้ 🥹'

    // ส่งกลับ LINE
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
            text: aiReply,
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