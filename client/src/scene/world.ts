/** One authored art-study location; its layout is not a canonical map of Kadiya. */
export interface Point {
    x: number;
    y: number;
}
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface Prop extends Point {
    art: string;
    w: number;
    h: number;
    foot: number;
    solid?: Rect;
}
export const WORLD = { w: 2300, h: 1500 };
export const START: Point = { x: 1080, y: 880 };
export const CACHE: Point = { x: 928, y: 850 };
export const TARGET: Point = { x: 1560, y: 860 };
export const SPEED = 220;
export const RADIUS = 13;
export const PROPS: Prop[] = [
    { art: 'house', x: 375, y: 725, w: 410, h: 362, foot: 340,
        solid: { x: 220, y: 644, w: 298, h: 81 } },
    { art: 'forge', x: 865, y: 618, w: 420, h: 350, foot: 323,
        solid: { x: 696, y: 534, w: 323, h: 83 } },
    { art: 'house', x: 617, y: 1165, w: 365, h: 322, foot: 302,
        solid: { x: 480, y: 1100, w: 255, h: 65 } },
    { art: 'gate', x: 1300, y: 663, w: 290, h: 350, foot: 320,
        solid: { x: 1167, y: 593, w: 75, h: 62 } },
    { art: 'wall', x: 1077, y: 738, w: 240, h: 222, foot: 204,
        solid: { x: 972, y: 712, w: 218, h: 28 } },
    { art: 'wall', x: 1518, y: 566, w: 240, h: 222, foot: 204,
        solid: { x: 1412, y: 530, w: 219, h: 37 } },
    { art: 'wall', x: 1722, y: 507, w: 240, h: 222, foot: 204,
        solid: { x: 1617, y: 471, w: 218, h: 37 } },
    { art: 'wagon', x: 789, y: 752, w: 190, h: 143, foot: 130,
        solid: { x: 745, y: 721, w: 89, h: 34 } },
    { art: 'crate', ...CACHE, w: 110, h: 97, foot: 91,
        solid: { x: 891, y: 820, w: 77, h: 31 } },
    { art: 'crate', x: 822, y: 640, w: 75, h: 66, foot: 61 },
    { art: 'dummy', ...TARGET, w: 110, h: 154, foot: 145,
        solid: { x: 1548, y: 842, w: 24, h: 23 } },
    { art: 'tree', x: 415, y: 1060, w: 310, h: 290, foot: 266,
        solid: { x: 408, y: 1042, w: 19, h: 24 } },
    { art: 'tree', x: 1070, y: 1160, w: 365, h: 342, foot: 314,
        solid: { x: 1061, y: 1148, w: 24, h: 29 } },
    { art: 'tree', x: 1590, y: 1130, w: 355, h: 332, foot: 305,
        solid: { x: 1580, y: 1118, w: 24, h: 29 } },
    { art: 'tree', x: 1890, y: 760, w: 330, h: 309, foot: 284,
        solid: { x: 1880, y: 748, w: 24, h: 29 } },
    { art: 'tree', x: 441, y: 358, w: 410, h: 384, foot: 352 },
    { art: 'tree', x: 128, y: 878, w: 390, h: 366, foot: 336 },
    { art: 'tree', x: 2050, y: 1255, w: 390, h: 366, foot: 336 },
    { art: 'rocks', x: 1750, y: 990, w: 140, h: 90, foot: 80,
        solid: { x: 1710, y: 960, w: 86, h: 31 } },
    { art: 'rocks', x: 1717, y: 1014, w: 71, h: 46, foot: 41 },
    { art: 'rocks', x: 1130, y: 457, w: 105, h: 68, foot: 61 },
];
PROPS.push({ art: 'shrub', x: 955, y: 1118, w: 122, h: 84, foot: 73 }, { art: 'shrub', x: 550, y: 785, w: 140, h: 97, foot: 84 }, { art: 'shrub', x: 1755, y: 961, w: 102, h: 71, foot: 63 }, { art: 'shrub', x: 1660, y: 594, w: 155, h: 107, foot: 94 }, { art: 'shrub', x: 1290, y: 973, w: 94, h: 65, foot: 55 }, { art: 'shrub', x: 305, y: 1159, w: 134, h: 93, foot: 81 });
export const SOLIDS: Rect[] = PROPS.flatMap(prop => prop.solid ? [prop.solid] : []);
// The second gate pier: a passable opening between two independent footprints.
SOLIDS.push({ x: 1347, y: 553, w: 69, h: 73 });
export const ROAD: Point[] = [
    { x: 20, y: 1000 }, { x: 410, y: 881 }, { x: 880, y: 953 },
    { x: 1170, y: 851 }, { x: 1304, y: 736 }, { x: 1530, y: 711 },
    { x: 1840, y: 704 }, { x: 2300, y: 350 },
];
export function distance(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
export function blocked(p: Point): boolean {
    if (p.x < RADIUS || p.y < RADIUS || p.x > WORLD.w - RADIUS || p.y > WORLD.h - RADIUS)
        return true;
    return SOLIDS.some(r => Math.hypot(p.x - Math.max(r.x, Math.min(p.x, r.x + r.w)), p.y - Math.max(r.y, Math.min(p.y, r.y + r.h))) < RADIUS);
}
export function clearShot(a: Point, b: Point): boolean {
    const steps = Math.ceil(distance(a, b) / 8);
    for (let i = 1; i < steps - 3; i++) {
        const p = { x: a.x + (b.x - a.x) * i / steps, y: a.y + (b.y - a.y) * i / steps };
        if (blocked(p))
            return false;
    }
    return true;
}
