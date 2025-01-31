import { useState } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

interface DailyLogForm {
  worker: string
  project: string
  date: string
  startTime: string
  endTime: string
  task: string
  equipment: string[]
  weather: string
  notes: string
}

const projects = [
  'City Center Mall',
  'Riverside Apartments',
  'Highway Bridge Project',
  'School Renovation'
]

const equipmentOptions = [
  'Excavator',
  'Crane',
  'Bulldozer',
  'Concrete Mixer',
  'Power Tools',
  'Hand Tools',
  'Scaffolding',
  'Other'
]

const weatherOptions = [
  'Sunny',
  'Cloudy',
  'Rainy',
  'Windy',
  'Storm',
  'Snow'
]

export default function DailyLog() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<DailyLogForm>({
    worker: user?.displayName || '',
    project: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    task: '',
    equipment: [],
    weather: '',
    notes: ''
  })

  const [photos, setPhotos] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 5) {
      setError('Maximum 5 photos allowed')
      return
    }
    
    setError(null)
    setPhotos(prev => [...prev, ...files])
    
    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file))
    setPhotoUrls(prev => [...prev, ...newUrls])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(photoUrls[index])
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('data', JSON.stringify(formData))
      photos.forEach(photo => {
        formDataToSend.append('photos', photo)
      })

      const response = await fetch('http://localhost:3000/api/logs', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to submit log')
      }

      const result = await response.json()
      console.log('Log submitted:', result)
      
      // Clear form
      setFormData({
        worker: user?.displayName || '',
        project: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        task: '',
        equipment: [],
        weather: '',
        notes: ''
      })
      setPhotos([])
      photoUrls.forEach(url => URL.revokeObjectURL(url))
      setPhotoUrls([])
      
      alert('Log submitted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit log')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEquipmentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(value)
        ? prev.equipment.filter(item => item !== value)
        : [...prev.equipment, value]
    }))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-yellow-900">Daily Work Log</h2>
          <p className="mt-1 text-sm text-yellow-700">Record your daily construction activities</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Worker Name */}
          <div>
            <label htmlFor="worker" className="block text-sm font-medium text-yellow-900">
              Worker Name
            </label>
            <input
              type="text"
              id="worker"
              required
              className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              value={formData.worker}
              onChange={e => setFormData(prev => ({ ...prev, worker: e.target.value }))}
            />
          </div>

          {/* Project */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-yellow-900">
              Project
            </label>
            <select
              id="project"
              required
              className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              value={formData.project}
              onChange={e => setFormData(prev => ({ ...prev, project: e.target.value }))}
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-yellow-900">
              Date
            </label>
            <input
              type="date"
              id="date"
              required
              className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-yellow-900">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                required
                className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                value={formData.startTime}
                onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-yellow-900">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                required
                className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                value={formData.endTime}
                onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Task Description */}
        <div>
          <label htmlFor="task" className="block text-sm font-medium text-yellow-900">
            Task Description
          </label>
          <textarea
            id="task"
            rows={3}
            required
            className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            value={formData.task}
            onChange={e => setFormData(prev => ({ ...prev, task: e.target.value }))}
            placeholder="Describe the work performed today..."
          />
        </div>

        {/* Equipment Used */}
        <div>
          <label className="block text-sm font-medium text-yellow-900 mb-2">
            Equipment Used
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {equipmentOptions.map(equipment => (
              <label key={equipment} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                  checked={formData.equipment.includes(equipment)}
                  onChange={() => handleEquipmentChange(equipment)}
                />
                <span className="ml-2 text-sm text-yellow-900">{equipment}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div>
          <label htmlFor="weather" className="block text-sm font-medium text-yellow-900">
            Weather Conditions
          </label>
          <select
            id="weather"
            required
            className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            value={formData.weather}
            onChange={e => setFormData(prev => ({ ...prev, weather: e.target.value }))}
          >
            <option value="">Select weather condition</option>
            {weatherOptions.map(weather => (
              <option key={weather} value={weather}>{weather}</option>
            ))}
          </select>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-yellow-900 mb-2">
            Photos (Max 5)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-yellow-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-yellow-400" />
              <div className="flex text-sm text-yellow-900">
                <label htmlFor="photos" className="relative cursor-pointer rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                  <span>Upload photos</span>
                  <input
                    id="photos"
                    name="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoChange}
                    disabled={photos.length >= 5}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-yellow-700">
                PNG, JPG, JPEG up to 5MB each
              </p>
            </div>
          </div>
          
          {/* Photo Previews */}
          {photoUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photoUrls.map((url, index) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 rounded-full bg-yellow-600 p-1 text-white hover:bg-yellow-700"
                    onClick={() => removePhoto(index)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-yellow-900">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional comments or concerns..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Log'}
          </button>
        </div>
      </form>
    </div>
  )
} 