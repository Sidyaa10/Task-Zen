import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = await clientPromise;
    const db = client.db();
    
    // Get database info
    const dbStats = await db.stats();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    
    // Get server status
    const serverStatus = await db.command({ serverStatus: 1 });
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
      database: {
        name: db.databaseName,
        stats: {
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize
        },
        collections: collections.map(c => c.name)
      },
      server: {
        host: serverStatus.host,
        version: serverStatus.version,
        process: serverStatus.process,
        pid: serverStatus.pid,
        uptime: serverStatus.uptime
      }
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    const err = error as Error & { code?: string };
    
    // Check if it's a connection error
    const isConnectionError = err.name === 'MongoServerSelectionError' || 
                            err.name === 'MongoNetworkError';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to MongoDB',
        details: {
          message: err.message,
          name: err.name,
          isConnectionError,
          // Only include stack trace in development
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack, code: err.code })
        }
      },
      { status: 500 }
    );
  }
}

// Add a simple health check endpoint
export async function HEAD() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
