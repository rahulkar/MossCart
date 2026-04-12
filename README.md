# MossCart — E-commerce demo & UI test automation (React, Selenium, Cucumber, Docker, Jenkins)

**MossCart** is a **full-stack e-commerce demo** and **UI regression / E2E testing** reference monorepo: **React + Vite** storefront, **Express + Prisma + SQLite** API (JWT auth, cart, mock checkout, orders, profile, **category + eco filters**, **order receipts**), and **`test_automation/`** with **Maven**, **Cucumber (BDD)**, **Selenium 4**, and **Page Object Model**. **Docker Compose** runs the stack, **Selenium**, **Nginx** (SPA + `/api` proxy), and a **pre-configured demo Jenkins** on port **8082** so pipelines can execute UI tests against the host Docker daemon.

## Overview

Use MossCart to learn or demonstrate **end-to-end testing**, **Dockerized dev stacks**, and **pipeline-driven** UI checks. The storefront is a **single-page app (SPA)** with **`data-testid`** hooks for stable selectors; the API exposes **REST** routes for catalog, cart, checkout, orders, and profile. **Smoke** and domain **tags** (`@smoke`, `@module_catalog`, etc.) let you slice **Cucumber** runs locally or in **Jenkins**. **Allure** and published reports support test triage after **`mvn test`**.

**Green Index**: each product carries an illustrative eco score (1–5) for filtering and PDP badges. Several catalog items intentionally have **no image URL** so the UI shows an **“Image coming soon”** placeholder (and tests cover that path).

## Tech stack

| Area | Technologies |
|------|----------------|
| **Frontend** | React, Vite, Tailwind CSS, client-side routing |
| **Backend** | Node.js, Express, Prisma ORM, SQLite, JWT |
| **Infra** | Docker, Docker Compose, Nginx (SPA + `/api` proxy) |
| **UI testing** | Selenium WebDriver 4, Cucumber, JUnit 5, Maven, Page Object Model; hybrid **API** setup (Java `HttpClient` + Jackson); AssertJ, SLF4J/Logback |
| **CI / reporting** | Jenkins (JCasC demo), Pipeline, JUnit, Cucumber HTML, Allure |

## Prerequisites

- Node.js 20+ (for local dev without Docker)
- Docker Desktop (or Docker Engine + Compose v2)
- JDK 17 + Maven (only if you run tests on the host instead of the `test-runner` container — otherwise Maven runs inside Docker and does not need a host install)

## Full stack in one command (Docker)

From the **repository root**:

```bash
docker compose up --build -d
```

This starts by default:

