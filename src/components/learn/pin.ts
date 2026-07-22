/** Bump when refreshing "In the code" deep links after a briefr docs/code cut. */
export const BRIEFR_DOCS_PIN = '04aba1ad17d18c1c45175881ceef56b7112abb36';

const GH = 'https://github.com/Soldier0x0/briefr';

export function briefrBlobUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/blob/${BRIEFR_DOCS_PIN}/${cleaned}`;
}

export function briefrTreeUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/tree/${BRIEFR_DOCS_PIN}/${cleaned}`;
}
