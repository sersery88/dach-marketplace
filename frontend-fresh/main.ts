import { App, staticFiles } from 'fresh';
import type { State } from '@/utils.ts';

export const app = new App<State>({ root: import.meta.dirname })
  // Add static file serving middleware
  .use(staticFiles())
  // Global middleware for auth state
  .use(async (ctx) => {
    // Initialize auth state from cookie/header
    const authToken = ctx.req.headers.get('Authorization')?.replace('Bearer ', '') ||
      ctx.req.headers.get('Cookie')?.match(/auth_token=([^;]+)/)?.[1];

    ctx.state.isAuthenticated = !!authToken;
    ctx.state.authToken = authToken || null;

    return ctx.next();
  })
  // Enable file-system based routing
  .fsRoutes();

export default app;

