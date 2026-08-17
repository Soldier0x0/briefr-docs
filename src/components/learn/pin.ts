/** Bump when refreshing "In the code" deep links after a briefr docs/code cut. */
export const BRIEFR_DOCS_PIN = 'de2dba9c5718af0990818f86d8aac41d9e29824c';

const GH = 'https://github.com/Soldier0x0/briefr';

export function briefrBlobUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/blob/${BRIEFR_DOCS_PIN}/${cleaned}`;
}

export function briefrTreeUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/tree/${BRIEFR_DOCS_PIN}/${cleaned}`;
}
