/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by src/middleware.js for /admin and /api/admin requests. */
    isAdmin: boolean;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_GITHUB_USERNAME?: string;
}
