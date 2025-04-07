'use client'; // This component interacts with browser APIs (IndexedDB) and state

import React, { useState, useEffect, useCallback } from 'react';
import { getPendingWorkLogs, PendingWorkLogData } from '@/lib/indexedDBHelper';
import { syncPendingWorkLogs } from '@/lib/syncService';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui Button
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'; // Assuming shadcn/ui Card
// import { ScrollArea } from '@/components/ui/scroll-area'; // Commented out: Assuming shadcn/ui ScrollArea
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Commented out: Assuming shadcn/ui Alert

interface Project {
  _id: string;
  name: string;
  description?: string;
}

interface WorkLog {
  _id: string;
  date: Date;
  description: string;
  project?: string;
}

interface PendingSubmissionsProps {
  initialData: {
    projects: Project[];
    workLogs: WorkLog[];
  };
}

export const PendingSubmissions: React.FC<PendingSubmissionsProps> = ({ initialData }) => {
  const [pendingLogs, setPendingLogs] = useState<PendingWorkLogData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const getProjectName = (projectId: string) => {
    const project = initialData.projects.find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const logs = await getPendingWorkLogs();
      setPendingLogs(logs);
    } catch (err) {
      console.error("Failed to fetch pending logs:", err);
      setError("Could not load pending submissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Delay the initial fetch to allow main content to load first
    const timer = setTimeout(() => {
      fetchLogs();
    }, 1000);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const handleSync = async () => {
    if (isSyncing) {
      console.log("Sync already in progress.");
      return;
    }
    setIsSyncing(true);
    setSyncStatus("Syncing pending submissions.>>>>>..");

    try {
      const { successful, failed } = await syncPendingWorkLogs();
      if (successful > 0 || failed > 0) {
        setSyncStatus(`Sync finished: ${successful} successful, ${failed} failed.`);
      }
      // Clear message after delay
      setTimeout(() => setSyncStatus(null), 5000);
      // Refresh the list after sync
      fetchLogs();
    } catch (error) {
      console.error("Sync process error:", error);
      setSyncStatus("Error during synchronization process.");
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : pendingLogs.length === 0 ? (
          <div className="text-gray-500">No pending submissions</div>
        ) : (
          <div className="space-y-4">
            {pendingLogs.map((log) => (
              <div key={log.tempId} className="p-4 border rounded-lg">
                <div className="font-medium">{log.description}</div>
                {log.project && (
                  <div className="text-sm text-gray-500">
                    Project: {getProjectName(log.project)}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {new Date(log.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={fetchLogs}
          disabled={isLoading}
        >
          Refresh
        </Button>
        <Button
          onClick={handleSync}
          disabled={isSyncing || pendingLogs.length === 0}
        >
          {isSyncing ? "Syncing..." : "Sync All"}
        </Button>
      </CardFooter>
      {syncStatus && (
        <div className="px-4 pb-4 text-sm text-gray-500">
          {syncStatus}
        </div>
      )}
    </Card>
  );
}; 