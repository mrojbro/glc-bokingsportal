const DEV_HUB_ORIGIN = 'http://localhost:5173'

/** URL back to the GLC Bokingsportal hub (works on GitHub Pages and local dev). */
export function getHubHomeHref(): string {
  const hubBase = import.meta.env.BASE_URL.replace(/\/[^/]+\/$/, '/')

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const { port } = window.location
    if (port && port !== '5173') {
      return new URL(hubBase, DEV_HUB_ORIGIN).href
    }
  }

  return hubBase
}
