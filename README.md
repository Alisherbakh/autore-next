# Autore Next

Car selling website frontend (Next.js 14, pages router) — same structure as nestar-next, connected to the `autore` NestJS backend.

## Setup

```bash
yarn install
yarn dev
```

Backend (`~/Desktop/autore`) must be running on port 3009 — see `.env.development`:

```
REACT_APP_API_URL=http://localhost:3009
REACT_APP_API_GRAPHQL_URL=http://localhost:3009/graphql
REACT_APP_API_WS=ws://localhost:3009
```

Open http://localhost:3000

## Pages

- `/` — home
- `/car`, `/car/detail` — car list with filters (brand, type, fuel, transmission, year, mileage, price) and detail
- `/dealer`, `/dealer/detail` — dealers
- `/community`, `/cs`, `/mypage`, `/member`, `/account/join`
- `/_admin` — admin panel (users, cars, community, cs)

## Images to replace

- `public/img/banner/types/{sedan,suv,hatchback,coupe,convertible,wagon,van,pickup}.webp` — car type banners (gradient is shown until added)
- `public/img/logo/*` — logo (still the old one)
- `public/img/car/*`, `public/img/banner/cars.png`, `public/img/banner/dealers.webp` — placeholder images copied from nestar-next
