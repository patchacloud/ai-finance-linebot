import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.log(body)

  return NextResponse.json({
    ok: true,
  })
}

export async function GET() {
  return NextResponse.json({
    ok: true,
  })
}