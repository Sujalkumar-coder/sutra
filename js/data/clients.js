// ─────────────────────────────────────────────────────────────
//  Put files in  public/assets/images  and  public/assets/videos ,
//  then reference them WITHOUT "public": e.g. "assets/images/photo.jpg".
//  SELECTED CLIENTS — add as many as you like (2 or 200).
//  The selector, the featured panel, the media frame, the counter and the
//  media archive are all generated from this list — no HTML editing.
//
//  name        (required)  shown as the big title
//  description (required)  short line under the title
//  tags        optional    e.g. ["Video", "Motion"]
//  year        optional    e.g. "2026"
//  image       optional    "assets/images/roosthaven.jpg"  → main photo
//  gallery     optional    ["assets/images/a.jpg", ...]    → extra media (thumbs)
//  logo        optional    "assets/images/roosthaven-logo.svg" → replaces the text title
//  url         optional    link shown as "View project"
//  Missing / broken images fall back to a clean placeholder automatically.
// ─────────────────────────────────────────────────────────────
export const clientsData = [
  { name: 'Roosthaven', description: 'Property, hospitality and digital storytelling.', tags: ['Video', 'Motion'], year: '2026', image: '', gallery: [] },
  { name: 'Elite Club',  description: 'Premium lifestyle and an exclusive member network.', tags: ['Social', 'Launch'], year: '2026', image: '', gallery: [] }
];
