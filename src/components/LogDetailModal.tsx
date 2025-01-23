import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Log } from '../types'

interface LogDetailModalProps {
  log: Log | null
  open: boolean
  onClose: () => void
}

export default function LogDetailModal({ log, open, onClose }: LogDetailModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  if (!log) return null

  const calculateHours = () => {
    const start = new Date(`${log.date}T${log.startTime}`)
    const end = new Date(`${log.date}T${log.endTime}`)
    return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)
  }

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null || !log.photos) return
    setSelectedPhotoIndex(prev => 
      prev === 0 ? log.photos.length - 1 : prev - 1
    )
  }

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null || !log.photos) return
    setSelectedPhotoIndex(prev => 
      prev === log.photos.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-yellow-900 mb-4">
                        Daily Log Details
                      </Dialog.Title>
                      
                      <div className="mt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700">Worker</h4>
                            <p className="mt-1 text-sm text-gray-900">{log.worker}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700">Project</h4>
                            <p className="mt-1 text-sm text-gray-900">{log.project}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700">Date</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(log.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700">Hours Worked</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {calculateHours()} hours
                              <span className="text-gray-500 ml-2">
                                ({new Date(`${log.date}T${log.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(`${log.date}T${log.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-yellow-700">Task Description</h4>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{log.task}</p>
                        </div>

                        {log.equipment && log.equipment.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700">Equipment Used</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {log.equipment.map((item) => (
                                <span
                                  key={item}
                                  className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-yellow-700">Weather Conditions</h4>
                          <p className="mt-1 text-sm text-gray-900">{log.weather}</p>
                        </div>

                        {log.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700">Additional Notes</h4>
                            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{log.notes}</p>
                          </div>
                        )}

                        {log.photos && log.photos.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700 mb-2">Photos</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {log.photos.map((photo, index) => (
                                <div 
                                  key={index} 
                                  className="relative aspect-[4/3] cursor-pointer"
                                  onClick={() => handlePhotoClick(index)}
                                >
                                  <img
                                    src={`http://localhost:3000${photo}`}
                                    alt={`Photo ${index + 1}`}
                                    className="absolute inset-0 h-full w-full object-cover rounded-lg hover:opacity-90"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Photo Lightbox */}
      <Transition.Root show={selectedPhotoIndex !== null} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setSelectedPhotoIndex(null)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-90" />
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="relative w-full max-w-5xl">
                <button
                  type="button"
                  className="absolute right-4 top-4 z-10 rounded-md bg-black/20 p-2 text-white hover:bg-black/30"
                  onClick={() => setSelectedPhotoIndex(null)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                {selectedPhotoIndex !== null && log.photos && (
                  <div className="relative aspect-[3/2] w-full">
                    <img
                      src={`http://localhost:3000${log.photos[selectedPhotoIndex]}`}
                      alt={`Photo ${selectedPhotoIndex + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white hover:bg-black/30"
                  onClick={handlePrevPhoto}
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white hover:bg-black/30"
                  onClick={handleNextPhoto}
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>

                {selectedPhotoIndex !== null && log.photos && (
                  <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                    {selectedPhotoIndex + 1} / {log.photos.length}
                  </div>
                )}
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
} 