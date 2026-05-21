import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { openai } from '../../../lib/openai'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const events = body.events

  for (const event of events) {
    if (event.type !== 'message') continue

    const userId = event.source.userId
    const text = event.message.text
    const replyToken = event.replyToken

    let reply = ''

    // รายจ่าย
    if (text.startsWith('รายจ่าย')) {
      const parts = text.split(' ')

      const amount = Number(parts[1])
      const note = parts.slice(2).join(' ')

      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'expense',
        amount,
        category: 'ทั่วไป',
        note,
      })

      reply = `โอเคค่าา 💸 บันทึกรายจ่าย ${amount} บาทเรียบร้อยแล้ว ✨`
    }

    // รายรับ
    else if (text.startsWith('รายรับ')) {
      const parts = text.split(' ')

      const amount = Number(parts[1])
      const note = parts.slice(2).join(' ')

      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'income',
        amount,
        category: 'ทั่วไป',
        note,
      })

      reply = `เย้ 💰 บันทึกรายรับ ${amount} บาทแล้วน้า ✨`
    }

    // สรุป
    else if (text === 'สรุป') {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)

      let income = 0
      let expense = 0

      data?.forEach((item) => {
        if (item.type === 'income') {
          income += Number(item.amount)
        }

        if (item.type === 'expense') {
          expense += Number(item.amount)
        }
      })

      reply =
        `📊 สรุปการเงิน\n\n` +
        `💰 รายรับ: ${income} บาท\n` +
        `💸 รายจ่าย: ${expense} บาท\n` +
        `✨ คงเหลือ: ${income - expense} บาท`
    }

    // AI CHAT
    else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `
คุณคือ AI ผู้ช่วยการเงินสาวน่ารัก

นิสัย:
- พูดธรรมชาติ
- เป็นกันเอง
- อ่อนโยน
- ใช้ emoji น่ารักเล็กน้อย
- ตอบภาษาไทย
            `,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      })

      reply =
        completion.choices[0].message.content ||
        'งื้ออ ตอบไม่ได้ 🥹'
    }

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
            text: reply,
          },
        ],
      }),
    })
  }

  return NextResponse.json({ ok: true })
}