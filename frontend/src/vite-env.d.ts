/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute base URL of the API for split-host deploys (Vercel + Render).
   *  Unset in local dev, where requests fall back to the "/api" proxy. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
