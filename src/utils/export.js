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
      if (val.search(/("|,|\n)/g) >= 0) {
        val = `"${val}"` // encapsular con comillas si hay comas o enter
      }
      return val
    })
    csvRows.push(values.join(','))
  }

  const csvString = csvRows.join('\n')
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }) // \uFEFF fuerza BOM para abrir como UTF-8 en Excel
  
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
