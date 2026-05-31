export const MOCK_METRICS = {
  revenue: 24500,
  revenueGrowth: "+12.5%",
  bookings: 142,
  bookingsGrowth: "+8.2%",
  activeListings: 24,
  occupancyRate: "85%",
  occupancyGrowth: "+4.1%"
};

export const MOCK_PROPERTIES = [
  { id: "1", name: "Lumley Beach Villa", type: "Short-term", price: 120, status: "Occupied" },
  { id: "2", name: "Aberdeen Studio", type: "Hourly", price: 15, status: "Available" },
  { id: "3", name: "Signal Hill Penthouse", type: "Short-term", price: 200, status: "Maintenance" },
  { id: "4", name: "Congo Cross Flat", type: "Hourly", price: 10, status: "Occupied" },
  { id: "5", name: "Juba Hill Mansion", type: "Short-term", price: 350, status: "Available" }
];

export const MOCK_ACTIVITIES = [
  { id: "1", message: "New booking for Lumley Beach Villa", time: "2 mins ago", type: "booking" },
  { id: "2", message: "Checkout completed at Aberdeen Studio", time: "1 hour ago", type: "checkout" },
  { id: "3", message: "Payment received ($240)", time: "3 hours ago", type: "payment" },
  { id: "4", message: "Maintenance request: Signal Hill Penthouse", time: "5 hours ago", type: "alert" }
];
