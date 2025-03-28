// Forms Page
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Edit, Plus, Trash } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { IWorkLog } from "@/lib/models/WorkLog"
import { IProject } from "@/lib/models/Project"
import { IUser } from "@/lib/models/User"
import mongoose from "mongoose"

export default function FormsPage() {
  const [workLogs, setWorkLogs] = useState<IWorkLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkLogs = async () => {
      try {
        const response = await fetch('/api/worklogs')
        if (!response.ok) {
          throw new Error('Failed to fetch work logs')
        }
        const data = await response.json()
        setWorkLogs(data)
      } catch (err) {
        setError('Error loading work logs')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkLogs()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work log?')) {
      try {
        const response = await fetch(`/api/worklogs/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete work log')
        }
        
        // Remove the deleted work log from state
        setWorkLogs(workLogs.filter(log => log._id !== id))
      } catch (err) {
        console.error('Error deleting work log:', err)
        alert('Failed to delete work log')
      }
    }
  }

  function isPopulatedProject(project: mongoose.Types.ObjectId | IProject): project is IProject {
    return typeof project === 'object' && project !== null && 'name' in project;
  }

  function isPopulatedUser(author: mongoose.Types.ObjectId | IUser): author is IUser {
    return typeof author === 'object' && author !== null && 'name' in author;
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
          <h1 className="text-2xl font-bold">Work Logs</h1>
        </div>
        <div className="flex gap-2">
        <Button asChild>
          <Link href="/forms/new">
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Link>
        </Button>
        <ThemeToggle />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading work logs...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : workLogs.length === 0 ? (
        <div className="text-center py-10">No work logs found. Create your first one!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workLogs.map((log) => (
            <Card key={log._id}>
              <CardHeader>
                <CardTitle>
                  {log.project && typeof log.project === 'object' && 'name' in log.project 
                    ? log.project.name 
                    : 'Unknown Project'}
                </CardTitle>
                <CardDescription>{new Date(log.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Author:</div>
                  <div>{log.author && isPopulatedUser(log.author) ? log.author.name : 'Unknown'}</div>
                  <div className="font-medium">Weather:</div>
                  <div>{log.weather || 'N/A'}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/forms/${log._id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => handleDelete(log._id.toString())}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

