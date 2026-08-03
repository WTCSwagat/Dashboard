export interface RideEvent {
    event: "search_route" | "view_ride" | "book_ride";
    userId: string;
    timestamp: number;
    pickupLocation: string;
    dropoffLocation: string;
}




