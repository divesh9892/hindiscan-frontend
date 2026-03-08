import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Define the routes that DO NOT require authentication
// We leave the sign-in and sign-up pages open so users can actually log in!
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // 2. If the user is trying to access any route that is NOT public, lock it down.
  // The await auth.protect() command instantly redirects unauthenticated users to the sign-in page.
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

// 3. The Matcher Config (Enterprise standard routing rules)
export const config = {
  matcher: [
    // Skip Next.js internals and all static files (images, fonts, etc.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run the middleware for API routes so we can protect backend calls
    '/(api|trpc)(.*)',
  ],
}