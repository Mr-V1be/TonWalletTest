const TONVIEWER_TESTNET_URL =
  'https://testnet.tonviewer.com';

export function buildAddressExplorerUrl(address: string) {
  return `${TONVIEWER_TESTNET_URL}/${encodeURIComponent(address)}`;
}

export function buildTransactionExplorerUrl(hash: string) {
  return `${TONVIEWER_TESTNET_URL}/transaction/${encodeURIComponent(extractExplorerTransactionHash(hash))}`;
}

export function extractExplorerTransactionHash(
  hash: string,
) {
  return hash.split(':', 1)[0] ?? hash;
}
