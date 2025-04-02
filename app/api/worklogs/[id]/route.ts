// GET a single work log by ID
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid work log ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    const db = mongoose.connection;
    const workLogsCollection = db.collection('worklogs');
    
    // Find work log by ID
    const workLog = await workLogsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!workLog) {
      return NextResponse.json(
        { error: 'Work log not found' },
        { status: 404 }
      );
    }
    
    // Create a properly typed response object
    const responseWorkLog: any = {
      ...workLog,
      _id: workLog._id.toString()
    };
    
    // If project and author are ObjectIds, we should convert them as well
    if (workLog.project instanceof ObjectId) {
      responseWorkLog.project = workLog.project.toString();
    }
    
    if (workLog.author instanceof ObjectId) {
      responseWorkLog.author = workLog.author.toString();
    }
    
    return NextResponse.json(responseWorkLog);
  } catch (error) {
    console.error('Error fetching work log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work log' },
      { status: 500 }
    );
  }
}

// Update a work log by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid work log ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    const db = mongoose.connection;
    const workLogsCollection = db.collection('worklogs');
    
    // Add updatedAt timestamp
    const updatedData = {
      ...data,
      updatedAt: new Date()
    };
    
    // Update the work log
    const result = await workLogsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: 'Work log not found' },
        { status: 404 }
      );
    }
    
    // Create a properly typed response object
    const responseWorkLog: any = {
      ...result,
      _id: result._id.toString()
    };
    
    return NextResponse.json(responseWorkLog);
  } catch (error) {
    console.error('Error updating work log:', error);
    return NextResponse.json(
      { error: 'Failed to update work log' },
      { status: 500 }
    );
  }
}

// Delete a work log by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid work log ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    const db = mongoose.connection;
    const workLogsCollection = db.collection('worklogs');
    
    // Delete the work log
    const result = await workLogsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Work log not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work log:', error);
    return NextResponse.json(
      { error: 'Failed to delete work log' },
      { status: 500 }
    );
  }
} 