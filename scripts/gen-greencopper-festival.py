#!/usr/bin/env python3
"""Emit a setlistpicks festival definition from Greencopper app data.

The three Danny Wimmer Presents festivals (Louder Than Life, Bourbon &
Beyond, Aftershock) all publish their schedule only through a Greencopper
app; the same JSON that backs the app is served publicly at
  https://goeventweb-static.greencopper.com/<hash>/<tag>/data/eng/shows.json
so the set times here are the festival's own, not a transcription.
"""
import json, os, sys, collections, urllib.request

MONTHS = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',
          7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'}
WEEKDAY = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

GC = 'https://goeventweb-static.greencopper.com'


def load(path):
    with open(path) as f:
        return json.load(f)


def fetch(source, entity):
    """Pull one entity file from the festival's Greencopper project.

    `project_hash` and `project_tag` come from the <goevent-web> element on
    the festival's own schedule page:
        curl -s https://<festival>/schedule/ | grep -o '<goevent-web[^>]*>'
    """
    url = f"{GC}/{source['project_hash']}/{source['project_tag']}/data/eng/{entity}.json"
    # The CDN 403s the default Python user-agent.
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def build(cfg):
    shows = list(fetch(cfg['source'], 'shows').values())
    venues = fetch(cfg['source'], 'venues')

    # Stage order follows the app's own sort_order, which is the order the
    # festival lists them in — keeping the grid columns in the same order
    # people see in the app.
    stage_order = [v['title'] for v in sorted(venues.values(), key=lambda v: v['sort_order'])]
    used = {(s['venue'] or {}).get('title') for s in shows}
    stage_order = [t for t in stage_order if t in used]
    assert len(stage_order) <= len(cfg['stage_ids']), 'more stages than ids configured'

    stage_id = dict(zip(stage_order, cfg['stage_ids']))
    stage_short = cfg['stage_shorts']
    stage_color = cfg['stage_colors']

    dates = sorted({s['date_start'] for s in shows})
    import datetime
    day_id, day_meta = {}, []
    for d in dates:
        dt = datetime.date.fromisoformat(d)
        name = WEEKDAY[dt.weekday()]
        did = name[:3].lower()
        day_id[d] = did
        day_meta.append((did, name, f'{MONTHS[dt.month]} {dt.day}'))

    by_day = collections.defaultdict(lambda: collections.defaultdict(list))
    for s in shows:
        st = (s['venue'] or {}).get('title')
        by_day[s['date_start']][st].append(s)

    out = []
    out.append(cfg['header'].rstrip() + '\n')
    out.append(f"const slug = '{cfg['slug']}';\n")
    out.append('const stages = [')
    width = max(len(stage_id[t]) for t in stage_order)
    for t in stage_order:
        out.append(f"  {{ id: '{stage_id[t]}',{' ' * (width - len(stage_id[t]))} "
                   f"name: '{esc(cfg.get('stage_names', {}).get(t, t))}', "
                   f"short: '{stage_short[t]}', color: '{stage_color[t]}' }},")
    out.append('];\n')

    out.append('const days = [')
    for did, name, date in day_meta:
        out.append(f"  {{ id: '{did}', name: '{name}', date: '{date}' }},")
    out.append('];\n')

    out.append('// Each set: [stageId, start, end, artist]')
    out.append('const sets = {')
    for d in dates:
        out.append(f'  {day_id[d]}: [')
        for t in stage_order:
            rows = sorted(by_day[d][t], key=lambda s: s['time_start'])
            if not rows:
                continue
            bar = '─' * max(1, 56 - len(t))
            out.append(f'    // ── {t} {bar}')
            for s in rows:
                a = esc(s['object']['title'])
                out.append(f"    ['{stage_id[t]}', '{s['time_start'][:5]}', "
                           f"'{s['time_end'][:5]}', '{a}'],")
            out.append('')
        if out[-1] == '':
            out.pop()
        out.append('  ],\n')
    out.append('};\n')

    out.append('export default {')
    out.append('  slug,')
    for k in ('name', 'shortName'):
        out.append(f"  {k}: '{esc(cfg[k])}',")
    out.append(f"  year: {cfg['year']},")
    out.append(f"  venue: '{esc(cfg['venue'])}',")
    out.append('  place: {')
    for k, val in cfg['place'].items():
        out.append(f"    {k}: '{esc(val)}',")
    out.append('  },')
    out.append(f"  utcOffset: '{cfg['utcOffset']}',")
    out.append(f"  dateRange: '{cfg['dateRange']}',")
    out.append(f"  officialUrl: '{cfg['officialUrl']}',")
    out.append(f"  dataVerifiedOn: '{cfg['dataVerifiedOn']}',")
    for k in ('headliners', 'notableActs'):
        names = ', '.join(f"'{esc(n)}'" for n in cfg[k])
        line = f'  {k}: [{names}],'
        if len(line) <= 96:
            out.append(line)
        else:
            out.append(f'  {k}: [')
            for n in cfg[k]:
                out.append(f"    '{esc(n)}',")
            out.append('  ],')
    out += ['  stages,', '  days,', '  sets,', '  groupNames: [']
    # Pack several per line, but only ever break *between* names — wrapping
    # the joined string would split inside a quoted name.
    line = '   '
    for n in cfg['groupNames']:
        item = f" '{esc(n)}',"
        if len(line) + len(item) > 96:
            out.append(line)
            line = '   '
        line += item
    if line.strip():
        out.append(line)
    out += ['  ],', '};']

    # Every headliner/notableAct must appear verbatim in sets — the registry
    # tests assert it, and a near-miss is easy to introduce by hand.
    titles = {s['object']['title'] for s in shows}
    missing = [n for n in cfg['headliners'] + cfg['notableActs'] if n not in titles]
    if missing:
        sys.exit(f'not in lineup, exact match required: {missing}')

    return '\n'.join(out) + '\n', len(shows), stage_order, day_meta

USAGE = """usage: gen-greencopper-festival.py <config.json> [<out.js>]

  config.json  one of scripts/greencopper/*.json
  out.js       defaults to shared/festivals/<slug>.js
"""

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(USAGE)
    cfg = load(sys.argv[1])
    text, n, stages, days = build(cfg)
    if len(sys.argv) > 2:
        out = sys.argv[2]
    else:
        here = os.path.dirname(os.path.abspath(__file__))
        out = os.path.join(here, '..', 'shared', 'festivals', cfg['slug'] + '.js')
    with open(out, 'w') as f:
        f.write(text)
    print(f"{cfg['slug']}: {n} sets, {len(stages)} stages, {len(days)} days "
          f"-> {os.path.relpath(out)}")
