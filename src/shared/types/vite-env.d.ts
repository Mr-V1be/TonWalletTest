/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TONCENTER_API_KEY?: string;
  readonly VITE_TONCENTER_V2_ENDPOINT?: string;
  readonly VITE_TONCENTER_V3_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
