// GET all work logs
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { DEFAULT_PAGE_SIZE, DB_CONNECTION_TIMEOUT_MS } from '@/lib/constants';

export async function GET() {
  try {
    // Connect with timeout
    await Promise.race([
      dbConnect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), DB_CONNECTION_TIMEOUT_MS)
      )
    ]);

    const db = mongoose.connection;
    const workLogsCollection = db.collection('worklogs');

    // Get all work logs, sort by date descending
    const workLogs = await workLogsCollection
      .find({})
      .sort({ date: -1 })
      .limit(DEFAULT_PAGE_SIZE)
      .toArray();

    return NextResponse.json(workLogs);
  } catch (error) {
    console.error('Error fetching work logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const startTime = Date.now();
    const data = await request.json();

    // Connect to database with timeout handling
    await Promise.race([
      dbConnect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), DB_CONNECTION_TIMEOUT_MS)
      )
    ]);
    
    const db = mongoose.connection;
    const workLogsCollection = db.collection('worklogs');
    
    // Add timestamps
    const workLogData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the document directly
    const result = await workLogsCollection.insertOne(workLogData);
    
    console.log(`Work log created in ${Date.now() - startTime}ms`);
    
    // Return the created work log with ID
    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...workLogData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating work log:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create work log',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 