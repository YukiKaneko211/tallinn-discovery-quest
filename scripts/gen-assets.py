#!/usr/bin/env python3
"""Generate placeholder SVG art assets for Tallinn Stamp Rally.

Produces:
  public/assets/spots/spot_thumb_<slug>.svg
  public/assets/stamps/stamp_checkedin_<slug>.svg
  public/assets/stamps/stamp_thumb_empty.svg
  public/assets/stamps/stamp_uncheckedin.svg
  public/assets/decos/deco_<id>.svg
"""
import os, math, json

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PUB = os.path.join(ROOT, "public", "assets")

SPOTS = [
    # slug, display name, shape kind, palette (sky top, sky bottom, building, roof, accent)
    ("tallinn-town-hall",      "Tallinn Town Hall",       "towerhall", ("#bfe3ff", "#eaf6ff", "#f2e9d8", "#c0392b", "#0072ce")),
    ("st-olafs-church",        "St. Olaf's Church",       "spire",     ("#c9e2ff", "#f0f7ff", "#e8e2d4", "#2d6a4f", "#0072ce")),
    ("viru-gate",              "Viru Gate",               "twintower", ("#ffe3c2", "#fff6ea", "#e6dccb", "#a63c2f", "#0072ce")),
    ("toompea-castle",         "Toompea Castle",          "castle",    ("#cfe6ff", "#f2f8ff", "#eadfcb", "#8c4a3a", "#0072ce")),
    ("alexander-nevsky",       "Alexander Nevsky Cathedral", "onion",  ("#d8e8ff", "#f6faff", "#f4ece0", "#2f4858", "#0072ce")),
    ("niguliste-church",       "Niguliste Church",        "spire",     ("#d6e8d8", "#f4fbf5", "#ece5d6", "#3d5a45", "#0072ce")),
    ("kiek-in-de-kok",         "Kiek in de Kok",          "roundtower",("#ffe8d6", "#fff8f0", "#e3d7c3", "#9c3b2e", "#0072ce")),
    ("fat-margaret",           "Fat Margaret Tower",      "roundtower",("#cde8f5", "#f2fbff", "#e0d5c1", "#7a3b2e", "#0072ce")),
    ("kohtuotsa-platform",     "Kohtuotsa Platform",      "skyline",   ("#ffd9c2", "#fff2e6", "#e9dfd0", "#b8452f", "#0072ce")),
    ("great-guild-hall",       "Great Guild Hall",        "gable",     ("#dfe6ff", "#f5f7ff", "#f0e6d6", "#3a4a7a", "#0072ce")),
    ("holy-spirit-church",     "Holy Spirit Church",      "clock",     ("#e2e0ff", "#f7f6ff", "#efe5d5", "#4a3f6b", "#0072ce")),
    ("katariina-kaik",         "St. Catherine's Passage", "arch",      ("#e8ddc8", "#faf5ea", "#ded2bd", "#6b5136", "#0072ce")),
]


