// New Form Page
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Printer, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ThemeToggle } from "@/components/theme-toggle"
const formSchema = z.object({
  // Project Information
  date: z.string().min(1, { message: "Date is required" }),
  fileNumber: z.string().optional(),
  projectOwner: z.string().min(1, { message: "Project owner is required" }),
  project: z.string().min(1, { message: "Project is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  contractor: z.string().min(1, { message: "Contractor is required" }),
  engineer: z.string().min(1, { message: "Engineer is required" }),
  temperature: z.string().optional(),
  weather: z.string().optional(),

  // Personnel
  foremen: z.string().optional(),
  supervisors: z.string().optional(),
  technicians: z.string().optional(),
  assistants: z.string().optional(),
  workers: z.string().optional(),
  operators: z.string().optional(),
  drivers: z.string().optional(),

  // Work executed
  workExecuted: z.string().optional(),

  // Equipment
  equipment: z
    .array(
      z.object({
        type: z.string(),
        quantity: z.string(),
      }),
    )
    .optional(),

  // Materials
  materials: z
    .array(
      z.object({
        type: z.string(),
        quantity: z.string(),
      }),
    )
    .optional(),

  // Notes
  notes: z.string().optional(),
  contractorNotes: z.string().optional(),
})

export default function NewFormPage() {
  const [equipment, setEquipment] = useState([{ type: "", quantity: "" }])
  const [materials, setMaterials] = useState([{ type: "", quantity: "" }])
  const [defaultProjectId, setDefaultProjectId] = useState<string>("")

  useEffect(() => {
    const fetchDefaultProject = async () => {
      try {
        const response = await fetch('/api/projects/default')
        if (!response.ok) {
          throw new Error('Failed to fetch default project')
        }
        const data = await response.json()
        setDefaultProjectId(data._id)
      } catch (error) {
        console.error('Error fetching default project:', error)
      }
    }

    fetchDefaultProject()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      fileNumber: "",
      projectOwner: "",
      project: "",
      location: "",
      contractor: "",
      engineer: "",
      temperature: "",
      weather: "",
      foremen: "",
      supervisors: "",
      technicians: "",
      assistants: "",
      workers: "",
      operators: "",
      drivers: "",
      workExecuted: "",
      equipment: [{ type: "", quantity: "" }],
      materials: [{ type: "", quantity: "" }],
      notes: "",
      contractorNotes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Transform the form data to match IWorkLog interface
      const workLogData = {
        date: new Date(values.date),
        project: defaultProjectId, // Use the default project ID
        author: "65f8a7b2c4e8f3a1d2b3c4d5", // Replace with actual user ID from auth
        weather: values.weather || "",
        temperature: values.temperature ? parseFloat(values.temperature) : 0,
        workDescription: values.workExecuted || "",
        personnel: [
          { role: "Foremen", count: values.foremen ? parseInt(values.foremen) : 0 },
          { role: "Supervisors", count: values.supervisors ? parseInt(values.supervisors) : 0 },
          { role: "Technicians", count: values.technicians ? parseInt(values.technicians) : 0 },
          { role: "Assistants", count: values.assistants ? parseInt(values.assistants) : 0 },
          { role: "Workers", count: values.workers ? parseInt(values.workers) : 0 },
          { role: "Operators", count: values.operators ? parseInt(values.operators) : 0 },
          { role: "Drivers", count: values.drivers ? parseInt(values.drivers) : 0 }
        ].filter(p => p.count > 0),
        equipment: values.equipment?.map(e => ({
          type: e.type || "",
          count: e.quantity ? parseInt(e.quantity) : 0,
          hours: 0 // You might want to add this to your form
        })) || [],
        materials: values.materials?.map(m => ({
          name: m.type || "",
          quantity: m.quantity ? parseInt(m.quantity) : 0,
          unit: "units" // You might want to add this to your form
        })) || [],
        issues: "",
        notes: values.notes || "",
        images: []
      };

      const response = await fetch('/api/worklogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workLogData),
      });

      if (!response.ok) {
        throw new Error('Failed to save work log');
      }

      // Redirect to the forms list page
      window.location.href = '/forms';
    } catch (error) {
      console.error('Error saving work log:', error);
      alert('Failed to save work log. Please try again.');
    }
  }

  const addEquipmentRow = () => {
    setEquipment([...equipment, { type: "", quantity: "" }])
  }

  const addMaterialRow = () => {
    setMaterials([...materials, { type: "", quantity: "" }])
  }

  const updateEquipment = (index: number, field: string, value: string) => {
    const updatedEquipment = [...equipment]
    updatedEquipment[index] = { ...updatedEquipment[index], [field]: value }
    setEquipment(updatedEquipment)

    // Update form values
    const formEquipment = form.getValues("equipment") || []
    formEquipment[index] = { ...formEquipment[index], [field]: value }
    form.setValue("equipment", formEquipment)
  }

  const updateMaterial = (index: number, field: string, value: string) => {
    const updatedMaterials = [...materials]
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value }
    setMaterials(updatedMaterials)

    // Update form values
    const formMaterials = form.getValues("materials") || []
    formMaterials[index] = { ...formMaterials[index], [field]: value }
    form.setValue("materials", formMaterials)
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nέο Ημερολόγιο Εργασιών</h1>
        </div>
        <div className="flex gap-2">
        
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="project" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="project">Project Info</TabsTrigger>
              <TabsTrigger value="personnel">Εργαζόμενο Προσωπικό</TabsTrigger>
              <TabsTrigger value="equipment">Απασχολούμενα Μηχανήματα</TabsTrigger>
              <TabsTrigger value="materials">Προσκομισθέντα Υλικά</TabsTrigger>
              <TabsTrigger value="notes">Παρατηρήσεις</TabsTrigger>
            </TabsList>

            <TabsContent value="project" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ΗΜΕΡΟΛΟΓΙΟ ΕΡΓΑΣΙΩΝ</CardTitle>
                  <CardDescription>Παρακαλώ πληκτρολογήστε της λεπτομέριες του έργου</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ημερομηνία</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Αύξων Αριθμός</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Αύξων Αριθμός" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="projectOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Owner</FormLabel>
                        <FormControl>
                          <Input placeholder="Project Owner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <FormControl>
                          <Input placeholder="Project Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Project Location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contractor</FormLabel>
                        <FormControl>
                          <Input placeholder="Contractor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="engineer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supervising Engineer</FormLabel>
                        <FormControl>
                          <Input placeholder="Supervising Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature</FormLabel>
                        <FormControl>
                          <Input placeholder="Temperature" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personnel" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Προσωπικό & Εκτελούμενες Εργασίες</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">ΕΡΓΑΖΟΜΕΝΟ ΠΡΟΣΩΠΙΚΟ</h3>

                      <FormField
                        control={form.control}
                        name="foremen"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Εργοδηγοί</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Αριθμός των Εργοδηγών" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="supervisors"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Επιστάτες</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Αριθμός των Επιστατών" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="technicians"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Τεχνίτες</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Αριθμός Τεχνιτών" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="assistants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Βοηθοί</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Αριθμός Βοηθών" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Εργάτες</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Αριθμός Εργατών" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="operators"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Χειριστές</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Αριθμός Χειριστών" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="drivers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Οδηγοί</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Αριθμός Οδηγών" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">ΕΚΤΕΛΟΥΜΕΝΕΣ ΕΡΓΑΣΙΕΣ</h3>

                      <FormField
                        control={form.control}
                        name="workExecuted"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Συμπληρώστε εργασίες που έγιναν σήμερα"
                                className="min-h-[300px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ΑΠΑΣΧΟΛ. ΜΗΧΑΝΗΜΑΤΑ (Equipment Used)</CardTitle>
                  <CardDescription>Enter equipment details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%]">ΕΙΔΟΣ (Type)</TableHead>
                        <TableHead>ΑΡΙΘΜΟΣ (Quantity)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipment.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              placeholder="Equipment type"
                              value={item.type}
                              onChange={(e) => updateEquipment(index, "type", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Quantity"
                              value={item.quantity}
                              onChange={(e) => updateEquipment(index, "quantity", e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button type="button" variant="outline" className="mt-4" onClick={addEquipmentRow}>
                    Add Row
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ΠΡΟΣΚΟΜΙΣΘΕΝΤΑ ΥΛΙΚΑ (Materials Delivered)</CardTitle>
                  <CardDescription>Enter materials details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%]">ΕΙΔΟΣ (Type)</TableHead>
                        <TableHead>ΠΟΣΟΤΗΤΑ (Quantity)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              placeholder="Material type"
                              value={item.type}
                              onChange={(e) => updateMaterial(index, "type", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Quantity"
                              value={item.quantity}
                              onChange={(e) => updateMaterial(index, "quantity", e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button type="button" variant="outline" className="mt-4" onClick={addMaterialRow}>
                    Add Row
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ΠΑΡΑΤΗΡΗΣΕΙΣ</CardTitle>
                  <CardDescription>Συμπληρώστε πρόσθετες πληροφορίες</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter general notes" className="min-h-[150px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractorNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ΠΑΡΑΤΗΡΗΣΕΙΣ ΑΝΑΔΟΧΟΥ (Contractors Notes)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter contractor's notes" className="min-h-[150px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                    <div className="space-y-2">
                      <p className="text-xl font-medium">Ο ΕΡΓΟΔΗΓΟΣ</p>
                      <div className="h-20 border rounded-md"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-medium">Ο ΕΠΙΒΛΕΠΩΝ ΜΗΧΑΝΙΚΟΣ</p>
                      <div className="h-20 border rounded-md"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-medium">Ο ΑΝΑΔΟΧΟΣ</p>
                      <div className="h-20 border rounded-md"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

