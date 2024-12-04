import { NextResponse } from 'next/server';
import { gitConfig } from '@/lib/git/config';

export async function GET() {
  const { clientId, redirectUri, scope } = gitConfig.github;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope.join(' '),
    response_type: 'code',
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
} 