| Service | Port | Purpose |
|--------|------|---------|
| **web** | [http://localhost:8080](http://localhost:8080) | Storefront (Nginx serves the SPA; `/api/*` is proxied to the API) |
| **api** | [http://localhost:3000](http://localhost:3000) | Express API directly (same routes as `/api/*` on the storefront) |
| **selenium** | (internal) | Chrome for UI tests — containers use `http://selenium:4444` |
| **jenkins-demo** | [http://localhost:8082](http://localhost:8082) | Demo Jenkins — login **`demo` / `demo`** (see [Pre-baked demo Jenkins](#pre-baked-demo-jenkins)) |

SQLite lives in the named volume `sqlite_data` (`DATABASE_URL=file:/app/data/app.db` in the API container).

**Smaller run** (app only, no Selenium/Jenkins): `docker compose up --build -d api web`

Environment overrides (optional, in shell or `.env` next to `docker-compose.yml`):

- `JWT_SECRET` — signing key for JWTs (default in compose is a dev placeholder).
- `MOSSCART_DOCKER_PROJECT` — Compose **project name** Jenkins pipelines target (default **`mosscart`**, from the top-level `name:` in [`docker-compose.yml`](docker-compose.yml)). Must match **`docker compose ls`**; override only if you run Compose with a different `-p` / `COMPOSE_PROJECT_NAME`.

## Run the app (local dev)

Terminal 1 — API:

```bash
cd backend
cp .env.example .env   # first time
npm install
npx prisma db push
npm run dev
```

Terminal 2 — Vite (proxies `/api` to port 3000):

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## UI tests (Docker — recommended)

If you already ran **`docker compose up -d`** (includes **Selenium**), run Maven in **`test-runner`** (that service uses the **`test`** profile so it is not left running after `up`):

```bash
docker compose --profile test run --rm test-runner mvn -B clean test
```

From a cold start:

```bash
docker compose up --build -d
docker compose --profile test run --rm test-runner mvn -B clean test
```

`BASE_URL`, `SELENIUM_REMOTE_URL`, and **`HEADLESS=1`** are set in Compose for the `test-runner` service (headed runs: override or unset `HEADLESS` in a one-off `docker compose run -e …`).

After changing the product seed or Prisma schema, reset the API volume so the container re-seeds (or run `node prisma/seed.js` in `backend/` locally):

```bash
docker compose down -v
docker compose up --build -d
```

### Cucumber layout (module folders)

Features live under [`test_automation/src/test/resources/features/`](test_automation/src/test/resources/features/) by domain, for example `home/`, `auth/`, `catalog/`, `cart/` (e.g. `basket_composition.feature` with **Background**, `basket_handoff.feature`), `checkout/`, `profile/`, `navigation/`, `sustainability/`, `orders/`, `journeys/`. Step definitions are grouped under matching Java packages (`com.mosscart.steps.catalog`, etc.). The suite uses **Scenario Outline** / **Examples**, **Data tables** on steps, **Background** where every scenario shares the same `Given`, and **Rule** blocks to group related outlines (e.g. in catalog discovery). Tags such as `@module_catalog` and `@smoke` help slice runs.

## UI tests (host with local Chrome)

With the app reachable at `http://localhost:8080` (Docker `web` or production-like nginx):

```bash
cd test_automation
mvn -B clean test -DbaseUrl=http://localhost:8080
```

Omit `SELENIUM_REMOTE_URL` so **WebDriverManager** resolves a local **ChromeDriver**.

Run only **@smoke** scenarios:

```bash
mvn -B test -Dcucumber.filter.tags="@smoke"
```

### Test configuration (parallel runs, browser, API setup)

- **Parallelism:** [`test_automation/src/test/resources/junit-platform.properties`](test_automation/src/test/resources/junit-platform.properties) enables Cucumber parallel execution with a fixed pool (default **2** workers). Override at runtime if needed, for example:
  - `-Dcucumber.execution.parallel.config.fixed.parallelism=4`
  - **Allure:** parallel Cucumber + `allure-cucumber7-jvm` often logs `AllureLifecycle - Could not update test case ... not found` and produces incomplete reports. The root [`Jenkinsfile`](Jenkinsfile) and [`jenkins/pipelines/Jenkinsfile.smoke`](jenkins/pipelines/Jenkinsfile.smoke) therefore pass **`-Dcucumber.execution.parallel.enabled=false`**. For local runs with Allure, use the same flag or accept the noise.
- **Browser:** `HEADLESS=1`, `BROWSER=chrome` or `firefox`, optional `WINDOW_SIZE=1920x1080` (also available as Java system properties `headless`, `browser`, `window.size`).
- **Timeouts:** `WAIT_TIMEOUT_SEC`, `PAGE_LOAD_TIMEOUT_SEC`, `SCRIPT_TIMEOUT_SEC`, `SHORT_WAIT_TIMEOUT_SEC`, `WAIT_POLL_MS`.
- **URLs:** `BASE_URL` is the SPA origin (also `baseUrl` system property). Optional **`API_BASE_URL`** (`api.base.url`) if the REST API is not same-origin (defaults to `BASE_URL`; Docker UI tests use `http://web:80` so `/api` is proxied correctly).
- **Hybrid tests:** Many Givens register shoppers via the **REST API** and inject `localStorage` (`mosscart_token`) before UI steps, which speeds suites and reduces flake. Checkout **payment decline** UI is enabled in the default Compose build via [`docker-compose.yml`](docker-compose.yml) build arg `VITE_ENABLE_CHECKOUT_FAILURE_SIM=1` (see [`docker/frontend.Dockerfile`](docker/frontend.Dockerfile)). Local `npm run build` without that arg still shows the control in **Vite dev** (`npm run dev`).
- **Logging:** `MOSSCART_LOG_LEVEL=DEBUG` adjusts `com.mosscart` log verbosity ([`logback-test.xml`](test_automation/src/test/resources/logback-test.xml)).

## Jenkins in Docker

The custom image is defined in [`docker/jenkins/Dockerfile`](docker/jenkins/Dockerfile) and installs:

- **Docker CLI** + **Compose v2** (talks to the host daemon via `docker.sock`)
- **Plugins** listed in [`docker/jenkins/plugins.txt`](docker/jenkins/plugins.txt) (Pipeline, Git, Docker workflow, JUnit, HTML Publisher, **Allure**, etc.)

### Run Jenkins on your machine (optional “vanilla” controller)

For a **separate** Jenkins with the normal setup wizard (port **8081**), use profile **`ci`** — this does **not** start with the default `docker compose up`:

```bash
docker compose --profile ci build jenkins
docker compose --profile ci up -d jenkins
```

- **UI:** open [http://localhost:8081](http://localhost:8081) in a browser (port **8081** is mapped to Jenkins’ 8080 in [`docker-compose.yml`](docker-compose.yml)).
- **First login:** run `docker compose --profile ci logs jenkins 2>&1 | findstr /i "password"` on Windows, or `docker compose --profile ci logs jenkins | grep -i password` on Linux/macOS, paste the **initialAdminPassword** into the wizard, then create an admin user.
- **Docker from Jenkins:** the container mounts the host `docker.sock`, so pipelines can run `docker compose` against your machine’s Docker daemon.

**Pipelines (root [`Jenkinsfile`](Jenkinsfile) and [`jenkins/pipelines/Jenkinsfile.smoke`](jenkins/pipelines/Jenkinsfile.smoke)):** expect the **default stack** already running (`docker compose up -d`: **api**, **web**, **selenium**). They wait for **`web`** → `/api/health`, then **`docker cp`** the checked-out **`test_automation/`** tree into a short-lived **`maven:…`** container on the Compose project network (`<project>_default`) and run Maven there — **no bind mount of the repo through the Docker host**, so this works reliably from **jenkins-demo** on Docker Desktop. The Maven container is started with **`HEADLESS=1`** (remote Selenium). They **do not** rebuild app containers or run **`docker compose down`**. Results are **`docker cp`**’d back to the job workspace for JUnit, Cucumber HTML, and Allure.

**Compose project name:** set **`MOSSCART_DOCKER_PROJECT`** in `.env` (defaults to **`mosscart`** when unset, matching Compose `name:`). It is passed into **jenkins-demo** and **jenkins** (profile **`ci`**). It must match the **Name** from **`docker compose ls`**. After changing it, recreate the Jenkins service.

**Demo controller (port 8082):** jobs **mosscart-full** and **mosscart-smoke** are created automatically — open the UI, log in as **`demo` / `demo`**, run a job (see [Pre-baked demo Jenkins](#pre-baked-demo-jenkins)).

**Vanilla controller (profile `ci`, port 8081):** after the setup wizard, create jobs yourself: New Item → **Pipeline** → **Pipeline script from SCM** → your Git repo → **Script Path** `Jenkinsfile` (or [`jenkins/pipelines/Jenkinsfile.smoke`](jenkins/pipelines/Jenkinsfile.smoke)). **Allure:** Manage Jenkins → **Tools** → **Allure Commandline** → install from Maven Central (not needed on **jenkins-demo**, which bundles Allure via CasC).

**Local Allure without Jenkins:** from `test_automation/`, after `mvn test`, run `mvn allure:serve` to open a temporary report server (reads `target/allure-results`).

**Docker socket:** **jenkins-demo** and **jenkins** run as **`user: root`** in Compose so pipeline steps can call `docker compose` against the mounted **`/var/run/docker.sock`** (the default `jenkins` image user cannot open that socket on most Linux setups, and Docker Desktop can behave the same). This is **for local demo only** — do not expose that controller to untrusted networks.

**Linux (stricter option):** remove `user: root` from the Jenkins service(s) and add the host **`docker`** group instead, for example `group_add: ["$(getent group docker | cut -d: -f3)"]` via a small override file or env expansion.

**Workspace:** the pipeline expects the Git checkout to be the **repository root** (where `docker-compose.yml` lives). For a local-only job without Git, mount the repo into the agent or use a Multibranch Pipeline pointed at this directory.

### Pre-baked demo Jenkins

**jenkins-demo** is part of the default stack (port **8082**). It is a **local demo** controller with:

- **Login:** `demo` / `demo` (fixed credentials — **never** use this on a network you do not fully trust).
- **JCasC** ([`docker/jenkins/casc-demo.yaml`](docker/jenkins/casc-demo.yaml)): demo user, system message, **Allure CLI** pointing at the binary baked into [`docker/jenkins/Dockerfile.demo`](docker/jenkins/Dockerfile.demo).
- **Two Pipeline jobs:** `mosscart-full` (root [`Jenkinsfile`](Jenkinsfile)) and `mosscart-smoke` ([`jenkins/pipelines/Jenkinsfile.smoke`](jenkins/pipelines/Jenkinsfile.smoke)), created by [`docker/jenkins/init.groovy.d/01-seed-demo-pipelines.groovy`](docker/jenkins/init.groovy.d/01-seed-demo-pipelines.groovy). They load the Jenkinsfile from a **Git** checkout at `file:///workspace/mosscart` (your project directory bind-mounted into the container).

**Git:** Jenkins’ Git client needs a real repo under that path. If the folder has **no `.git`**, the image entrypoint [`docker/jenkins/jenkins-demo-entrypoint.sh`](docker/jenkins/jenkins-demo-entrypoint.sh) runs `git init` and creates an initial commit on first start (the mount is **read-write** for this). If you already use Git, nothing is changed.

**Stale pipeline / “port is already allocated” on `docker compose up`:** seeded jobs load the Jenkinsfile from **Git** at `file:///workspace/mosscart`, not from uncommitted files on disk. If **`main`** is still the first `chore: jenkins-demo auto-seed` commit, Jenkins keeps running that old pipeline.

- **Option A — host Git:** commit the current [`Jenkinsfile`](Jenkinsfile) and [`jenkins/pipelines/Jenkinsfile.smoke`](jenkins/pipelines/Jenkinsfile.smoke) on the host, then rebuild.
- **Option B — demo auto-sync:** after pulling an image that includes the current [`jenkins-demo-entrypoint.sh`](docker/jenkins/jenkins-demo-entrypoint.sh), run **`docker compose up --build -d jenkins-demo`** once. After that, whenever you save pipeline changes on the host, run **`docker compose restart jenkins-demo`**: on each start the entrypoint runs **`git add -A`** and commits mount changes as `chore: jenkins-demo sync from host mount` so the next build sees them (`.gitignore` still applies — e.g. `.env` is not committed).

A current build logs a **`docker cp`** banner at the start of the UI test stage (not `docker compose build` / `up` for the app stack).

**Manual seed** (optional, if you prefer not to use the entrypoint behavior):

```bash
git init
git add -A
git commit -m "demo seed"
```

Open [http://localhost:8082](http://localhost:8082), sign in with **demo** / **demo**, wait a few seconds for jobs to appear, then run **mosscart-full** or **mosscart-smoke**. The running **api**/**web** stack uses **`JWT_SECRET`** from your host **`docker compose`** (see `docker-compose.yml`); **jenkins-demo** also sets `JWT_SECRET` for parity if you extend pipelines later.

To reset **only** demo Jenkins data, remove its volume (name is usually `<project>_jenkins_demo_home`, e.g. `mosscart_jenkins_demo_home`): `docker compose down` then `docker volume rm …`, or `docker volume ls` to find it.

The optional **profile `ci`** service **jenkins** on [http://localhost:8081](http://localhost:8081) is a separate, wizard-based controller: `docker compose --profile ci up -d jenkins`.

## Project layout

| Path | Purpose |
|------|---------|
| [`backend/`](backend/) | Express API, Prisma schema, SQLite, seed data |
| [`frontend/`](frontend/) | React SPA, Tailwind, `data-testid` hooks for tests |
| [`docker/`](docker/) | API + web Dockerfiles, Nginx config, [`docker/jenkins/`](docker/jenkins/) — [`Dockerfile`](docker/jenkins/Dockerfile), [`Dockerfile.demo`](docker/jenkins/Dockerfile.demo), [`jenkins-demo-entrypoint.sh`](docker/jenkins/jenkins-demo-entrypoint.sh), [`casc-demo.yaml`](docker/jenkins/casc-demo.yaml), [`init.groovy.d/`](docker/jenkins/init.groovy.d/), [`plugins.txt`](docker/jenkins/plugins.txt), [`plugins-demo-extra.txt`](docker/jenkins/plugins-demo-extra.txt) |
| [`jenkins/pipelines/`](jenkins/pipelines/) | Extra `Jenkinsfile.smoke` for a second job |
| [`test_automation/`](test_automation/) | Maven, Cucumber features, POM pages, hooks |
| [`docker-compose.yml`](docker-compose.yml) | Default: **`api` :3000**, **`web` :8080**, **`selenium`**, **`jenkins-demo` :8082**; profile **`test`**: `test-runner`; profile **`ci`**: `jenkins` :8081 |

## API summary

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products/categories` — distinct category labels
- `GET /api/products` — optional `q`, `category`, `ecoMin` query params
- `GET /api/products/:id`
- `GET|POST|PATCH|DELETE /api/cart...` (authenticated)
- `POST /api/checkout` — mock payment; optional query `?fail=true` / `?fail=1` simulates a declined card (order may be created with `payment_failed`). When the storefront is built with **`VITE_ENABLE_CHECKOUT_FAILURE_SIM`** (default in Compose `web` build) or run under **Vite dev**, the checkout page can send that flag via the **“Simulate payment decline”** control for UI tests.
- `GET|PUT /api/users/me`
- `GET /api/orders`, `GET /api/orders/:id`
- `GET /api/health`

## License

Demo / educational use.
