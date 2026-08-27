type SizeRow = Record<string, string | null | undefined>

type SizeChartProps = {
  category: 'polera' | 'chaqueta' | 'pantalon'
  rows: SizeRow[]
}

const CATEGORY_LABELS: Record<string, string> = {
  polera: 'Polera',
  chaqueta: 'Chaqueta',
  pantalon: 'Pantalón',
}

const CATEGORY_COLUMNS: Record<string, string[]> = {
  polera: ['talla', 'pecho', 'largo'],
  chaqueta: ['talla', 'pecho', 'largo', 'manga'],
  pantalon: ['talla', 'cintura', 'largo'],
}

const COLUMN_LABELS: Record<string, string> = {
  talla: 'Talla',
  pecho: 'Pecho',
  largo: 'Largo',
  manga: 'Manga',
  cintura: 'Cintura',
}

export function SizeChart({ category, rows }: SizeChartProps) {
  if (!rows || rows.length === 0) return null

  const columns = CATEGORY_COLUMNS[category] ?? []

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-lg font-medium">Guía de tallas — {CATEGORY_LABELS[category]}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-left font-medium text-zinc-600">
                  {COLUMN_LABELS[col] ?? col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2">
                    {row[col] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
