'use client'; // This component handles client-side sync logic

import React, { useEffect, useState } from 'react';
import { initDB } from "@/lib/indexedDBHelper";
import { syncPendingWorkLogs } from "@/lib/syncService";

export const SyncManager: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    if (isSyncing) {
      console.log("Sync already in progress.");
      return;
    }
    setIsSyncing(true);

    try {
      const { successful, failed } = await syncPendingWorkLogs();
      if (successful > 0 || failed > 0) {
        setSyncMessage(`Sync finished: ${successful} successful, ${failed} failed.`);
        // Clear message after delay
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } catch (error) {
      console.error("Sync process error:", error);
      setSyncMessage("Error during synchronization process.");
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window === 'undefined') return;

    // Delay initialization until after main content loads
    const timer = setTimeout(() => {
      // Initialize DB and attempt initial sync if online
      initDB()
        .then(() => {
          console.log("Database initialized by SyncManager.");
          if (navigator.onLine) {
            handleSync();
          }
        })
        .catch(err => console.error("SyncManager failed to initialize DB:", err));
    }, 2000); // Delay initialization by 2 seconds

    const handleOnline = () => {
      console.log("Application came online (detected by SyncManager).");
      handleSync(); // Trigger sync when coming online
    };

    const handleOffline = () => {
      console.log("Application went offline (detected by SyncManager).");
      // Don't show message when going offline
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - only run once on mount

  // Render the sync status message (or null if no message)
  return syncMessage ? (
    <div style={{ position: 'fixed', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 1000 }}>
      {syncMessage}
    </div>
  ) : null;
}; 