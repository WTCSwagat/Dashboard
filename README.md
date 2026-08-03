# Kamel Analytics

An internal funnel-analytics dashboard for a rideshare product. A simulator generates
fake user sessions and POSTs them as raw events; an Express server ingests them and
computes funnel metrics at read time; a plain HTML dashboard displays the numbers.

Not a booking app — it shows how users move through the booking funnel and where they
drop off.

```
simulator  ──POST /events──►  server (in-memory)  ──GET /stats──►  dashboard
```

## Getting started

You need **Node.js v20 or newer**. Check with:

```bash
node -v
```

If that errors or shows an older version, install from [nodejs.org](https://nodejs.org).

### 1. Clone and install

```bash
git clone https://github.com/WTCSwagat/Dashboard.git
cd Dashboard
npm install
```

### 2. Start the server — terminal 1

```bash
npm run start
```

Leave this running. You should see:

```
listening on 3000
```

### 3. Open the dashboard

Go to **[http://localhost:3000](http://localhost:3000)**. Every number shows `–`,
because no events exist yet.

### 4. Generate events — terminal 2

Open a **second** terminal in the same folder:

```bash
npm run simulate
```

This creates 50 fake user sessions and POSTs roughly 100 events to the server. It
exits when finished.

### 5. Refresh

Click **Refresh** on the dashboard. The dashes become numbers.

Run `npm run simulate` again and refresh to watch the totals climb. Storage is
in-memory, so restarting the server clears everything.

### Checking it from the command line

```bash
curl -s localhost:3000/stats    # the aggregated numbers
curl -s localhost:3000/events   # the raw event log
```

### If something goes wrong

| Problem | Cause |
|---|---|
| `EADDRINUSE` on start | Port 3000 is taken. `lsof -ti:3000 \| xargs kill -9` |
| Dashboard shows `–` forever | Server isn't running, or step 4 was skipped |
| `npm run simulate` fails to connect | The server in terminal 1 isn't running |
| Numbers look doubled | Old events are still in memory; restart the server |

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
