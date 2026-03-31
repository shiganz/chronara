import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  return NextResponse.json(
    {
      ok: true,
      received: body
    },
    { status: 200 }
  );
}
