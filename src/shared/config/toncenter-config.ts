import { TonClient } from '@ton/ton';

const TONCENTER_API_KEY_STORAGE_KEY =
  'ton-wallet:toncenter-api-key:v1';
const TONCENTER_API_KEY_PATTERN =
  /^[a-f0-9]{64}$/i;

const toncenterEnvConfig = {
  apiKey:
    import.meta.env.VITE_TONCENTER_API_KEY || '',
  v2Endpoint:
    import.meta.env.VITE_TONCENTER_V2_ENDPOINT ||
    'https://testnet.toncenter.com/api/v2/jsonRPC',
  v3Endpoint:
    import.meta.env.VITE_TONCENTER_V3_ENDPOINT ||
    'https://testnet.toncenter.com/api/v3',
};

export const toncenterConfig = {
  v2Endpoint:
    toncenterEnvConfig.v2Endpoint,
  v3Endpoint:
    toncenterEnvConfig.v3Endpoint,
};

export function createToncenterRpcClient() {
  const apiKey = readToncenterApiKey();

  return new TonClient({
    ...(apiKey ? { apiKey } : {}),
    endpoint: toncenterConfig.v2Endpoint,
  });
}

export function buildToncenterHeaders() {
  const apiKey = readToncenterApiKey();

  if (!apiKey) {
    return undefined;
  }

  return {
    'X-API-Key': apiKey,
  };
}

export function readStoredToncenterApiKey() {
  if (typeof window === 'undefined') {
    return '';
  }

  return (
    window.localStorage.getItem(
      TONCENTER_API_KEY_STORAGE_KEY,
    ) ?? ''
  );
}

export function readToncenterApiKeyState(): {
  apiKey: string;
  source: 'env' | 'local' | 'none';
} {
  const localApiKey = readStoredToncenterApiKey().trim();

  if (localApiKey) {
    return {
      apiKey: localApiKey,
      source: 'local',
    };
  }

  if (toncenterEnvConfig.apiKey) {
    return {
      apiKey: toncenterEnvConfig.apiKey,
      source: 'env',
    };
  }

  return {
    apiKey: '',
    source: 'none',
  };
}

export function readToncenterApiKey() {
  return readToncenterApiKeyState().apiKey;
}

export function saveToncenterApiKey(
  apiKey: string,
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    TONCENTER_API_KEY_STORAGE_KEY,
    apiKey.trim(),
  );
}

export function clearToncenterApiKey() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(
    TONCENTER_API_KEY_STORAGE_KEY,
  );
}

export function isToncenterApiKeyFormatValid(
  apiKey: string,
) {
  return TONCENTER_API_KEY_PATTERN.test(apiKey.trim());
}

export async function verifyToncenterApiKey(
  apiKey: string,
  signal?: AbortSignal,
) {
  const normalized = apiKey.trim();

  if (!normalized) {
    throw new Error(
      'TON Center API key is required.',
    );
  }

  if (!isToncenterApiKeyFormatValid(normalized)) {
    throw new Error(
      'TON Center API key must be 64 hex characters.',
    );
  }

  const response = await fetch(
    `${toncenterConfig.v3Endpoint}/masterchainInfo`,
    {
      headers: {
        'X-API-Key': normalized,
      },
      signal,
    },
  );

  if (response.ok) {
    return normalized;
  }

  if (response.status === 401) {
    throw new Error('TON Center API key is invalid.');
  }

  if (response.status === 403) {
    throw new Error(
      'TON Center API key is not allowed for testnet.',
    );
  }

  if (response.status === 429) {
    throw new Error(
      'TON Center is rate limiting requests. Try again in a few seconds.',
    );
  }

  throw new Error(
    'TON Center API key validation failed.',
  );
}
