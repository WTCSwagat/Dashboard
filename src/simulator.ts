export const routes = [
    { pickup: "Boston, MA", dropoff: "New York, NY" },
    { pickup: "New York, NY", dropoff: "Philadelphia, PA" },
    { pickup: "Philadelphia, PA", dropoff: "Washington, DC" },
    { pickup: "New Haven, CT", dropoff: "New York, NY" },
    { pickup: "Providence, RI", dropoff: "Boston, MA" },
    { pickup: "Amherst, MA", dropoff: "Boston, MA" },
    { pickup: "Ithaca, NY", dropoff: "New York, NY" },
    { pickup: "Princeton, NJ", dropoff: "Philadelphia, PA" },
  ];



async function emit(event:RideEvent["event"], userId: string, route: { pickup: string; dropoff: string; }) {
    await fetch("http://localhost:3000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({
            event: event,
            userId: userId,
            timestamp: Date.now(),
            pickupLocation: route.pickup,
            dropoffLocation: route.dropoff,
        }),
    });



}


for(let i = 0; i<50; i++){
    const userId = `user_${i}`;
    const route = routes[Math.floor(Math.random() * routes.length)];


    await emit("search_route", userId, route);

  if (Math.random() < 0.7) {
    await emit("view_ride", userId, route);

    if (Math.random() < 0.4) {
      await emit("book_ride", userId, route);
    }
  }
}



