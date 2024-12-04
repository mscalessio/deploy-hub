import { NextRequest, NextResponse } from 'next/server';
import { gitConfig } from '@/lib/git/config';
import { GitServiceFactory } from '@/lib/git/git-service-factory';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'No code provided' },
      { status: 400 }
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://gitlab.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: gitConfig.gitlab.clientId,
        client_secret: gitConfig.gitlab.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: gitConfig.gitlab.redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to get access token' },
        { status: 400 }
      );
    }

    // Initialize GitLab service with the access token
    const gitService = await GitServiceFactory.getInstance().getService('gitlab', {
      ...gitConfig.gitlab,
      clientSecret: tokenData.access_token,
    });

    // Get user information
    const user = await gitService.getCurrentUser();

    // Here you would typically:
    // 1. Store the access token securely
    // 2. Associate it with the user's account
    // 3. Redirect to the appropriate page in your application

    // For now, we'll just redirect to the home page with a success message
    const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('gitlab_connected', 'true');
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('GitLab OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to process GitLab authentication' },
      { status: 500 }
    );
  }
} 