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
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: gitConfig.github.clientId,
        client_secret: gitConfig.github.clientSecret,
        code,
        redirect_uri: gitConfig.github.redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to get access token' },
        { status: 400 }
      );
    }

    // Initialize GitHub service with the access token
    const gitService = await GitServiceFactory.getInstance().getService('github', {
      ...gitConfig.github,
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
    redirectUrl.searchParams.set('github_connected', 'true');
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to process GitHub authentication' },
      { status: 500 }
    );
  }
} 