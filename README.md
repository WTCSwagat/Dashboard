# Kamel Analytics

An internal funnel-analytics dashboard for a rideshare product. A simulator generates
fake user sessions and POSTs them as raw events; an Express server ingests them and
computes funnel metrics at read time; a plain HTML dashboard displays the numbers.

Not a booking app — it shows how users move through the booking funnel and where they
drop off.

```
simulator  ──POST /events──►  server (in-memory)  ──GET /stats──►  dashboard
```

## Run

```bash
npm install
npm run start      # terminal 1 — API + dashboard on :3000
npm run simulate   # terminal 2 — generates 50 fake sessions
```

Open [localhost:3000](http://localhost:3000) and click **Refresh**. Storage is
in-memory, so restarting the server clears all events.

## The event

```ts
interface RideEvent {
  event: "search_route" | "view_ride" | "book_ride";
  userId: string;
  timestamp: number;
  pickupLocation: string;
  dropoffLocation: string;
}
```

Events are raw records — counts are never stored on them. Every dashboard number is
computed from the event log at read time, so new questions can be asked of old data.

## The simulator

50 fake users, each on a random Northeast route. Every user emits `search_route`;
70% go on to `view_ride`; 40% of those emit `book_ride`. The nesting matters — you
cannot book a ride you never viewed, and the drop-off is what makes the funnel worth
analyzing.

## API

| Method | Path      | Description                            |
|--------|-----------|----------------------------------------|
| POST   | `/events` | Ingest one `RideEvent`                 |
| GET    | `/events` | Raw event log (debugging)              |
| GET    | `/stats`  | Aggregated funnel metrics              |
| GET    | `/`       | Dashboard (`public/index.html`)        |

```json
{ "totalEvents": 102, "uniqueUsers": 50, "searched": 50, "viewed": 35,
  "booked": 17, "searchToView": 70, "viewToBook": 49 }
```

Users at each stage are counted with `new Set(...).size`, not array length — one user
emits several events, so counting rows would count events, not people. Percentage
divisions are guarded against zero, since JS returns `NaN` rather than raising.

## Layout

```
src/types.ts       RideEvent interface
src/simulator.ts   generates fake sessions, POSTs them
src/server.ts      ingestion + stats math
public/index.html  dashboard
```

## Trade-offs

- In-memory storage, no database — events are lost on restart.
- No runtime validation; `req.body` is asserted as `RideEvent`, a compile-time claim
  only. Production would use Zod.
- Run with `tsx`, no build step. `npm run typecheck` runs `tsc --noEmit`.
- Server serves the dashboard via `express.static`, so `fetch("/stats")` is
  same-origin and needs no CORS setup.