def shape(kind, b, r):
    """Return SVG markup for a building silhouette. b=building color, r=roof color."""
    if kind == "towerhall":
        return f'''
    <rect x="70" y="200" width="260" height="150" fill="{b}"/>
    <path d="M60 200 L200 150 L340 200 Z" fill="{r}"/>
    <rect x="180" y="60" width="40" height="150" fill="{b}"/>
    <path d="M172 62 L200 10 L228 62 Z" fill="{r}"/>
    <circle cx="200" cy="14" r="7" fill="#e0b73a"/>
    <rect x="188" y="95" width="24" height="24" rx="3" fill="#fff" opacity=".75"/>
    <g fill="#fff" opacity=".7">
      <rect x="100" y="240" width="26" height="46" rx="13"/>
      <rect x="150" y="240" width="26" height="46" rx="13"/>
      <rect x="224" y="240" width="26" height="46" rx="13"/>
      <rect x="274" y="240" width="26" height="46" rx="13"/>
    </g>'''
    if kind == "spire":
        return f'''
    <rect x="90" y="210" width="220" height="140" fill="{b}"/>
    <path d="M80 210 L200 165 L320 210 Z" fill="{r}"/>
    <rect x="175" y="80" width="50" height="135" fill="{b}"/>
    <path d="M165 82 L200 0 L235 82 Z" fill="{r}"/>
    <g fill="#fff" opacity=".7">
      <path d="M118 250 h30 v60 h-30 z" />
      <path d="M258 250 h30 v60 h-30 z" />
      <path d="M186 250 h28 v60 h-28 z" />
    </g>'''
    if kind == "twintower":
        return f'''
    <rect x="60" y="140" width="70" height="210" fill="{b}"/>
    <rect x="270" y="140" width="70" height="210" fill="{b}"/>
    <path d="M52 142 L95 70 L138 142 Z" fill="{r}"/>
    <path d="M262 142 L305 70 L348 142 Z" fill="{r}"/>
    <rect x="130" y="230" width="140" height="120" fill="{b}" opacity=".85"/>
    <path d="M155 350 v-70 a45 45 0 0 1 90 0 v70 z" fill="#4a3a2a"/>
    <g fill="#fff" opacity=".7">
      <rect x="82" y="180" width="26" height="34" rx="13"/>
      <rect x="292" y="180" width="26" height="34" rx="13"/>
    </g>'''
    if kind == "castle":
        return f'''
    <rect x="60" y="200" width="280" height="150" fill="{b}"/>
    <rect x="250" y="90" width="72" height="260" fill="{b}"/>
    <path d="M242 92 L286 30 L330 92 Z" fill="{r}"/>
    <g fill="{b}">
      <rect x="60" y="180" width="26" height="24"/><rect x="112" y="180" width="26" height="24"/>
      <rect x="164" y="180" width="26" height="24"/><rect x="216" y="180" width="26" height="24"/>
    </g>
    <g fill="#fff" opacity=".7">
      <rect x="100" y="245" width="24" height="40" rx="12"/>
      <rect x="160" y="245" width="24" height="40" rx="12"/>
      <rect x="274" y="150" width="24" height="36" rx="12"/>
    </g>'''
    if kind == "onion":
        return f'''
    <rect x="80" y="215" width="240" height="135" fill="{b}"/>
    <path d="M200 60 c46 34 46 92 0 92 c-46 0 -46 -58 0 -92 z" fill="{r}"/>
    <path d="M110 150 c30 22 30 60 0 60 c-30 0 -30 -38 0 -60 z" fill="{r}"/>
    <path d="M290 150 c30 22 30 60 0 60 c-30 0 -30 -38 0 -60 z" fill="{r}"/>
    <rect x="188" y="150" width="24" height="70" fill="{b}"/>
    <rect x="100" y="205" width="20" height="16" fill="{b}"/>
    <rect x="280" y="205" width="20" height="16" fill="{b}"/>
    <g fill="#fff" opacity=".7">
      <rect x="130" y="250" width="26" height="52" rx="13"/>
      <rect x="187" y="250" width="26" height="52" rx="13"/>
      <rect x="244" y="250" width="26" height="52" rx="13"/>
    </g>'''
    if kind == "roundtower":
        return f'''
    <path d="M120 350 v-160 a80 80 0 0 1 160 0 v160 z" fill="{b}"/>
    <path d="M104 196 L200 110 L296 196 Z" fill="{r}"/>
    <rect x="60" y="290" width="60" height="60" fill="{b}" opacity=".8"/>
    <rect x="280" y="290" width="60" height="60" fill="{b}" opacity=".8"/>
    <g fill="#fff" opacity=".7">
      <rect x="150" y="230" width="24" height="40" rx="12"/>
      <rect x="226" y="230" width="24" height="40" rx="12"/>
      <rect x="188" y="290" width="24" height="60" rx="12"/>
    </g>'''
    if kind == "skyline":
        return f'''
    <rect x="30" y="250" width="80" height="100" fill="{b}"/>
    <path d="M22 252 L70 210 L118 252 Z" fill="{r}"/>
    <rect x="130" y="220" width="70" height="130" fill="{b}"/>
    <path d="M122 222 L165 175 L208 222 Z" fill="{r}"/>
    <rect x="220" y="245" width="60" height="105" fill="{b}"/>
    <path d="M212 247 L250 205 L288 247 Z" fill="{r}"/>
    <rect x="300" y="150" width="46" height="200" fill="{b}"/>
    <path d="M292 152 L323 95 L354 152 Z" fill="{r}"/>
    <g fill="#fff" opacity=".65">
      <rect x="52" y="280" width="18" height="30"/><rect x="150" y="255" width="18" height="30"/>
      <rect x="240" y="278" width="18" height="30"/><rect x="314" y="190" width="18" height="30"/>
    </g>'''
    if kind == "gable":
        return f'''
    <path d="M90 350 V150 L200 70 L310 150 V350 Z" fill="{b}"/>
    <path d="M80 152 L200 62 L320 152 Z" fill="{r}"/>
    <g fill="#fff" opacity=".7">
      <rect x="120" y="200" width="30" height="44" rx="6"/>
      <rect x="185" y="200" width="30" height="44" rx="6"/>
      <rect x="250" y="200" width="30" height="44" rx="6"/>
    </g>
    <rect x="170" y="280" width="60" height="70" rx="6" fill="#5a3f28"/>'''
    if kind == "clock":
        return f'''
    <rect x="95" y="205" width="210" height="145" fill="{b}"/>
    <path d="M85 207 L200 160 L315 207 Z" fill="{r}"/>
    <rect x="172" y="70" width="56" height="140" fill="{b}"/>
    <path d="M162 72 L200 8 L238 72 Z" fill="{r}"/>
    <circle cx="200" cy="120" r="24" fill="#fdf7e6" stroke="#c9a227" stroke-width="5"/>
    <path d="M200 120 V104 M200 120 L212 128" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/>
    <g fill="#fff" opacity=".7">
      <rect x="126" y="248" width="26" height="46" rx="13"/>
      <rect x="248" y="248" width="26" height="46" rx="13"/>
    </g>'''
    # arch
    return f'''
    <rect x="40" y="90" width="320" height="260" fill="{b}"/>
    <path d="M120 350 V210 a80 80 0 0 1 160 0 v140 z" fill="#3a2f22"/>
    <path d="M120 350 V212 a80 80 0 0 1 160 0 v138 z" fill="#6b563c" opacity=".55"/>
    <g stroke="{r}" stroke-width="6" opacity=".55" fill="none">
      <path d="M40 150 H360"/><path d="M40 120 H360"/>
    </g>
    <circle cx="200" cy="250" r="26" fill="#ffd166" opacity=".55"/>'''


