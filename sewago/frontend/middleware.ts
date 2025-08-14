import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const needAuth = url.pathname.includes('/book') || url.pathname.startsWith('/bookings')
  const isAuthed = req.cookies.get('sg_session')
  
  if (needAuth && !isAuthed) {
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = { 
  matcher: ['/services/:path*/book', '/bookings'] 
}
