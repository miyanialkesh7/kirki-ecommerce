## 1. Port selection script

- [x] 1.1 Create `bin/dev-up`: copy `.env.example` to `.env` if `.env` is missing
- [x] 1.2 Pick free ports for `NGINX_HTTP_PORT`, `MARIADB_PORT`, `PHPMYADMIN_PORT`; skip ports already in `.env` that are free or held by this project (scan upward from `20100`; lock so two runs do not pick the same port)
- [x] 1.3 Write the ports to `.env` and set `WP_URL` to `http://localhost:<nginx port>`; set `KECOM_WEBHOOK_BASE_URL` too unless it is a non-`localhost` value
- [x] 1.4 Run `docker compose up -d` and pass extra arguments through (for example `--build`)
- [ ] 1.5 Verify: run `bin/dev-up` in two worktrees at the same time; both stacks start with different ports and the site answers in each (port logic, kept ports, tunnel URL and lock passed with a stub `docker`; one real stack started on `20103`–`20105`, the site answers and the cron loopback prints `200`; a second stack at the same time is not tested)

## 2. Address helper

- [x] 2.1 Create `bin/dev-urls`: print site, phpMyAdmin and database addresses from `.env`; without port keys, print the Compose defaults (`20100`–`20102`)
- [x] 2.2 Verify: output matches `docker compose port nginx 80` (checked on a real stack: `20103`)

## 3. Remove hard-coded ports from tooling

- [x] 3.1 `resources/app/vite.config.js`: read `NGINX_HTTP_PORT` from `.env` for `server.origin`, with `20100` as fallback
- [x] 3.2 `tests/wp-tests-config.php`, `tests/.env.example`, `tests/bootstrap.php`: use `MARIADB_PORT` from the root `.env` for the host-only default
- [ ] 3.3 Verify: `npm run typecheck` in `resources/app/` and `composer test:docker:unit` pass (typecheck, ESLint on `vite.config.js` and 1499 Vitest tests pass; `composer test:docker:unit` needs a running stack; not done)

- [x] 3.4 Per-worktree Vite port: `bin/dev-up` saves `VITE_PORT`; `vite.config.js` reads it with `strictPort`; `docker-compose.yml` passes it to `php`; `docker/wp-config.php` defines `KECOM_VITE_DEV_SERVER`; `EnqueueAdminScripts` reads the constant
- [ ] 3.5 Verify: run `npm run dev` in two worktrees at the same time; both admin apps load scripts from their own port

## 4. Orca hooks

- [x] 4.1 Read the Orca docs for the hook file name and keys (docs do not cover them; `orca.yaml` `scripts.setup` / `scripts.archive` taken from Orca issue threads)
- [x] 4.2 Add `orca.yaml` with the setup hook (`composer install`, then `bin/dev-up`) and the archive hook (`docker compose down -v`)
- [ ] 4.3 Verify: create and archive a test worktree; the stack starts and the volumes are removed

## 5. Documentation

- [x] 5.1 `README.md`: replace every hard-coded port: the OrbStack remark, the address table, the host-only test command, the troubleshooting rows (port, HTTPS redirect, WP-Cron `curl`) and the service list; document `bin/dev-up`, `bin/dev-urls` and the Orca hooks
- [x] 5.2 `.env.example`: remove the OrbStack port comment; explain that `bin/dev-up` manages the port keys
- [x] 5.3 `docs/ecommerce/README.md`: replace every `localhost:20100` reference with a pointer to `bin/dev-urls`
- [x] 5.4 State in the README that `down -v` on archive deletes the worktree database
