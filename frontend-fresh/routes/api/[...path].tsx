import { define } from '@/utils.ts';

const API_URL = Deno.env.get('API_URL') || 'http://localhost:8080/api/v1';

async function handleApiProxy(ctx: Parameters<Parameters<typeof define.handlers>[0]['GET']>[0]) {
  const path = ctx.params.path || '';
  const url = new URL(ctx.req.url);
  const targetUrl = `${API_URL}/${path}${url.search}`;

  // Get auth token from cookie
  const cookies = ctx.req.headers.get('cookie') || '';
  const authToken = cookies.split(';')
    .find(c => c.trim().startsWith('auth_token='))
    ?.split('=')[1];

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    const body = ctx.req.method !== 'GET' && ctx.req.method !== 'HEAD'
      ? await ctx.req.text()
      : undefined;

    const response = await fetch(targetUrl, {
      method: ctx.req.method,
      headers,
      body,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Backend nicht erreichbar'
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const handler = define.handlers({
  GET: handleApiProxy,
  POST: handleApiProxy,
  PUT: handleApiProxy,
  PATCH: handleApiProxy,
  DELETE: handleApiProxy,
});

