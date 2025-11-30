import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connected successfully' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to connect to database' 
    }, { status: 500 });
  }
} 