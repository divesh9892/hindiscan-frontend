import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 1. Define the routes that DO NOT require authentication
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // 🚀 FIX 1: Await auth() to extract the userId safely
  const { userId } = await auth()

  // 2. Teleport logged-in users away from the public landing page
  if (userId && req.nextUrl.pathname === '/') {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // 3. Lock down protected routes
  if (!isPublicRoute(req)) {
    // 🚀 FIX 2: NO PARENTHESES! It is auth.protect(), not auth().protect()
    await auth.protect()
  }
})

// 4. The Matcher Config
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run the middleware for API routes
    '/(api|trpc)(.*)',
  ],
}