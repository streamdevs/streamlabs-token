/// <reference types="vite/client" />
// @see https://vite.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
    VITE_CLIENT_ID: string | undefined;
    VITE_CLIENT_SECRET: string | undefined;
    VITE_REDIRECT_URI: string | undefined;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
