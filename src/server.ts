import express from "express";
export interface RideEvent {
    event: "search_route" | "view_ride" | "book_ride";
    userId: string;
    timestamp: number;
    pickupLocation: string;
    dropoffLocation: string;
}



const app = express();

app.use(express.json());
app.use(express.static("public"));

const events: RideEvent[] = [];

app.post("/events", (req, res) => {
    events.push(req.body);
    res.json({ ok: true });
  
});

app.get("/stats", (req, res) => {
    const searched = new Set(events.filter(e => e.event === "search_route").map(e => e.userId)).size;
    
      const viewed = new Set(
        events.filter(e => e.event === "view_ride").map(e => e.userId)
      ).size;
    
      const booked = new Set(
        events.filter(e => e.event === "book_ride").map(e => e.userId)
      ).size;
    const searchToView = searched === 0 ? 0 : (viewed / searched) * 100; 
    const viewToBook = viewed === 0 ? 0 : (booked / viewed) * 100;

    res.json({
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        searched,
        viewed,
        booked,
        searchToView: Math.round(searchToView),
        viewToBook: Math.round(viewToBook),
      });
    });


app.listen(3000, () => console.log("listening on 3000"));


