import { useState, useEffect } from 'react'
import { ClockIcon, UserGroupIcon, BuildingOfficeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import LogDetailModal from '../components/LogDetailModal'
import { Log } from '../types'

export default function Dashboard() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<string>('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/logs')
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }
      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const workers = Array.from(new Set(logs.map(log => log.worker))).sort()

  const filteredLogs = logs.filter(log => {
    const matchesWorker = !selectedWorker || log.worker === selectedWorker
    const matchesDate = (!dateRange.startDate || log.date >= dateRange.startDate) &&
                       (!dateRange.endDate || log.date <= dateRange.endDate)
    return matchesWorker && matchesDate
  })

  // Calculate statistics
  const stats = [
    { 
      name: 'Active Workers', 
      stat: String(new Set(filteredLogs.map(log => log.worker)).size),
      icon: UserGroupIcon 
    },
    { 
      name: 'Active Projects', 
      stat: String(new Set(filteredLogs.map(log => log.project)).size),
      icon: BuildingOfficeIcon 
    },
    { 
      name: 'Today\'s Logs', 
      stat: String(filteredLogs.filter(log => log.date === new Date().toISOString().split('T')[0]).length),
      icon: DocumentTextIcon 
    },
    { 
      name: 'Total Hours Today', 
      stat: String(filteredLogs
        .filter(log => log.date === new Date().toISOString().split('T')[0])
        .reduce((total, log) => {
          const start = new Date(`${log.date}T${log.startTime}`)
          const end = new Date(`${log.date}T${log.endTime}`)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          return total + hours
        }, 0).toFixed(1)
      ),
      icon: ClockIcon 
    },
  ]

  const handleLogClick = (log: Log) => {
    setSelectedLog(log)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-900">Dashboard</h2>
        <p className="mt-1 text-sm text-yellow-700">Overview of today's construction activities</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="worker" className="block text-sm font-medium text-yellow-700">
              Filter by Worker
            </label>
            <select
              id="worker"
              className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
            >
              <option value="">All Workers</option>
              {workers.map(worker => (
                <option key={worker} value={worker}>{worker}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-yellow-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-yellow-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-yellow-700">{item.name}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-yellow-900">{item.stat}</dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-yellow-900">Recent Logs</h3>
        </div>
        <div className="border-t border-yellow-200">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-yellow-700">Loading logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-yellow-700">No logs found</p>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-yellow-200">
              {filteredLogs.map((log) => (
                <li
                  key={log.id}
                  className="px-4 py-4 sm:px-6 hover:bg-yellow-50 cursor-pointer"
                  onClick={() => handleLogClick(log)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-yellow-600 truncate">{log.worker}</p>
                      <p className="text-sm text-yellow-500">{log.project}</p>
                      <p className="mt-1 text-sm text-yellow-900">{log.task}</p>
                      {log.photos && log.photos.length > 0 && (
                        <div className="mt-2 flex -space-x-2 overflow-hidden">
                          {log.photos.slice(0, 3).map((photo, index) => (
                            <img
                              key={index}
                              src={`http://localhost:3000${photo}`}
                              alt={`Photo ${index + 1}`}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                          {log.photos.length > 3 && (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 ring-2 ring-white">
                              <span className="text-xs font-medium text-yellow-600">
                                +{log.photos.length - 3}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="flex flex-col items-end">
                        <p className="text-sm text-yellow-900">
                          {new Date(`${log.date}T${log.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(`${log.date}T${log.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-yellow-500">{new Date(log.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <LogDetailModal
        log={selectedLog}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
} 