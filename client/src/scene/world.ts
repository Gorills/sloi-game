/** Authored visual-lab layout. This is not the server's map format or approved geography. */
export interface Position { x: number; y: number; }
export interface Prop extends Position {
  id: string; asset: string; scale: number; collision: number; canopy: boolean;
}
export const WORLD = { width: 2600, height: 1800 };
export const SPAWN: Position = { x: 1270, y: 1010 };
export const SUPPLY: Position = { x: 1120, y: 905 };
export const TARGET: Position = { x: 1660, y: 910 };
export const EXIT: Position = { x: 1810, y: 650 };
export const props: Prop[] = [
  { id: "forge", asset: "forge", x: 970, y: 795, scale: 1.18, collision: 100, canopy: true },
  { id: "lodge", asset: "lodge", x: 1350, y: 690, scale: 1.2, collision: 115, canopy: true },
  { id: "house-west", asset: "lodge", x: 640, y: 1080, scale: 1.16, collision: 110, canopy: true },
  { id: "house-east", asset: "forge", x: 1705, y: 1190, scale: 1, collision: 98, canopy: true },
  { id: "tower-left", asset: "tower", x: 1660, y: 615, scale: 1.05, collision: 45, canopy: true },
  { id: "tower-right", asset: "tower", x: 1865, y: 745, scale: 1.05, collision: 45, canopy: true },
  { id: "well", asset: "well", x: 1250, y: 805, scale: 1, collision: 42, canopy: true },
  { id: "supplies", asset: "crate", ...SUPPLY, scale: 1, collision: 28, canopy: false },
  { id: "crate-a", asset: "crate", x: 1065, y: 865, scale: 0.82, collision: 22, canopy: false },
  { id: "target", asset: "target", ...TARGET, scale: 1, collision: 22, canopy: false },
  { id: "lamp-forge", asset: "lamp", x: 1080, y: 812, scale: 1, collision: 6, canopy: false },
  { id: "lamp-gate", asset: "lamp", x: 1770, y: 800, scale: 1, collision: 6, canopy: false },
  { id: "fence-a", asset: "fence", x: 1560, y: 1000, scale: 1, collision: 0, canopy: false },
  { id: "fence-b", asset: "fence", x: 1720, y: 1000, scale: 1, collision: 0, canopy: false },
];
const smallProps: [string, string, number, number, number][] = [
  ["water-a", "barrel", 1173, 829, 1], ["water-b", "barrel", 1136, 807, 0.9],
  ["timber", "logs", 815, 811, 1], ["timber-east", "logs", 1800, 1195, 1],
  ["supply-cart", "cart", 1410, 800, 0.93], ["garden", "herbs", 686, 1080, 1.2],
  ["garden-east", "herbs", 1519, 1110, 1], ["shrub-a", "shrub", 864, 882, 1.2],
  ["shrub-b", "shrub", 954, 1220, 1.3], ["shrub-c", "shrub", 1530, 708, 1],
  ["shrub-d", "shrub", 1582, 451, 1.3], ["shrub-e", "shrub", 1538, 868, 0.8],
  ["shrub-f", "shrub", 790, 595, 1.3], ["shrub-g", "shrub", 795, 1210, 1.1],
];
smallProps.forEach(([id, asset, x, y, scale]) => props.push({id, asset, x, y, scale,
  collision: asset === "cart" ? 45 : asset === "barrel" ? 16 : 0, canopy: false}));
const trees: Position[] = [
  {x: 805, y: 635}, {x: 1030, y: 475}, {x: 1580, y: 420}, {x: 2010, y: 945},
  {x: 910, y: 1240}, {x: 1130, y: 1420}, {x: 700, y: 770}, {x: 2130, y: 520},
  {x: 1450, y: 1370}, {x: 2240, y: 1100}, {x: 775, y: 1520}, {x: 430, y: 740},
  {x: 1860, y: 440}, {x: 2080, y: 1280}, {x: 2300, y: 640}, {x: 1120, y: 390},
];
trees.forEach((p, i) => props.push({ id: `tree-${i}`, asset: i % 4 === 0 ? "gold-tree" : "tree",
  ...p, scale: 0.78 + i % 3 * 0.14, collision: 13, canopy: true }));
const stones: Position[] = [{x: 1500, y: 890}, {x: 1945, y: 665}, {x: 790, y: 980},
  {x: 1700, y: 465}, {x: 1960, y: 700}, {x: 860, y: 1150}, {x: 1430, y: 1180}];
stones.forEach((p, i) => props.push({ id: `rock-${i}`, asset: "rock", ...p,
  scale: 0.7 + i % 3 * 0.2, collision: 26, canopy: false }));

export function distance(a: Position, b: Position): number { return Math.hypot(a.x - b.x, a.y - b.y); }

export function blocked(p: Position): boolean {
  if (p.x < 350 || p.x > 2360 || p.y < 325 || p.y > 1600) return true;
  return props.some((item) => {
    if (!item.collision) return false;
    const rx = item.collision * item.scale + 10;
    const ry = item.asset === "forge" || item.asset === "lodge" || item.asset === "tower" ? rx * 0.57 : rx * 0.55;
    const cy = item.y - (item.asset === "forge" || item.asset === "lodge" ? 65 * item.scale : 10);
    return ((p.x - item.x) / rx) ** 2 + ((p.y - cy) / ry) ** 2 < 1;
  });
}
