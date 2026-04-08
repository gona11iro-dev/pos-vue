export function sanitizeBarcode(value) {
  return String(value ?? '').trim()
}

export function normalizeScannedBarcode(value, formatName = '') {
  const code = sanitizeBarcode(value)
  const format = String(formatName || '').toUpperCase()

  // Algunos lectores devuelven UPC-A como 13 dígitos con un 0 al frente.
  // Solo normalizamos cuando el propio lector reporta el formato UPC_A.
  if (format === 'UPC_A' && /^0\d{12}$/.test(code)) {
    return code.slice(1)
  }

  return code
}
