// app/worklogs/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

interface WorkLog {
  _id: string;
  date: string;
  project: string;
  author: string;
  workDescription: string;
}

export default function WorkLogsPage() {
  const router = useRouter();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/worklogs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch work logs');
        }
        
        const data = await response.json();
        setWorkLogs(data);
      } catch (error) {
        console.error('Error fetching work logs:', error);
        setError('Failed to load work logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkLogs();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Work Logs</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Work Logs</h1>
        <Link href="/forms/new">
          <Button>Create New</Button>
        </Link>
      </div>

      {error && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && workLogs.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">No work logs found</p>
            <Link href="/forms/new">
              <Button className="mt-4">Create Your First Work Log</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!error && workLogs.length > 0 && (
        <div className="grid gap-4">
          {workLogs.map((log) => (
            <Card key={log._id}>
              <CardHeader>
                <CardTitle>{new Date(log.date).toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Work Description:</strong> {log.workDescription}</p>
                <div className="mt-4">
                  <Link href={`/worklogs/${log._id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}