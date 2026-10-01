// ─────────────────────────────────────────────────────────────
//  Put files in  public/assets/images  and  public/assets/videos ,
//  then reference them WITHOUT "public": e.g. "assets/images/photo.jpg".
//  SELECTED WORK — add as many projects as you like.
//  Just add another { ... } block. Numbering (01, 02 …), the counter,
//  the loop and the slider all update automatically.
//
//  Required : title, category, desc
//  Optional : image  → "assets/images/my-project.jpg"   cover image
//             poster → "assets/images/my-poster.jpg"    shown before the video loads / fallback
//             video  → "assets/videos/my-project.mp4"   plays muted when it is the active project;
//                      when it genuinely ENDS the carousel moves to the next project
//  Broken/missing paths fall back to the gradient placeholder.
// ─────────────────────────────────────────────────────────────
export const projects = [
  { title: "Project One",   category: "VIDEO EDITING · MOTION",  desc: "A fast editorial system built around rhythm, pacing and a strong opening hook." },
  { title: "Project Two",   category: "SAAS · MOTION GRAPHICS",  desc: "A cinematic motion system for a digital product, built around clarity and controlled attention." },
  { title: "Project Three", category: "SOCIAL · VIDEO EDITING",  desc: "Short-form storytelling designed to make the first seconds impossible to scroll past." },
  { title: "Project Four",  category: "EXPLAINER · MOTION",      desc: "Complex product logic translated into a visual language that feels simple and alive." },
  { title: "Project Five",  category: "PRODUCT LAUNCH · MOTION", desc: "A launch film built around reveal, contrast and deliberate momentum." },
  { title: "Project Six",   category: "SOCIAL · MOTION",         desc: "A visual campaign system connecting typography, movement and sound-driven pacing." }
];