def spot_thumb(slug, name, kind, pal):
    top, bot, b, r, acc = pal
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="{name}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{top}"/><stop offset="100%" stop-color="{bot}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#sky)"/>
  <circle cx="330" cy="70" r="34" fill="#fff" opacity=".55"/>
  <g opacity=".5" fill="#ffffff">
    <ellipse cx="90" cy="90" rx="46" ry="20"/><ellipse cx="130" cy="80" rx="34" ry="16"/>
  </g>
  {shape(kind, b, r)}
  <rect y="350" width="400" height="50" fill="#7a8b6f"/>
  <rect y="350" width="400" height="8" fill="#93a487"/>
</svg>
'''


def stamp(slug, name, kind, pal):
    top, bot, b, r, acc = pal
    up = name.upper()
    # split into top arc text and bottom arc text
    words = up.split()
    if len(words) > 2:
        half = math.ceil(len(words) / 2)
        top_t, bot_t = " ".join(words[:half]), " ".join(words[half:])
    elif len(words) == 2:
        top_t, bot_t = words[0], words[1]
    else:
        top_t, bot_t = up, "TALLINN"
    fs = 28 if max(len(top_t), len(bot_t)) <= 12 else 21
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300" role="img" aria-label="{name} stamp">
  <defs>
    <path id="arcTop" d="M 48 150 A 102 102 0 0 1 252 150"/>
    <path id="arcBot" d="M 22 150 A 128 128 0 0 0 278 150"/>
    <clipPath id="inner"><circle cx="150" cy="150" r="86"/></clipPath>
    <linearGradient id="isky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{top}"/><stop offset="100%" stop-color="{bot}"/>
    </linearGradient>
  </defs>
  <circle cx="150" cy="150" r="146" fill="#ffffff"/>
  <circle cx="150" cy="150" r="142" fill="none" stroke="{acc}" stroke-width="8"/>
  <circle cx="150" cy="150" r="90" fill="none" stroke="{acc}" stroke-width="6"/>
  <g clip-path="url(#inner)">
    <rect x="60" y="60" width="180" height="180" fill="url(#isky)"/>
    <g transform="translate(150 240) scale(0.44) translate(-200 -350)">{shape(kind, b, r)}</g>
    <rect x="60" y="212" width="180" height="30" fill="#7a8b6f"/>
  </g>
  <g fill="{acc}" font-family="'M PLUS Rounded 1c', 'Trebuchet MS', sans-serif" font-weight="800" font-size="{fs}" letter-spacing="2">
    <text text-anchor="middle"><textPath href="#arcTop" startOffset="50%">{top_t}</textPath></text>
    <text text-anchor="middle"><textPath href="#arcBot" startOffset="50%">{bot_t}</textPath></text>
  </g>
  <circle cx="42" cy="150" r="5" fill="{acc}"/><circle cx="258" cy="150" r="5" fill="{acc}"/>
</svg>
'''


