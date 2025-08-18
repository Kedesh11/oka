import { NextRequest, NextResponse } from 'next/server';
import { getRequesterFromHeaders } from '@/server/auth/requester';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const requester = await getRequesterFromHeaders(req.headers);
    return NextResponse.json({
      email: requester.email || null,
      role: requester.role,
      agenceId: requester.agenceId ?? null,
      isAgencyOwner: requester.isAgencyOwner || false,
      userId: requester.userId || null,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
