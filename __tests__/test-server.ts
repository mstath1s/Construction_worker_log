import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
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
  const requestStart = Date.now();
  
  try {
    // Add a timeout guard for the entire function
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${Date.now() - requestStart}ms`));
      }, 10000); // 10 second maximum
    });
    
    const resultPromise = processUserCreation(request);
    return await Promise.race([timeoutPromise, resultPromise]);
    
  } catch (error) {
    console.error(`User creation failed after ${Date.now() - requestStart}ms:`, error);
    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 }
    );
  }
}

export async function dbConnect(timeoutMs = 5000) {
  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Database connection timeout'));
    }, timeoutMs);
    
    try {
      if (cached.conn) {
        clearTimeout(timer);
        return resolve(cached.conn);
      }
      
      cached.promise = mongoose.connect(MONGODB_URI!, opts);
      cached.conn = await cached.promise;
      clearTimeout(timer);
      resolve(cached.conn);
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
  });
} 

// Remove any unnecessary processing or heavy operations
// Add performance logging
// console.time('user-creation');
// const result = await usersCollection.insertOne(newUser);
// console.timeEnd('user-creation'); 