EMPTY_THUMB = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300" role="img" aria-label="Not checked in">
  <circle cx="150" cy="150" r="132" fill="#ffffff" stroke="#c9c9c9" stroke-width="8" stroke-dasharray="18 14"/>
  <text x="150" y="168" text-anchor="middle" font-family="'M PLUS Rounded 1c','Trebuchet MS',sans-serif" font-size="72" font-weight="800" fill="#dcdcdc">?</text>
</svg>
'''

UNCHECKED = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300" role="img" aria-label="Tap to check in">
  <circle cx="150" cy="150" r="136" fill="#ffffff" stroke="#0072ce" stroke-width="7" stroke-dasharray="16 12"/>
  <text x="150" y="132" text-anchor="middle" font-family="'M PLUS Rounded 1c','Trebuchet MS',sans-serif" font-size="40" font-weight="800" fill="#0072ce">Check-in</text>
  <text x="150" y="184" text-anchor="middle" font-family="'M PLUS Rounded 1c','Trebuchet MS',sans-serif" font-size="40" font-weight="800" fill="#0072ce">&amp; Stamp!</text>
</svg>
'''

# ---------------------------------------------------------------- decos
def deco_knight(c1, c2):
    return f'''
  <g>
    <path d="M60 150 l40 -70 h60 l40 70 z" fill="{c1}"/>
    <rect x="88" y="52" width="44" height="46" rx="10" fill="#d9d9de"/>
    <rect x="84" y="66" width="52" height="12" fill="#3a3a44"/>
    <path d="M110 8 l10 34 h-20 z" fill="{c2}"/>
    <rect x="150" y="40" width="10" height="120" rx="5" fill="#8a5a2b"/>
    <path d="M137 40 h36 l-18 -28 z" fill="{c2}"/>
    <path d="M50 96 q-22 30 -6 60 q18 -14 26 -34 z" fill="{c2}"/>
  </g>'''

def deco_dragon(c1, c2):
    return f'''
  <g>
    <path d="M30 140 q40 -60 100 -50 q50 8 60 46 q-30 18 -70 14 q-50 -6 -90 -10 z" fill="{c1}"/>
    <path d="M120 78 q30 -34 62 -18 q-8 22 -30 30 z" fill="{c2}"/>
    <circle cx="158" cy="94" r="7" fill="#fff"/><circle cx="159" cy="95" r="4" fill="#111"/>
    <path d="M186 104 q22 6 34 -6 q-8 22 -34 20 z" fill="#e8433a"/>
    <g fill="{c2}" opacity=".8">
      <path d="M60 96 l14 -18 l14 18 z"/><path d="M92 88 l14 -18 l14 18 z"/>
    </g>
  </g>'''

def deco_shield(c1, c2):
    return f'''
  <g>
    <path d="M110 20 l70 26 v52 q0 60 -70 92 q-70 -32 -70 -92 v-52 z" fill="{c1}" stroke="#f5d76e" stroke-width="6"/>
    <path d="M110 44 v130" stroke="{c2}" stroke-width="8"/>
    <path d="M52 96 h116" stroke="{c2}" stroke-width="8"/>
    <circle cx="110" cy="96" r="18" fill="#f5d76e"/>
  </g>'''

def deco_tower(c1, c2):
    return f'''
  <g>
    <path d="M64 180 v-92 a46 46 0 0 1 92 0 v92 z" fill="{c1}"/>
    <path d="M50 92 L110 30 L170 92 Z" fill="{c2}"/>
    <circle cx="110" cy="24" r="8" fill="#f5d76e"/>
    <g fill="#fff" opacity=".85"><rect x="86" y="112" width="16" height="28" rx="8"/><rect x="118" y="112" width="16" height="28" rx="8"/></g>
    <rect x="96" y="150" width="28" height="30" rx="6" fill="#5a3f28"/>
  </g>'''

def deco_marzipan(c1, c2):
    return f'''
  <g>
    <circle cx="110" cy="112" r="66" fill="{c1}"/>
    <circle cx="110" cy="112" r="50" fill="{c2}" opacity=".55"/>
    <path d="M78 100 q32 -30 64 0" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="90" cy="128" r="7" fill="#fff"/><circle cx="130" cy="128" r="7" fill="#fff"/>
  </g>'''

