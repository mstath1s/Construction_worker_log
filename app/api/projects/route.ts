import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import mongoose from "mongoose";
import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(['planned', 'in-progress', 'completed', 'on-hold']).optional(),
  manager: z.string().optional(),
});

export async function GET() {
  try {
    await dbConnect();
    const db = mongoose.connection;
    const projectsCollection = db.collection('projects');
    
    // If no projects exist, create a default one
    const count = await projectsCollection.countDocuments();
    if (count === 0) {
      const defaultProject = {
        name: "Default Project",
        description: "Default project for work logs",
        location: "Default Location",
        client: "Default Client",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: 'active',
        budget: 100000,
      };
      
      await projectsCollection.insertOne(defaultProject);
    }
    
    // Return all projects
    const projects = await projectsCollection.find({}).toArray();
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const db = mongoose.connection;
    const projectsCollection = db.collection('projects');
    
    // Get project data from request
    const projectData = await request.json();
    
    // Validate project data
    const validatedData = ProjectSchema.safeParse(projectData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues },
        { status: 400 }
      );
    }
    
    // Create new project with required defaults
    const newProject = {
      ...validatedData.data,
      startDate: validatedData.data.startDate || new Date(),
      endDate: validatedData.data.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: validatedData.data.status || 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert into database
    const result = await projectsCollection.insertOne(newProject);
    
    // Return the created project with _id in the correct format
    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...newProject
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
