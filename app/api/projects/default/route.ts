import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/lib/models/Project';

export async function GET() {
  try {
    await dbConnect();
    
    // Try to find the default project
    let defaultProject = await Project.findOne({ name: "Default Project" });
    
    // If no default project exists, create one
    if (!defaultProject) {
      defaultProject = await Project.create({
        name: "Default Project",
        description: "Default project for work logs",
        location: "Default Location",
        startDate: new Date(),
        status: 'in-progress',
        manager: "65f8a7b2c4e8f3a1d2b3c4d5" // Default manager ID
      });
    }
    
    return NextResponse.json(defaultProject);
  } catch (error) {
    console.error('Error getting default project:', error);
    return NextResponse.json({ error: 'Failed to get default project' }, { status: 500 });
  }
} 