def deco_flag(c1, c2):
    return f'''
  <g>
    <rect x="46" y="20" width="10" height="164" rx="5" fill="#8a8a92"/>
    <rect x="56" y="34" width="118" height="34" fill="#4891d9"/>
    <rect x="56" y="68" width="118" height="34" fill="#111"/>
    <rect x="56" y="102" width="118" height="34" fill="#fff" stroke="#ddd" stroke-width="2"/>
  </g>'''

def deco_star(c1, c2):
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rr = 78 if i % 2 == 0 else 34
        pts.append(f"{110 + rr*math.cos(ang):.1f},{104 + rr*math.sin(ang):.1f}")
    return f'''<polygon points="{' '.join(pts)}" fill="{c1}" stroke="{c2}" stroke-width="7" stroke-linejoin="round"/>'''

def deco_heart(c1, c2):
    return f'''<path d="M110 176 C 20 118 34 42 82 42 c 16 0 26 10 28 20 c 2 -10 12 -20 28 -20 c 48 0 62 76 -28 134 z" fill="{c1}" stroke="{c2}" stroke-width="6"/>'''

def deco_ribbon(c1, c2):
    return f'''
  <g>
    <rect x="18" y="76" width="184" height="56" rx="12" fill="{c1}"/>
    <path d="M18 76 l-14 28 l14 28 z" fill="{c2}"/>
    <path d="M202 76 l14 28 l-14 28 z" fill="{c2}"/>
    <text x="110" y="118" text-anchor="middle" font-family="'M PLUS Rounded 1c','Trebuchet MS',sans-serif" font-size="30" font-weight="800" fill="#fff">TALLINN</text>
  </g>'''

DECO_SHAPES = {
    "knight": deco_knight, "dragon": deco_dragon, "shield": deco_shield,
    "tower": deco_tower, "marzipan": deco_marzipan, "flag": deco_flag,
    "star": deco_star, "heart": deco_heart, "ribbon": deco_ribbon,
}


def deco_svg(kind, c1, c2):
    body = DECO_SHAPES[kind](c1, c2)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 200" width="220" height="200">
{body}
</svg>
'''


def main():
    for d in ("spots", "stamps", "decos"):
        os.makedirs(os.path.join(PUB, d), exist_ok=True)

    for slug, name, kind, pal in SPOTS:
        open(os.path.join(PUB, "spots", f"spot_thumb_{slug}.svg"), "w").write(spot_thumb(slug, name, kind, pal))
        open(os.path.join(PUB, "stamps", f"stamp_checkedin_{slug}.svg"), "w").write(stamp(slug, name, kind, pal))

    open(os.path.join(PUB, "stamps", "stamp_thumb_empty.svg"), "w").write(EMPTY_THUMB)
    open(os.path.join(PUB, "stamps", "stamp_uncheckedin.svg"), "w").write(UNCHECKED)

    # decos: 3 per spot + 4 general
    palettes = [("#2f7d4f", "#f5d76e"), ("#c0392b", "#f5d76e"), ("#2c5f9e", "#f5d76e"),
                ("#8e44ad", "#ffd9e8"), ("#e07a2f", "#5a3f28"), ("#1f8a9e", "#eafaff")]
    kinds = list(DECO_SHAPES.keys())
    manifest = []
    idx = 0
    for slug, name, _k, _p in SPOTS:
        for j in range(3):
            kind = kinds[idx % len(kinds)]
            c1, c2 = palettes[idx % len(palettes)]
            fid = f"{slug}-{j+1}"
            open(os.path.join(PUB, "decos", f"deco_{fid}.svg"), "w").write(deco_svg(kind, c1, c2))
            manifest.append({"id": fid, "spot": slug, "kind": kind})
            idx += 1
    for j, kind in enumerate(["star", "heart", "ribbon", "flag"]):
        c1, c2 = palettes[j % len(palettes)]
        fid = f"general-{j+1}"
        open(os.path.join(PUB, "decos", f"deco_{fid}.svg"), "w").write(deco_svg(kind, c1, c2))
        manifest.append({"id": fid, "spot": None, "kind": kind})

    print(json.dumps({"spots": len(SPOTS), "decos": len(manifest)}))


if __name__ == "__main__":
    main()
