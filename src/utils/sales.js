export const PAYMENT_METHODS = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  CREDIT: 'Fiado'
}

export function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSaleOnDate(sale, dateKey = getLocalDateKey()) {
  return getLocalDateKey(sale?.date) === dateKey
}

export function normalizePaymentMethod(method) {
  const value = String(method || '').trim().toLowerCase()
  if (value === 'fiado' || value === 'credito' || value === 'crédito') return 'fiado'
  if (value === 'tarjeta' || value === 'card') return 'tarjeta'
  return 'efectivo'
}

export function saleTotal(sale) {
  return Number(sale?.total) || 0
}

export function saleCollectedAmount(sale) {
  const method = normalizePaymentMethod(sale?.method)
  if (method === 'fiado') return 0

  const total = saleTotal(sale)
  const paid = Number(sale?.paidAmount)
  const change = Number(sale?.change) || 0

  if (!Number.isFinite(paid) || paid <= 0) return total
  return Math.max(paid - change, 0)
}

export function saleCreditAmount(sale) {
  return normalizePaymentMethod(sale?.method) === 'fiado' ? saleTotal(sale) : 0
}
