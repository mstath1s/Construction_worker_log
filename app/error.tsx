'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

/**
 * Root error boundary for the application
 * Catches unhandled errors and provides recovery UI
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline">
            Go home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
