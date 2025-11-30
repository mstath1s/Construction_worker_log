import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import WorkLog, { IWorkLog } from '../lib/models/WorkLog';
import mongoose from 'mongoose';

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
    await dbConnect();
    const body = await request.json();
    const workLog = await WorkLog.create(body);

    return NextResponse.json(workLog, { status: 201 });
  } catch (error) {
    console.error('Error creating work log:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create work log';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 