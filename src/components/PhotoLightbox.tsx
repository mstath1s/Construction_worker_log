import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PhotoLightboxProps {
  photos: string[]
  initialPhotoIndex: number
  open: boolean
  onClose: () => void
}

export default function PhotoLightbox({ photos, initialPhotoIndex, open, onClose }: PhotoLightboxProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex)

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="relative w-full max-w-5xl transform overflow-hidden transition-all">
              <div className="absolute right-4 top-4 z-10">
                <button
                  type="button"
                  className="rounded-md bg-black/20 p-2 text-white hover:bg-black/30 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="relative aspect-[3/2] w-full">
                <img
                  src={`http://localhost:3000${photos[currentPhotoIndex]}`}
                  alt={`Photo ${currentPhotoIndex + 1}`}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="absolute inset-y-0 left-4 flex items-center">
                <button
                  type="button"
                  className="rounded-full bg-black/20 p-2 text-white hover:bg-black/30 focus:outline-none"
                  onClick={handlePrevious}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="absolute inset-y-0 right-4 flex items-center">
                <button
                  type="button"
                  className="rounded-full bg-black/20 p-2 text-white hover:bg-black/30 focus:outline-none"
                  onClick={handleNext}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 