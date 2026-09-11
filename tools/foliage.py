"""Reproducible foliage artwork. SVG outputs are generated data, not runtime game code."""

import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TREE_HEADER = """<svg xmlns="http://www.w3.org/2000/svg" width="320" height="300" viewBox="0 0 320 300">
<defs>
<filter id="pigment" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="8" result="noise"/>
<feColorMatrix in="noise" type="saturate" values="0" result="grey"/>
<feComponentTransfer in="grey" result="faded"><feFuncA type="linear" slope=".12"/></feComponentTransfer>
<feComposite in="faded" in2="SourceGraphic" operator="in" result="grain"/>
<feBlend in="SourceGraphic" in2="grain" mode="soft-light"/>
</filter>
<linearGradient id="trunk" x2="1" y2="0"><stop stop-color="#424637"/><stop offset=".45" stop-color="#9c9874"/><stop offset="1" stop-color="#505640"/></linearGradient>
</defs>
<g filter="url(#pigment)">
<ellipse cx="174" cy="273" rx="56" ry="14" fill="#132d26" opacity=".2"/>
<path d="M135 275q25-56 12-115l-44-43 14-7 40 31 10-77 12 8-4 76 52-38 10 10-62 51q-2 67 17 104l-27-11Z" fill="url(#trunk)"/>
<path d="M154 257l9-61-2-44m-8 1-40-40m57 40 54-37" fill="none" stroke="#b3ae88" stroke-width="3" opacity=".7"/>
<path d="M143 260l-25 14m59-15 28 15" stroke="#5f6547" stroke-width="5"/>
"""
CROWN = '<path d="M48 127q-34-14-5-40 3-26 47-28 1-27 52-22 43-22 74 7 45-5 55 34 35 30 6 51-25 18-58 12-42 32-80 9-50 20-91-23Z" fill="#344c36"/>'
COLORS = ["#2c4a32", "#3e5936", "#51663b", "#6c7d47", "#929456", "#afb274"]


def tree(rng: random.Random) -> str:
    parts = [TREE_HEADER, CROWN]
    for _ in range(1300):
        x = rng.uniform(20, 288)
        y = rng.uniform(36, 151)
        if ((x - 154) / 130) ** 2 + ((y - 94) / 61) ** 2 > 1:
            continue
        tone = int(max(0, min(5, (143 - y) / 21 + rng.uniform(-1, 1))))
        r = rng.uniform(2, 9)
        parts.append(
            f'<path d="M{x-r:.1f} {y:.1f}q{r/2:.1f} {-r:.1f} {r:.1f} {-r/2:.1f}'
            f'q{r*1.8:.1f} {r/2:.1f} {r/2:.1f} {r:.1f}'
            f'q{-r:.1f} {r:.1f} {-r*1.5:.1f} {-r/2:.1f}Z" fill="{COLORS[tone]}"/>'
        )
    return "\n".join(parts) + "\n</g>\n</svg>\n"


def shrub(rng: random.Random) -> str:
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="130" height="90" viewBox="0 0 130 90">',
        '<ellipse cx="65" cy="75" rx="54" ry="9" fill="#223c2b" opacity=".17"/>',
        '<path d="M28 77l8-49m-1 24L13 28m35 48L71 21m-8 34 36-26M71 78l36-22" '
        'fill="none" stroke="#716f49" stroke-width="3"/>',
    ]
    for _ in range(150):
        x = rng.gauss(65, 26)
        y = rng.gauss(49, 16)
        r = rng.uniform(1, 5)
        if x < 8 or x > 122 or y < 5 or y > 80:
            continue
        color = rng.choice(["#4b643a", "#73824b", "#9b9f61", "#c4b883"])
        parts.append(
            f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r:.1f}" ry="{r*.6:.1f}" fill="{color}"/>'
        )
    return "\n".join(parts) + "\n</svg>\n"


def build_foliage() -> None:
    rng = random.Random(339)
    (ROOT / "client/art/tree.svg").write_text(tree(rng), encoding="utf-8")
    (ROOT / "client/art/shrub.svg").write_text(shrub(rng), encoding="utf-8")
