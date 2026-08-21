/** Bump when refreshing "In the code" deep links after a briefr docs/code cut. */
export const BRIEFR_DOCS_PIN = 'e6c6929d4239d1b4213c92847be0dec6df13e8da';

const GH = 'https://github.com/Soldier0x0/briefr';

export function briefrBlobUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/blob/${BRIEFR_DOCS_PIN}/${cleaned}`;
}

export function briefrTreeUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/tree/${BRIEFR_DOCS_PIN}/${cleaned}`;
}
