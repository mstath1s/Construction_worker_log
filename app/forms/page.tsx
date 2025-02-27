import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Edit, Plus, Trash } from "lucide-react"

export default function FormsPage() {
  // In a real app, you would fetch this data from a database
  const forms = [
    {
      id: "1",
      date: "2024-02-27",
      project: "Apartment Complex Phase 1",
      location: "Athens",
      contractor: "BuildCo Ltd",
    },
    {
      id: "2",
      date: "2024-02-26",
      project: "Apartment Complex Phase 1",
      location: "Athens",
      contractor: "BuildCo Ltd",
    },
    {
      id: "3",
      date: "2024-02-25",
      project: "Apartment Complex Phase 1",
      location: "Athens",
      contractor: "BuildCo Ltd",
    },
  ]

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Work Logs</h1>
        </div>
        <Button asChild>
          <Link href="/forms/new">
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <CardTitle>{form.project}</CardTitle>
              <CardDescription>{form.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Location:</div>
                <div>{form.location}</div>
                <div className="font-medium">Contractor:</div>
                <div>{form.contractor}</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/forms/${form.id}`}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

