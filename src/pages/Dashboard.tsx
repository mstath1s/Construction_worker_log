import { ClockIcon, UserGroupIcon, BuildingOfficeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const stats = [
  { name: 'Active Workers', stat: '12', icon: UserGroupIcon },
  { name: 'Active Projects', stat: '4', icon: BuildingOfficeIcon },
  { name: 'Today\'s Logs', stat: '8', icon: DocumentTextIcon },
  { name: 'Total Hours Today', stat: '96', icon: ClockIcon },
]

const recentLogs = [
  {
    worker: 'John Smith',
    project: 'City Center Mall',
    task: 'Concrete foundation work',
    hours: 8,
    date: '2024-03-20',
  },
  {
    worker: 'Mike Johnson',
    project: 'Riverside Apartments',
    task: 'Electrical wiring installation',
    hours: 7.5,
    date: '2024-03-20',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of today's construction activities</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.stat}</dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Logs</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {recentLogs.map((log) => (
              <li key={`${log.worker}-${log.date}`} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">{log.worker}</p>
                    <p className="text-sm text-gray-500">{log.project}</p>
                    <p className="mt-1 text-sm text-gray-900">{log.task}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-900">{log.hours} hours</p>
                      <p className="text-sm text-gray-500">{log.date}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 