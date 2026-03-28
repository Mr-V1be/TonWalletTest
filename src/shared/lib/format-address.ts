export function shortAddress(
  address: string,
  edge = 6,
) {
  if (!address || address === 'Unknown') {
    return 'Unknown';
  }

  return `${address.slice(0, edge)}...${address.slice(-edge)}`;
}
