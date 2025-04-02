import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    const db = mongoose.connection;
    const usersCollection = db.collection('users');
    
    // If no users exist, create a default one
    const count = await usersCollection.countDocuments();
    if (count === 0) {
      const defaultUser = {
        name: "Default User",
        email: "default@example.com",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await usersCollection.insertOne(defaultUser);
    }
    
    // Return a basic list of users with required fields for the form
    const users = await usersCollection.find({}).project({
      name: 1,
      email: 1,
    }).toArray();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const db = mongoose.connection;
    const usersCollection = db.collection('users');
    
    // Get user data from request
    const userData = await request.json();
    
    // Validate required fields
    if (!userData.name || !userData.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    
    // Check if email is already in use
    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    
    // Create new user with defaults
    const newUser = {
      ...userData,
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert into database
    const result = await usersCollection.insertOne(newUser);
    
    // Return the created user with _id in the correct format
    return NextResponse.json({
      _id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
} 