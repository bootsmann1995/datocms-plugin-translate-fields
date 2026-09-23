// DatoCMS provides cors-proxy.datocms.com for plugins that call a translation
// API from the browser, but it only answers for its own domains and localhost.
// A self-hosted build is refused at the CORS preflight, which surfaces in the
// editor as "Failed to fetch". This serves the same purpose from the origin the
// plugin itself is served from, so the browser makes a same-origin request and
// no preflight is involved.
//
// Only the translation providers below may be proxied. Without that check this
// would be an open proxy that anyone could point at any address.
const ALLOWED_HOSTS = [
  'api.deepl.com',
  'api-free.deepl.com',
  'api.openai.com',
  'translate.api.cloud.yandex.net',
  'www.supertext.com',
]

exports.handler = async function handler(event) {
  const target = event.queryStringParameters && event.queryStringParameters.url

  if (!target) {
    return { statusCode: 400, body: 'Missing url parameter' }
  }

  let parsed
  try {
    parsed = new URL(target)
  } catch (e) {
    return { statusCode: 400, body: 'Malformed url parameter' }
  }

  if (
    parsed.protocol !== 'https:' ||
    !ALLOWED_HOSTS.includes(parsed.hostname)
  ) {
    return { statusCode: 403, body: `Host not allowed: ${parsed.hostname}` }
  }

  // Forward only what the provider needs. Passing the incoming headers wholesale
  // would leak the caller's cookies and host header to a third party.
  const headers = {}
  for (const name of ['authorization', 'content-type']) {
    const value = event.headers[name] || event.headers[name.toLowerCase()]
    if (value) {
      headers[name] = value
    }
  }

  try {
    const response = await fetch(parsed.toString(), {
      method: event.httpMethod,
      headers,
      body: ['GET', 'HEAD'].includes(event.httpMethod) ? undefined : event.body,
    })

    const body = await response.text()

    return {
      statusCode: response.status,
      headers: {
        'content-type':
          response.headers.get('content-type') || 'application/json',
      },
      body,
    }
  } catch (error) {
    return {
      statusCode: 502,
      body: `Proxy request failed: ${error.message}`,
    }
  }
}
