/** Detect SVG sources after Docusaurus inlines them as data URIs. */
export function isSvgImageSrc(src: string | undefined): boolean {
  if (!src) return false;
  const normalized = src.split('?')[0]?.split('#')[0] ?? src;
  if (normalized.endsWith('.svg')) return true;
  return normalized.startsWith('data:image/svg+xml');
}
