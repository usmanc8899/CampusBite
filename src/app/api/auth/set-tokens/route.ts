import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { access, refresh } = await request.json()

    const cookieStore = await cookies()
    
    // Access token: regular cookie (needs to be readable by client for API calls)
    cookieStore.set('access_token', access, {
      httpOnly: false, // Must be false so client can read it for API calls
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    // Refresh token: httpOnly cookie (more secure, only used server-side)
    cookieStore.set('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set tokens' }, { status: 500 })
  }
}

