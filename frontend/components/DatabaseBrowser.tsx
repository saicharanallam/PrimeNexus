import { useState, useEffect } from 'react'
import { TableCellsIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Table {
  name: string
  row_count: number | null
}

interface TableData {
  table_name: string
  columns: string[]
  total_count: number
  limit: number
  offset: number
  data: Record<string, any>[]
}

interface DatabaseBrowserProps {
  apiUrl?: string
}

export default function DatabaseBrowser({ apiUrl = 'http://localhost:8000' }: DatabaseBrowserProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const limit = 50

  useEffect(() => {
    loadTables()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable, 0)
    }
  }, [selectedTable])

  const loadTables = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${apiUrl}/api/database/tables`)
      if (!response.ok) throw new Error('Failed to load tables')
      const data = await response.json()
      setTables(data.tables)
    } catch (error: any) {
      console.error('Error loading tables:', error)
      setError(error.message || 'Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  const loadTableData = async (tableName: string, newOffset: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${apiUrl}/api/database/tables/${tableName}?limit=${limit}&offset=${newOffset}`)
      if (!response.ok) throw new Error('Failed to load table data')
      const data = await response.json()
      setTableData(data)
      setOffset(newOffset)
    } catch (error: any) {
      console.error('Error loading table data:', error)
      setError(error.message || 'Failed to load table data')
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName)
    setOffset(0)
  }

  const handlePreviousPage = () => {
    if (tableData && offset > 0) {
      const newOffset = Math.max(0, offset - limit)
      loadTableData(selectedTable!, newOffset)
    }
  }

  const handleNextPage = () => {
    if (tableData && offset + limit < tableData.total_count) {
      const newOffset = offset + limit
      loadTableData(selectedTable!, newOffset)
    }
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...'
    }
    return String(value)
  }

  if (selectedTable && tableData) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4 transition-colors">
          <button
            onClick={() => {
              setSelectedTable(null)
              setTableData(null)
              setOffset(0)
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Back to tables"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">{tableData.table_name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              {tableData.total_count} total rows • Showing {offset + 1}-{Math.min(offset + limit, tableData.total_count)} of {tableData.total_count}
            </p>
          </div>
        </div>

        {/* Table Data */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {tableData.data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-600 dark:text-slate-400 transition-colors">No data in this table</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-700 transition-colors">
                    {tableData.columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-900/50 sticky top-0 transition-colors"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.data.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {tableData.columns.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-3 text-sm text-slate-900 dark:text-slate-200 whitespace-nowrap transition-colors"
                        >
                          <div className="max-w-xs truncate" title={formatValue(row[col])}>
                            {formatValue(row[col])}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {tableData.total_count > limit && (
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
            <button
              onClick={handlePreviousPage}
              disabled={offset === 0 || loading}
              className="px-4 py-2 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              Page {Math.floor(offset / limit) + 1} of {Math.ceil(tableData.total_count / limit)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={offset + limit >= tableData.total_count || loading}
              className="px-4 py-2 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-colors">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">Database Tables</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors">Browse and view database tables</p>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
            <button
              onClick={loadTables}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading && tables.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-slate-600 border-t-sky-500 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 transition-colors">Loading tables...</p>
            </div>
          </div>
        ) : tables.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600 dark:text-slate-400 transition-colors">No tables found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <button
                key={table.name}
                onClick={() => handleTableSelect(table.name)}
                className="p-4 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:border-sky-500/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TableCellsIcon className="h-5 w-5 text-sky-500 dark:text-sky-400 transition-colors" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                    {table.name}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                  {table.row_count !== null ? `${table.row_count.toLocaleString()} rows` : 'Unknown'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

