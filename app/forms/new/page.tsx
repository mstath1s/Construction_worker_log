"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { fetchProjects, fetchUsers, createProject, createUser, ProjectWithId, UserWithId } from '@/lib/data-fetchers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"

// Define the form schema with all fields
const workLogSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  project: z.string().min(1, 'Project is required'),
  author: z.string().min(1, 'Author is required'),
  weather: z.string().optional(),
  temperature: z.number().optional(),
  workDescription: z.string().min(1, 'Work description is required'),
  personnel: z.array(z.object({
    role: z.string(),
    count: z.number().min(0)
  })).optional(),
  equipment: z.array(z.object({
    type: z.string(),
    count: z.number().min(0),
    hours: z.number().min(0)
  })).optional(),
  materials: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
    unit: z.string()
  })).optional(),
  notes: z.string().optional()
})

type WorkLogFormData = z.infer<typeof workLogSchema>

export default function NewWorkLogForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [projects, setProjects] = useState<ProjectWithId[]>([])
  const [users, setUsers] = useState<UserWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // New state for the add project/user dialogs
  const [newProject, setNewProject] = useState({ name: '', description: '', location: '' })
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<WorkLogFormData>({
    resolver: zodResolver(workLogSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      personnel: [{ role: '', count: 0 }],
      equipment: [{ type: '', count: 0, hours: 0 }],
      materials: [{ name: '', quantity: 0, unit: '' }]
    }
  })

  // Add refs for dialog handling
  const projectDialogCloseRef = useRef<HTMLButtonElement>(null)
  const userDialogCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch projects and users data
        const projectsData = await fetchProjects()
        const usersData = await fetchUsers()
        
        setProjects(projectsData)
        setUsers(usersData)

        // Set default values if we have data
        if (projectsData.length > 0 && !watch('project')) {
          setValue('project', projectsData[0]._id)
        }

        // Set default author based on session or first user if available
        if (session?.user?.email) {
          const currentUser = usersData.find((user: UserWithId) => 
            user.email === session.user?.email
          )
          if (currentUser) {
            setValue('author', currentUser._id)
          } else if (usersData.length > 0) {
            setValue('author', usersData[0]._id)
          }
        } else if (usersData.length > 0 && !watch('author')) {
          setValue('author', usersData[0]._id)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load form data')
        setIsLoading(false)
      }
    }

    loadData()
  }, [session, setValue, watch])

  // Add debug output to check state updates
  useEffect(() => {
    console.log('Projects updated:', projects)
  }, [projects])
  
  useEffect(() => {
    console.log('Users updated:', users)
  }, [users])

  const onSubmit = async (data: WorkLogFormData) => {
    try {
      setSubmitError(null)
      
      // Validate required fields
      if (!data.project) {
        setSubmitError('Project is required. Please select a project.')
        return
      }
      
      if (!data.author) {
        setSubmitError('Author is required. Please select an author.')
        return  
      }

      const response = await fetch('/api/worklogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create work log')
      }

      toast.success('Work log created successfully')
      router.push('/worklogs')
    } catch (error) {
      console.error('Error creating work log:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create work log')
      toast.error('Failed to create work log')
    }
  }

  const addPersonnel = () => {
    const currentPersonnel = watch('personnel') || []
    setValue('personnel', [...currentPersonnel, { role: '', count: 0 }])
  }

  const addEquipment = () => {
    const currentEquipment = watch('equipment') || []
    setValue('equipment', [...currentEquipment, { type: '', count: 0, hours: 0 }])
  }

  const addMaterial = () => {
    const currentMaterials = watch('materials') || []
    setValue('materials', [...currentMaterials, { name: '', quantity: 0, unit: '' }])
  }

  const handleAddProject = async () => {
    try {
      setIsAddingProject(true)
      
      // Use the helper function instead of direct fetch
      const createdProject = await createProject(newProject)
      
      if (!createdProject) {
        throw new Error('Failed to create project')
      }
      
      console.log('Created project:', createdProject)
      
      // Add the new project to the list and select it
      setProjects(prevProjects => [...prevProjects, createdProject])
      setValue('project', createdProject._id)
      
      // Reset the form
      setNewProject({ name: '', description: '', location: '' })
      toast.success('Project created successfully')
      
      // Close the dialog programmatically
      projectDialogCloseRef.current?.click()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsAddingProject(false)
    }
  }

  const handleAddUser = async () => {
    try {
      setIsAddingUser(true)
      
      // Use the helper function instead of direct fetch
      const createdUser = await createUser(newUser)
      
      if (!createdUser) {
        throw new Error('Failed to create user')
      }
      
      console.log('Created user:', createdUser)
      
      // Add the new user to the list and select it
      setUsers(prevUsers => [...prevUsers, createdUser])
      setValue('author', createdUser._id)
      
      // Reset the form
      setNewUser({ name: '', email: '' })
      toast.success('User created successfully')
      
      // Close the dialog programmatically
      userDialogCloseRef.current?.click()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    } finally {
      setIsAddingUser(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>New Work Log Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Basic Information</h2>
              
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
                  <p>{submitError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                  />
                  {errors.date && <p className="text-red-500">{errors.date.message}</p>}
                </div>

                <div>
                  <Label htmlFor="project">Project</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Select 
                        onValueChange={(value) => setValue('project', value)}
                        value={watch('project') || ''}
                        required
                      >
                        <SelectTrigger id="project" className={errors.project ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.length > 0 ? (
                            <>
                              {projects.map((project) => (
                                <SelectItem key={project._id} value={project._id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <SelectItem value="no-projects" disabled>No projects available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" type="button" size="icon" className="h-10 w-10">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Project</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label htmlFor="projectName">Name</Label>
                            <Input
                              id="projectName"
                              value={newProject.name}
                              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="projectDescription">Description</Label>
                            <Textarea
                              id="projectDescription"
                              value={newProject.description}
                              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="projectLocation">Location</Label>
                            <Input
                              id="projectLocation"
                              value={newProject.location}
                              onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => {
                            setNewProject({ name: '', description: '', location: '' })
                          }}>Cancel</Button>
                          <Button 
                            type="button" 
                            onClick={handleAddProject}
                            disabled={isAddingProject || !newProject.name}
                          >
                            {isAddingProject ? 'Creating...' : 'Create Project'}
                          </Button>
                          <DialogClose ref={projectDialogCloseRef} className="hidden" />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {errors.project && <p className="text-red-500">{errors.project.message}</p>}
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Select 
                        onValueChange={(value) => setValue('author', value)}
                        value={watch('author') || ''}
                        required
                      >
                        <SelectTrigger id="author" className={errors.author ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.length > 0 ? (
                            <>
                              {users.map((user) => (
                                <SelectItem key={user._id} value={user._id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <SelectItem value="no-users" disabled>No users available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" type="button" size="icon" className="h-10 w-10">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label htmlFor="userName">Name</Label>
                            <Input
                              id="userName"
                              value={newUser.name}
                              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="userEmail">Email</Label>
                            <Input
                              id="userEmail"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => {
                            setNewUser({ name: '', email: '' })
                          }}>Cancel</Button>
                          <Button 
                            type="button"
                            onClick={handleAddUser}
                            disabled={isAddingUser || !newUser.name || !newUser.email}
                          >
                            {isAddingUser ? 'Creating...' : 'Create User'}
                          </Button>
                          <DialogClose ref={userDialogCloseRef} className="hidden" />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {errors.author && <p className="text-red-500">{errors.author.message}</p>}
                </div>

                <div>
                  <Label htmlFor="weather">Weather</Label>
                  <Input
                    id="weather"
                    {...register('weather')}
                  />
                  {errors.weather && <p className="text-red-500">{errors.weather.message}</p>}
                </div>

                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    {...register('temperature', { valueAsNumber: true })}
                  />
                  {errors.temperature && <p className="text-red-500">{errors.temperature.message}</p>}
                </div>
              </div>
            </div>

            {/* Work Description Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Work Description</h2>
              <div>
                <Label htmlFor="workDescription">Details</Label>
                <Textarea
                  id="workDescription"
                  {...register('workDescription')}
                  rows={4}
                />
                {errors.workDescription && <p className="text-red-500">{errors.workDescription.message}</p>}
              </div>
            </div>

            {/* Personnel Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Personnel</h2>
              <div className="space-y-4">
                {watch('personnel')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
                    <div>
                      <Label>Role</Label>
                      <Input
                        placeholder="Role"
                        {...register(`personnel.${index}.role`)}
                      />
                    </div>
                    <div>
                      <Label>Count</Label>
                      <Input
                        type="number"
                        placeholder="Count"
                        {...register(`personnel.${index}.count`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addPersonnel} className="mt-2">
                  Add Personnel
                </Button>
              </div>
            </div>

            {/* Equipment Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Equipment</h2>
              <div className="space-y-4">
                {watch('equipment')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                    <div>
                      <Label>Type</Label>
                      <Input
                        placeholder="Type"
                        {...register(`equipment.${index}.type`)}
                      />
                    </div>
                    <div>
                      <Label>Count</Label>
                      <Input
                        type="number"
                        placeholder="Count"
                        {...register(`equipment.${index}.count`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label>Hours</Label>
                      <Input
                        type="number"
                        placeholder="Hours"
                        {...register(`equipment.${index}.hours`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addEquipment} className="mt-2">
                  Add Equipment
                </Button>
              </div>
            </div>

            {/* Materials Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Materials</h2>
              <div className="space-y-4">
                {watch('materials')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                    <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="Name"
                        {...register(`materials.${index}.name`)}
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        {...register(`materials.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        placeholder="Unit"
                        {...register(`materials.${index}.unit`)}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addMaterial} className="mt-2">
                  Add Material
                </Button>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Additional Notes</h2>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  rows={3}
                />
                {errors.notes && <p className="text-red-500">{errors.notes.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Saving...
                </>
              ) : 'Submit Work Log'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

