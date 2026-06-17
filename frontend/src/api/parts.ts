import { apiGet } from './client'

export interface Part {
  id: number
  name: string
  sku: string
  stock_quantity: number
  reserved_qty: number
  low_stock_threshold: number
}

export async function getParts(): Promise<Part[]> {
  return apiGet<Part[]>('/parts/')
}

export async function getPartById(id: number): Promise<Part> {
  return apiGet<Part>(`/parts/${id}`)
}
