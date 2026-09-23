// Capt. Locke and friends, as pixel grids. One character = one pixel.
//   "#" ink   "." paper   "h" heart   " " transparent
export type Sprite = readonly string[];

// Traced from capt-locke.svg (40px grid). Faces left; tail on the right.
export const GHOST: Sprite = [
  "     ####      ",
  "    ######     ",
  "   ##.#.###    ",
  " #####.######  ",
  "#####.#.###### ",
  "############## ",
  "  #..#.#...#   ",
  "  #..#.#...# ##",
  "  #........##.#",
  "  #.#####.....#",
  "  ###...##...# ",
  "   ##########  ",
];

export type Eyes = "open" | "wink";

export function ghostFrame(eyes: Eyes): Sprite {
  if (eyes === "open") return GHOST;
  const rows = [...GHOST];
  rows[6] = rows[6].slice(0, 7) + "." + rows[6].slice(8);
  return rows;
}

// A lowercase u for a hull, 21 wide: two stems and a bowl. Its right stem
// carries the mast and drops into a rudder. Paper-filled so Capt. Locke sits
// down inside it.
export const HULL: Sprite = [
  "##                 ##",
  "#####################",
  "#...................#",
  " #.................##",
  "  #...............# #",
  "   ################ #",
];

export const HULL_W = 21;
export const MAST_X = 19;

export const FLAG: readonly Sprite[] = [
  ["#####", "#.#.#", "##.##", "#.#.#", "#####"],
  ["#### ", "#.#.#", "##.##", "#.#.#", "#### "],
];

// Spyglass, relative to the ghost's origin (left-facing). It sits under the
// hat brim and tilts up toward the wordmark.
export const SPYGLASS_SHORT: readonly [x: number, y: number, w: number, h: number][] = [
  [1, 7, 4, 1],
  [0, 6, 1, 3],
];
export const SPYGLASS_LONG: readonly [x: number, y: number, w: number, h: number][] = [
  [0, 7, 5, 1],
  [-4, 6, 4, 1],
  [-5, 5, 1, 3],
];

export const HEART: readonly Sprite[] = [
  ["h h", " h "],
  [" h h ", "hhhhh", " hhh ", "  h  "],
];
