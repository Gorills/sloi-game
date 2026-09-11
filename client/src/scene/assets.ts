import { barrel, logPile, cart, herbBed } from "@sloi/scene/art/workshop";
import { house, gateTower } from "@sloi/scene/art/building";
import { tree, rock, shrub } from "@sloi/scene/art/nature";
import { fence, lantern, practiceTarget, supplyCrate, well } from "@sloi/scene/art/props";
import { traveller } from "@sloi/scene/art/actor";
import { terrain } from "@sloi/scene/art/terrain";
import type { Sprite } from "@sloi/scene/art/drawing";
export interface Assets {
  ground: HTMLCanvasElement; objects: ReadonlyMap<string, Sprite>; actors: readonly Sprite[][];
}
export function makeAssets(): Assets {
  const objects = new Map<string, Sprite>([
    ["barrel", barrel()], ["logs", logPile()], ["cart", cart()], ["herbs", herbBed()],
    ["forge", house("forge")], ["lodge", house("lodge")], ["tower", gateTower()],
    ["tree", tree(92)], ["gold-tree", tree(41, true)], ["rock", rock(1)], ["shrub", shrub(5)],
    ["crate", supplyCrate()], ["target", practiceTarget()], ["lamp", lantern()], ["well", well()], ["fence", fence()],
  ]);
  return { ground: terrain(), objects,
    actors: Array.from({length: 8}, (_, d) => Array.from({length: 6}, (_, f) => traveller(d, f))) };
}
