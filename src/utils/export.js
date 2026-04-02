/**
 * Transforma un arreglo de objetos en un string formato CSV.
 * @param {Array} data - El array de objetos a exportar.
 * @param {Array} columns - Lista de keys de las columnas en el orden deseado.
 * @param {Array} headers - Títulos amigables a colocar en la cabecera.
 */
export function exportToCsv(data, columns, headers, filename) {
  if (!data || !data.length) return

  const csvRows = []
  
  // Agregar cabeceras
  csvRows.push(headers.join(','))

  // Agregar filas
  for (const row of data) {
    const values = columns.map(col => {
      let val = row[col] !== null && row[col] !== undefined ? row[col] : ''
      val = val.toString().replace(/"/g, '""') // escapar comillas dobles
      if (val.search(/(",|\n)/g) >= 0) {
        val = `"${val}"` // encapsular con comillas si hay comas o enter
      }
      return val
    })
    csvRows.push(values.join(','))
  }

  const csvString = csvRows.join('\n')
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }) // \uFEFF fuerza BOM para abrir como UTF-8 en Excel
  
  downloadBlob(blob, filename)
}

/**
 * Exporta un objeto como archivo JSON descargable.
 * @param {any} data - Datos a exportar.
 * @param {string} filename - Nombre del archivo resultante.
 */
export function exportToJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

/**
 * Exporta un backup completo de la BD (todas las tablas) como JSON.
 * @param {Object} tables - { usuarios, productos, ventas }
 */
export function exportFullBackup(tables) {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: 2,
    ...tables,
  }
  const date = new Date().toISOString().slice(0, 10)
  exportToJson(backup, `backup_surtiprais_${date}.json`)
}

/** Helper interno: descarga un Blob como archivo. */
function downloadBlob(blob, filename) {
  const link = document.createElement('a')
  const url  = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
