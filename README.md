> This repository is now archived. Work has started on the new version of PESU-tix under Nexus

# Pesu-tix

All-in-one Ticketing system for all PESU events

## Getting Started

#### 1. Set up environment variables

Copy over the example env file

```bash
cp .env.example .env
```

#### 2. Installing dependencies

<details><summary><b>`pnpm` Setup instructions</b></summary>
You can setup pnpm using npm. This method is dependent on having node already.

```bash
npm i -g pnpm
```

For other methods like node-independent setup, [check out the official docs](https://pnpm.io/installation)

</details><br>

```bash
pnpm install
```

#### 3. Set up sqlite DB

- Create sqlite DB file

```bash
touch prisma/db.sqlite
```

- Sync Prisma schema to SQLite DB

```bash
pnpm prisma db push
```

#### 4. Run the app

```bash
npm run dev
```
