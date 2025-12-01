// GET a single work log by ID
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    const projectsCollection = db.collection('projects');
    const usersCollection = db.collection('users');
    
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
    
    // Look up project name if project ID is available
    if (workLog.project) {
      try {
        let projectId = workLog.project;
        
        // Convert to ObjectId if it's a string
        if (typeof projectId === 'string' && ObjectId.isValid(projectId)) {
          projectId = new ObjectId(projectId);
        }
        
        const project = await projectsCollection.findOne({ _id: projectId });
        if (project) {
          responseWorkLog.projectName = project.name;
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    }
    
    // Look up author name if author ID is available
    if (workLog.author) {
      try {
        let authorId = workLog.author;
        
        // Convert to ObjectId if it's a string
        if (typeof authorId === 'string' && ObjectId.isValid(authorId)) {
          authorId = new ObjectId(authorId);
        }
        
        const user = await usersCollection.findOne({ _id: authorId });
        if (user) {
          responseWorkLog.authorName = user.name;
        }
      } catch (error) {
        console.error('Error fetching author details:', error);
      }
    }
    
    // Convert ObjectIds to strings
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    // Convert project and author to ObjectId if they are strings
    const processedData: any = { ...data };

    if (processedData.project && typeof processedData.project === 'string' && ObjectId.isValid(processedData.project)) {
      processedData.project = new ObjectId(processedData.project);
    }

    if (processedData.author && typeof processedData.author === 'string' && ObjectId.isValid(processedData.author)) {
      processedData.author = new ObjectId(processedData.author);
    }

    // Add updatedAt timestamp
    const updatedData = {
      ...processedData,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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