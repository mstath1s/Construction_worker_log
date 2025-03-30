import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkLog, { IWorkLog } from '../lib/models/WorkLog';

export async function GET() {
  try {
    await dbConnect();
    const workLogs = await WorkLog.find({})
      .populate('project', 'name')
      .populate('author', 'name')
      .sort({ date: -1 });
    
    return NextResponse.json(workLogs);
  } catch (error) {
    console.error('Error fetching work logs:', error);
    return NextResponse.json({ error: 'Failed to fetch work logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    
    const workLog = new WorkLog(data);
    await workLog.save();
    
    return NextResponse.json(workLog, { status: 201 });
  } catch (error) {
    console.error('Error creating work log:', error);
    return NextResponse.json({ error: 'Failed to create work log' }, { status: 500 });
  }
} 