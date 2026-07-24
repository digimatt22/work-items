# Digicolony Debian Development Server

Configuration date: 2026-07-16  
Host: `sheldon` (`sheldon.digicolony.net` locally) / `192.168.0.10`  
Public application: `dev.digicolony.net`

## Result

- Debian 13.6 on an Intel Core i5-4278U Mac mini with 7.6 GiB RAM.
- Static Ethernet address `192.168.0.10/24`; gateway `192.168.0.1`.
- Docker Engine 29.6.2 and Docker Compose 5.3.1 from Docker's official Debian repository.
- PostgreSQL 17 container, healthy and published only on `127.0.0.1:5432`.
- Caddy 2.6.2 on port 80 with its administrative API disabled.
- No DNS server runs on this machine; it uses upstream resolvers directly.
- cloudflared 2026.7.2 installed, enabled, and running with its token in `/etc/cloudflared/token`.
- UFW enabled with inbound access restricted to the LAN, plus the existing management SSH path.
- Docker's `DOCKER-USER` firewall chain blocks new connections arriving directly at containers.
- SSH is key-only for `mwood`; root login, password authentication, keyboard-interactive authentication, and X11 forwarding are disabled.
- Automatic Debian security updates enabled.
- Temporary passwordless sudo authorization removed after installation.

## Name resolution

- The dnsmasq service and packages were removed on 2026-07-16.
- No process listens on TCP or UDP port 53.
- `/etc/resolv.conf` uses `1.1.1.1` and `9.9.9.9` directly.
- `dev.digicolony.net` resolves through public Cloudflare DNS and the Tunnel.
- The router remains responsible for DHCP and LAN DNS.

## PostgreSQL

- Host from the Debian server: `127.0.0.1`
- Port: `5432`
- Database: `appdb`
- User: `appuser`
- Password file: `/srv/dev-stack/secrets/postgres_password`
- Compose project: `/srv/dev-stack/compose.yaml`
- Persistent volume: `dev-stack_postgres_data`

The password file is owned by `mwood`, mode `0600`. The password was not printed or copied into this report.

## Firewall policy

- TCP 22: permitted from `192.168.0.0/24` and the existing `10.1.0.1` management path.
- TCP 80 and 443: permitted from `192.168.0.0/24`.
- Other unsolicited inbound traffic: denied.
- PostgreSQL: bound only to loopback.
- Future application containers must publish to loopback, for example `127.0.0.1:3000:3000`, and be reached through Caddy.

## Files created or changed

- `/etc/network/interfaces`
- `/etc/resolv.conf`
- `/etc/ssh/sshd_config.d/90-digicolony-hardening.conf`
- `/etc/hostname` (`sheldon`)
- `/etc/hosts` (`sheldon.digicolony.net` / `sheldon`)
- `/etc/caddy/Caddyfile`
- `/etc/docker/daemon.json`
- `/etc/systemd/system/docker.service.d/20-digicolony-firewall.conf`
- `/usr/local/sbin/digicolony-docker-firewall`
- `/etc/ufw/user.rules` and `/etc/ufw/user6.rules`
- `/etc/apt/apt.conf.d/20auto-upgrades`
- `/etc/apt/sources.list.d/docker.sources`
- `/etc/apt/sources.list.d/cloudflared.list`
- `/etc/apt/keyrings/docker.asc`
- `/usr/share/keyrings/cloudflare-main.gpg`
- `/srv/dev-stack/compose.yaml`
- `/srv/dev-stack/secrets/postgres_password`
- `/var/www/dev/index.html`

## Audit trail and recovery

- Provisioning script retained on the server: `/home/mwood/server-bootstrap.sh`
- Command/output log: `/var/log/digicolony-server-bootstrap.log`
- Pre-change configuration backup: `/root/digicolony-bootstrap-backups/20260716T195208Z`
- DNS-retirement/hostname-change backup: `/root/digicolony-bootstrap-backups/20260716T203002Z-retire-dns-rename-sheldon`

## Cloudflare Tunnel status

The connector service was activated successfully on 2026-07-16 and survives reboot. The published application route maps `dev.digicolony.net` to `http://localhost:80`.

End-to-end verification passed on 2026-07-16:

- Public DNS returned Cloudflare IPv4 and IPv6 edge addresses.
- HTTPS certificate and hostname verification succeeded.
- Cloudflare returned HTTP/2 200.
- The response body matched the local Caddy origin.
- The connector remained active throughout the test.

## Adding applications

The personal Codex plugin `sheldon-deploy` provides the `$deploy-to-sheldon` skill. Projects use committed `sheldon.json` and `SHELDON_DEPLOY.md` files.

- Applications run in `mwood`'s rootless Docker daemon, enabled through a lingering user service.
- Release files live under `/home/mwood/sheldon/apps/<app>/releases/`.
- Secrets remain server-side in `/home/mwood/.config/sheldon/secrets/<app>.env`.
- Container ports bind only to `127.0.0.1`.
- Per-application Caddy routes live in `/etc/caddy/apps/`.
- The only passwordless privileged operation is `/usr/bin/systemctl restart caddy`.
- Deployments health-check new releases and retain the previous release for rollback.
- Cloudflare Published application routes map each public hostname to `http://localhost:80`.

On 2026-07-16, a disposable application passed initial deployment, repeat deployment, localhost-only port verification, Caddy routing, health checks, rollback, and cleanup.

## Work Items schema-2 migration baseline

Post-deployment inventory on 2026-07-24 found:

- Work Items release `20260724T221955Z-2fe481bb6c` at
  `portal.digicolony.net`, loopback origin `127.0.0.1:39732`, and rootless
  subnet `10.244.52.0/24`.
- The application runs as non-root user `1001:1001` with 2 GiB memory, 1.5 CPU,
  and 256 PID limits.
- The stable dependency network is
  `sheldon-digicolony-client-ops-platform` at `10.152.101.0/24`.
- Twenty application release directories are retained. The declared retention
  is five; deleting existing releases remains a
  separately approved cleanup.
- PostgreSQL is version 17.10, database `appdb`, runtime role `appuser`, with
  runtime-role connection limit 10 and no `_prisma_migrations`
  ledger. The deployment migration does not rename or recredential it.
- Garage 2.2.0 is healthy, has no published ports, stores 2 objects totaling
  112 bytes for Work Items, and preserves the existing bucket/key and
  `sheldon-garage-meta`/`sheldon-garage-data` volumes.
- The mode-`0600` application environment file remains the only application
  secret source. Inventory did not print its values.

See
[Sheldon 0.2 Migration Baseline](docs/deployments/sheldon-0-2-migration-baseline-2026-07-24.md)
for evidence and approval-readiness gaps.

The application repository contains the live Sheldon Deploy 0.2.1 schema-2
declaration and non-root database/Garage hooks. Distinct migration and backup
roles, the scoped database URL names, the stable Garage network, the foreign
sentinel, and protected backup/restore evidence are in place. Release
`20260724T221955Z-2fe481bb6c` passed origin/public health and readiness,
dependency isolation, protected-count preservation, and desktop/mobile browser
verification. See
[Sheldon 0.2.1 Live Migration](docs/deployments/sheldon-0-2-1-live-migration-2026-07-24.md).
