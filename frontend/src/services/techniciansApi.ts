export interface Technician {
  id: number;
  name: string;
  skills: string[] | null;
  status: string;
}

const MOCK_TECHNICIANS: Technician[] = [
  { id: 1, name: "Marco Rossi",   skills: ["plumbing", "pipe fitting"],     status: "available" },
  { id: 2, name: "Sara Kelmendi", skills: ["electrical", "panel upgrades"], status: "available" },
  { id: 3, name: "Liam Novak",    skills: ["hvac", "refrigeration"],        status: "on_job"    },
  { id: 4, name: "Ana Ferreira",  skills: ["plumbing", "hvac"],             status: "available" },
  { id: 5, name: "Jake Thornton", skills: ["carpentry", "drywall"],         status: "available" },
  { id: 6, name: "Drita Hoxha",   skills: ["electrical", "lighting"],       status: "off"       },
];

export async function fetchTechnicians(): Promise<Technician[]> {
  try {
    const res = await fetch("http://localhost:8000/technicians/");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Technicians API fetch failed — using mock data.", err);
    return MOCK_TECHNICIANS;
  }
}
