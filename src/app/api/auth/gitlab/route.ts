import { NextResponse } from 'next/server';
import { gitConfig } from '@/lib/git/config';

export async function GET() {
  const { clientId, redirectUri, scope } = gitConfig.gitlab;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope.join(' '),
    response_type: 'code',
  });

  return NextResponse.redirect(
    `https://gitlab.com/oauth/authorize?${params.toString()}`
  );
} 