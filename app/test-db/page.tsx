"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestDBPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (data.status === 'success') {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.message)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to connect to database')
      console.error('Error testing database connection:', error)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                status === 'loading' ? 'bg-yellow-500' :
                status === 'success' ? 'bg-green-500' :
                'bg-red-500'
              }`} />
              <span className="capitalize">{status}</span>
            </div>
            <p>{message}</p>
            <Button onClick={testConnection}>Test Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 