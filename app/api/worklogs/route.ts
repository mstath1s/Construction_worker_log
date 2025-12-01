// GET all work logs
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { DEFAULT_PAGE_SIZE, DB_CONNECTION_TIMEOUT_MS } from '@/lib/constants';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
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
    
    // Get project filter from query parameters
    const { searchParams } = new URL(request.url);
    let projectId = searchParams.get('project');
    
    // Build query filter
    const filter: any = {};
    
    if (projectId) {
      projectId = projectId.trim()
        .replace(/^ObjectId\(['"]?/, "")
        .replace(/['"]?\)$/, "");

      const isValid = mongoose.Types.ObjectId.isValid(projectId);

      filter.$or = isValid
        ? [
            { project: projectId }, // string
            { project: new mongoose.Types.ObjectId(projectId) }, // ObjectId
          ]
        : [{ project: projectId }];
    }
    
    // Get work logs, sort by date descending
    const workLogs = await workLogsCollection
      .find(filter, {
        projection: {
          _id: 1,
          date: 1,
          project: 1,
          author: 1,
          workDescription: 1,
          createdAt: 1,
          updatedAt: 1
        }
      })
      .sort({ createdAt: -1 })
      .limit(DEFAULT_PAGE_SIZE)
      .toArray();

    const formattedWorkLogs = workLogs.map((log) => ({
      ...log,
      _id: log._id?.toString(),
      project: log.project?.toString(),
      author: log.author?.toString(),
      date: log.date instanceof Date ? log.date.toISOString() : log.date,
      createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
      updatedAt: log.updatedAt instanceof Date ? log.updatedAt.toISOString() : log.updatedAt,
    }));
    
    return NextResponse.json(formattedWorkLogs);
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
      project: new ObjectId(data.project), 
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