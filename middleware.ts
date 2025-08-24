import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware: propage l'identité vers les routes API via en-têtes x-user-*
// Hypothèse: votre mécanisme d'auth remplit des cookies 'auth_email' et 'auth_role'.
// Adaptez ces noms selon votre implémentation réelle.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1) Protéger les pages Dashboard Agence
  if (pathname.startsWith('/dashboard/agence')) {
    // Non authentifié -> redirection vers login avec callback
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
      return NextResponse.redirect(loginUrl);
    }
    // Rôle incorrect -> redirection page d'accueil
    const role = (token as any)?.role;
    if (role !== 'Agence') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Autorisé
    return NextResponse.next();
  }

  // 2) Propager identité vers les routes API via en-têtes x-user-*
  if (pathname.startsWith('/api')) {
    const requestHeaders = new Headers(req.headers);
    if (token?.email && !requestHeaders.get('x-user-email')) {
      requestHeaders.set('x-user-email', token.email as string);
    }
    if ((token as any)?.role && !requestHeaders.get('x-user-role')) {
      requestHeaders.set('x-user-role', String((token as any).role));
    }
    if ((token as any)?.agenceId != null && !requestHeaders.get('x-user-agence-id')) {
      requestHeaders.set('x-user-agence-id', String((token as any).agenceId));
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/agence/:path*'],
};
