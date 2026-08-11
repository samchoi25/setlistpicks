# Deploying to Fly.io

The app is live at **https://setlistpicks.com** (also https://setlistpicks.fly.dev).
Every push to `main` deploys automatically via GitHub Actions.

## First-time setup (for a new fork/clone)

### 1. Install flyctl

```bash
brew install flyctl   # macOS
fly auth login
```

### 2. Create the app

```bash
fly launch --no-deploy --org <your-org>
```

Accept the existing `fly.toml`. The app name (`setlistpicks`) and org (`setlistpicks`)
are already set — update `fly.toml` if you're deploying to a different account.

### 3. Create the persistent volume

SQLite lives on a Fly volume that survives deploys and machine restarts. Create it once:

```bash
fly volumes create setlistpicks_data --size 1 --region sjc --yes
```

- `--size 1` = 1 GB (each group is < 10 KB; this handles tens of thousands of groups)
- `--region sjc` = San Jose; match your `primary_region` in `fly.toml`
- The volume name **must** match `source = "setlistpicks_data"` in `fly.toml`

> ⚠️ A Fly volume is pinned to one machine in one region. This app runs a
> **single instance** (`min_machines_running = 0`). For multi-region HA,
> see [Litestream](https://litestream.io/) or [Turso](https://turso.tech/).

### 4. Add the GitHub Actions deploy secret

```bash
fly tokens create deploy --app setlistpicks -x 999999h
```

Copy the token, then in GitHub → repo → **Settings → Secrets and variables →
Actions → New repository secret**:

| Secret | Value |
|---|---|
| `FLY_API_TOKEN` | token from above |

Every push to `main` now triggers `.github/workflows/deploy.yml`.

### 5. Custom domain (optional)

```bash
fly certs add yourdomain.com --app setlistpicks
fly certs add www.yourdomain.com --app setlistpicks
```

Add DNS records in your registrar (gray cloud / DNS-only if using Cloudflare).
Get the app's actual IPs — **they differ per app**, so don't copy them from an
older deployment:

```bash
fly ips list --app setlistpicks
```

| Type | Name | Value |
|---|---|---|
| `A` | `@` | the `v4` address from `fly ips list` |
| `AAAA` | `@` | the `v6` address from `fly ips list` |
| `A` | `www` | same `v4` address |
| `AAAA` | `www` | same `v6` address |

Check validation progress: `fly certs check yourdomain.com --app setlistpicks`

---

## Subsequent deploys

```bash
git push origin main   # CI deploys automatically
# or manually:
fly deploy
```

## Rollback

```bash
fly releases list
fly deploy --image registry.fly.io/setlistpicks:<version>
```

## Backups

Fly automatically takes **daily snapshots** of all volumes and retains them for 5 days.
A GitHub Actions cron (`.github/workflows/snapshot.yml`) additionally creates **hourly snapshots**
using `fly volumes snapshots create`.

### Setup for hourly snapshots

No setup needed. The workflow looks the volume ID up at runtime via
`flyctl volumes list`, so it keeps working after the volume is recreated
(for example when restoring from a snapshot). It only needs the
`FLY_API_TOKEN` secret, which the deploy workflow already requires.

### Restore from a snapshot

```bash
# List available snapshots (daily + hourly)
fly volumes snapshots list <volume-id> --app setlistpicks

# Create a new volume restored from a specific snapshot
fly volumes create setlistpicks_data_restored \
  --snapshot-id <snap_id> --size 1 --region sjc --app setlistpicks

# Swap it in: edit fly.toml → change source to 'setlistpicks_data_restored', then deploy
fly deploy
```

---

## Monitoring

```bash
fly logs --app setlistpicks        # live log tail
fly status --app setlistpicks      # machine + volume health
fly ssh console --app setlistpicks # shell into running machine
sqlite3 /data/setlistpicks.db ".tables"  # inspect DB (inside console)
```

## Environment variables

Configured in `fly.toml`. Override secrets with `fly secrets set KEY=value`.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP + WebSocket listen port |
| `NODE_ENV` | `production` | Disables Vite dev mode |
| `DB_PATH` | `/data/setlistpicks.db` | SQLite file on the persistent volume |

## Architecture

```
git push → GitHub Actions → flyctl deploy --remote-only
                                │
                                ▼
                         Fly remote builder (Docker multi-stage)
                         ├─ build: node:20-alpine
                         │   ├─ apk build-base python3   (better-sqlite3 native)
                         │   ├─ npm install
                         │   ├─ vite build  (→ dist/)
                         │   └─ npm prune --omit=dev
                         └─ runtime: node:20-alpine
                             ├─ node_modules (prod only)
                             ├─ server/
                             ├─ shared/
                             └─ dist/
                                │
                                ▼
                         Fly machine (256 MB shared CPU, sjc)
                         ├─ Express HTTP + WebSocket server (:8080)
                         ├─ better-sqlite3 (WAL mode, in-process)
                         └─ /data/setlistpicks.db  ←── persistent volume
```

## Scaling notes

The single-instance + SQLite setup handles hundreds of concurrent users easily
(WAL mode allows many parallel readers; writes serialize in microseconds).

If traffic grows significantly:
1. `min_machines_running = 1` in `fly.toml` eliminates cold starts (~$5/mo)
2. Cloudflare orange cloud with "Full (strict)" SSL caches static assets globally
3. Upgrade VM: `memory_mb = 512` in `fly.toml`
4. True horizontal scale: migrate to [Turso](https://turso.tech/) (distributed SQLite)
   and replace in-process WS rooms with a pub/sub layer
