import type { JobDetail, Technician, Part } from '@/api'

// TODO: replace with API call — getTechnicians()
export const MOCK_TECHNICIANS: Technician[] = [
  { id: 1, name: 'Diego Ramos',   skills: ['plumbing', 'pipework'],       status: 'available', current_job: null },
  { id: 2, name: 'Aisha Khan',    skills: ['electrical', 'wiring'],        status: 'available', current_job: null },
  { id: 3, name: 'Sam Whitfield', skills: ['HVAC', 'refrigeration'],       status: 'available', current_job: 3    },
  { id: 4, name: 'Priya Nair',    skills: ['plumbing', 'drainage'],        status: 'on_job',    current_job: 4    },
  { id: 5, name: 'Marcus Lee',    skills: ['electrical', 'solar'],         status: 'available', current_job: 5    },
  { id: 6, name: 'Nina Costa',    skills: ['HVAC', 'ventilation'],         status: 'available', current_job: null },
]

// TODO: replace with API call — getJobById(id)
export const MOCK_JOBS: JobDetail[] = [
  {
    id: 1, status: 'new',
    service_name: 'Plumbing Repair',
    problem_description: 'Burst pipe under kitchen sink',
    eta_message: null, technician: null,
    ai_service_type: null, ai_confidence: null, ai_explanation: null,
  },
  {
    id: 2, status: 'categorized',
    service_name: 'Electrical Inspection',
    problem_description: 'Flickering lights, possible short',
    eta_message: null, technician: null,
    ai_service_type: 'Electrical', ai_confidence: 0.80,
    ai_explanation: 'Matched 2 Electrical keyword(s) in problem description.',
  },
  {
    id: 3, status: 'assigned',
    service_name: 'HVAC Maintenance',
    problem_description: 'AC unit not cooling properly',
    eta_message: null,
    technician: { id: 3, name: 'Sam Whitfield', status: 'available' },
    ai_service_type: 'HVAC', ai_confidence: 0.80,
    ai_explanation: 'Matched 2 HVAC keyword(s) in problem description.',
  },
  {
    id: 4, status: 'en_route',
    service_name: 'Drain Cleaning',
    problem_description: 'Blocked main drain',
    eta_message: 'ETA 15 minutes',
    technician: { id: 4, name: 'Priya Nair', status: 'on_job' },
    ai_service_type: 'Plumbing', ai_confidence: 0.65,
    ai_explanation: 'Matched 1 Plumbing keyword(s) in problem description.',
  },
  {
    id: 5, status: 'done',
    service_name: 'Solar Panel Install',
    problem_description: 'Annual solar panel inspection',
    eta_message: null,
    technician: { id: 5, name: 'Marcus Lee', status: 'available' },
    ai_service_type: 'Electrical', ai_confidence: 0.65,
    ai_explanation: 'Matched 1 Electrical keyword(s) in problem description.',
  },
  {
    id: 6, status: 'new',
    service_name: 'Ventilation Service',
    problem_description: 'Poor airflow in office building',
    eta_message: null, technician: null,
    ai_service_type: null, ai_confidence: null, ai_explanation: null,
  },
]

// TODO: replace with API call — getParts()
export const MOCK_PARTS: Part[] = [
  { id: 1, name: 'PVC Pipe 2in',        sku: 'SKU-PVC-075', stock_quantity: 50,  reserved_qty: 0,  low_stock_threshold: 5  },
  { id: 2, name: 'Copper Wire 12AWG',   sku: 'SKU-CWR-120', stock_quantity: 200, reserved_qty: 10, low_stock_threshold: 20 },
  { id: 3, name: 'HVAC Filter 16x25',   sku: 'SKU-HVF-162', stock_quantity: 30,  reserved_qty: 5,  low_stock_threshold: 5  },
  { id: 4, name: 'Circuit Breaker 20A', sku: 'SKU-CBK-020', stock_quantity: 15,  reserved_qty: 2,  low_stock_threshold: 5  },
  { id: 5, name: 'Drain Snake 25ft',    sku: 'SKU-DRS-025', stock_quantity: 8,   reserved_qty: 0,  low_stock_threshold: 3  },
  { id: 6, name: 'Refrigerant R-410A',  sku: 'SKU-REF-410', stock_quantity: 12,  reserved_qty: 3,  low_stock_threshold: 5  },
  { id: 7, name: 'Pipe Wrench 14in',    sku: 'SKU-PWR-014', stock_quantity: 6,   reserved_qty: 0,  low_stock_threshold: 2  },
  { id: 8, name: 'Electrical Tape',     sku: 'SKU-ETP-001', stock_quantity: 40,  reserved_qty: 0,  low_stock_threshold: 10 },
]
