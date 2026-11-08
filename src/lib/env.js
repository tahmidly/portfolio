import { env } from "cloudflare:workers";

// Runtime secrets and bindings (Cloudflare Workers). Set in production with
// `npx wrangler secret put <NAME>`; read locally from .env.local / .dev.vars.
export function getEnv(name) {
  return env[name];
}
