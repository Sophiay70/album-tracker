// Filters out singles from iTunes Search API album results.
// Singles are usually labeled "<Title> - Single" and/or have very few tracks,
// so EPs and full albums (trackCount > 2) are what's left.
export function filterAlbumsOnly(results) {
  return (results || []).filter(r => {
    const labeledSingle = /-\s*single$/i.test(r.collectionName?.trim() || '');
    const tooFewTracks = (r.trackCount || 0) <= 2;
    return !labeledSingle && !tooFewTracks;
  });
}
