import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { UserRoles } from '../types/auth';

interface LayoutProps {
    user: { role: string }; // User object with a role
}

const getNavigationLinks = (role: string) => {
    const baseLinks = [
        { name: 'Dashboard', href: '/dashboard' },
    ];
    switch (role) {
        case UserRoles.ADMIN:
            return [
                ...baseLinks,
                { name: 'Projects', href: '/projects' },
                { name: 'Workers', href: '/workers' },
            ];
        case UserRoles.SITE_SUPERVISOR:
            return [
                ...baseLinks,
                { name: 'Daily Log', href: '/daily-log' },
                { name: 'Projects', href: '/projects' },
            ];
        case UserRoles.WORKER:
            return [
                ...baseLinks,
                { name: 'Daily Log', href: '/daily-log' },
            ];
        default:
            return baseLinks;
    }
};

export default function Layout({ user }: LayoutProps) {

    const navigation = user ? getNavigationLinks(user.role) : [];

    return (
    <div className="bg-yellow-50">
      <Disclosure as="nav" className="bg-yellow-600">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-white text-xl font-bold">Construction Logger</h1>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="text-white hover:bg-yellow-500 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-yellow-600 p-2 text-white hover:bg-yellow-500 focus:outline-none">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white hover:bg-yellow-500 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

        {/*<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>*/}
    </div>
  )
} 