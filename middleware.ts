import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware: propage l'identité vers les routes API via en-têtes x-user-*
// Hypothèse: votre mécanisme d'auth remplit des cookies 'auth_email' et 'auth_role'.
// Adaptez ces noms selon votre implémentation réelle.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // N'appliquer que pour les routes API
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Récupère le JWT NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const requestHeaders = new Headers(req.headers);
  if (token?.email && !requestHeaders.get('x-user-email')) {
    requestHeaders.set('x-user-email', token.email as string);
  }
  if ((token as any)?.role && !requestHeaders.get('x-user-role')) {
    requestHeaders.set('x-user-role', String((token as any).role));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/:path*'],
};
