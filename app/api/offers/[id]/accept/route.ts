import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return NextResponse.json({
    ok: true,
    message: "offer accept route placeholder",
    offerId: id,
  });
}