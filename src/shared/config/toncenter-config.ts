import { TonClient } from '@ton/ton';

export const toncenterConfig = {
  apiKey:
    import.meta.env.VITE_TONCENTER_API_KEY || '',
  v2Endpoint:
    import.meta.env.VITE_TONCENTER_V2_ENDPOINT ||
    'https://testnet.toncenter.com/api/v2/jsonRPC',
  v3Endpoint:
    import.meta.env.VITE_TONCENTER_V3_ENDPOINT ||
    'https://testnet.toncenter.com/api/v3',
};

export function createToncenterRpcClient() {
  return new TonClient({
    ...(toncenterConfig.apiKey
      ? { apiKey: toncenterConfig.apiKey }
      : {}),
    endpoint: toncenterConfig.v2Endpoint,
  });
}

export function buildToncenterHeaders() {
  if (!toncenterConfig.apiKey) {
    return undefined;
  }

  return {
    'X-API-Key': toncenterConfig.apiKey,
  };
}
