// Translation providers do not answer cross-origin browser requests, so their
// calls go through a proxy. DatoCMS hosts cors-proxy.datocms.com for this, but
// it only answers for its own domains and for localhost: a self-hosted build is
// refused at the CORS preflight with a 403, which the editor shows as the
// unhelpful "Failed to fetch".
//
// A self-hosted build therefore proxies through its own origin instead, which
// makes the call same-origin and removes the preflight entirely. See
// netlify/functions/cors-proxy.js and the /api/* redirect in netlify.toml.
const DATOCMS_PROXY = 'https://cors-proxy.datocms.com'
const SELF_HOSTED_PROXY = '/api/cors-proxy'

export function isLocalDevelopment(): boolean {
  if (typeof window === 'undefined') {
    return true
  }
  const { hostname } = window.location
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

export function getProxiedUrl(targetUrl: string): URL {
  // During local development the plugin is served from localhost, which the
  // DatoCMS proxy does allow, and no local function is running to replace it.
  // The self-hosted path is relative, so it needs the current origin resolved
  // against it; the DatoCMS one is absolute and must not touch window, which
  // does not exist when these functions are exercised outside a browser.
  const proxyUrl = isLocalDevelopment()
    ? new URL(DATOCMS_PROXY)
    : new URL(SELF_HOSTED_PROXY, window.location.origin)

  proxyUrl.searchParams.set('url', targetUrl)

  return proxyUrl
}
