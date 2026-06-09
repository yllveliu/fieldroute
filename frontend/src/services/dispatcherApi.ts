export interface DispatcherCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface DispatcherTechnician {
  name: string;
  status: string;
}

export interface DispatcherJob {
  id: number;
  status: string;
  raw_description: string;
  eta_message: string | null;
  created_at: string;
  customer: DispatcherCustomer | null;
  service_name: string | null;
  technician: DispatcherTechnician | null;
}

// Temporary mock data — remove once backend is consistently available.
const MOCK_JOBS: DispatcherJob[] = [
  {
    id: 1,
    status: "open",
    raw_description: "AC unit not cooling — thermostat set to 72°F but house stays at 85°F.",
    eta_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customer: { name: "Maria Santos", phone: "555-0101", address: "142 Elm St, Springfield" },
    service_name: "HVAC Repair",
    technician: null,
  },
  {
    id: 2,
    status: "open",
    raw_description: "Kitchen sink completely clogged, standing water won't drain.",
    eta_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    customer: { name: "James Okafor", phone: "555-0182", address: "78 Maple Ave, Riverside" },
    service_name: null,
    technician: null,
  },
  {
    id: 3,
    status: "categorized",
    raw_description: "Electrical panel tripping breaker for master bedroom circuit.",
    eta_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    customer: { name: "Linda Park", phone: "555-0247", address: "310 Oak Blvd, Lakewood" },
    service_name: "Electrical",
    technician: null,
  },
  {
    id: 4,
    status: "assigned",
    raw_description: "Water heater producing lukewarm water only. Unit is 8 years old.",
    eta_message: "Technician arriving between 2–4 PM",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    customer: { name: "Carlos Rivera", phone: "555-0334", address: "55 Pine Rd, Hillcrest" },
    service_name: "Plumbing",
    technician: { name: "David Chen", status: "available" },
  },
  {
    id: 5,
    status: "en_route",
    raw_description: "Garage door opener stopped responding to remote and wall button.",
    eta_message: "ETA 20 minutes",
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    customer: { name: "Sarah Williams", phone: "555-0419", address: "901 Cedar Lane, Westview" },
    service_name: "Garage Door",
    technician: { name: "Priya Nair", status: "en_route" },
  },
];

export async function fetchDispatcherJobs(): Promise<DispatcherJob[]> {
  const url = "http://localhost:8000/dispatcher/jobs";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Dispatcher API fetch failed — using temporary mock data.", err);
    return MOCK_JOBS;
  }
}
