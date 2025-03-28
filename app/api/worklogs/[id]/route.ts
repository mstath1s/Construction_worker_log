// GET a single work log by ID
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkLog from '@/lib/models/WorkLog';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const workLog = await WorkLog.findById(params.id)
      .populate('project')
      .populate('author', 'name email');
    
    if (!workLog) {
      return NextResponse.json({ error: 'Work log not found' }, { status: 404 });
    }
    
    return NextResponse.json(workLog);
  } catch (error) {
    console.error('Error fetching work log:', error);
    return NextResponse.json({ error: 'Failed to fetch work log' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    await dbConnect();
    
    const workLog = await WorkLog.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!workLog) {
      return NextResponse.json({ error: 'Work log not found' }, { status: 404 });
    }
    
    return NextResponse.json(workLog);
  } catch (error) {
    console.error('Error updating work log:', error);
    return NextResponse.json({ error: 'Failed to update work log' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const workLog = await WorkLog.findByIdAndDelete(params.id);
    
    if (!workLog) {
      return NextResponse.json({ error: 'Work log not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Work log deleted successfully' });
  } catch (error) {
    console.error('Error deleting work log:', error);
    return NextResponse.json({ error: 'Failed to delete work log' }, { status: 500 });
  }
} 