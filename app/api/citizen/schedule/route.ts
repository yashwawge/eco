import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Schedule from '@/models/Schedule';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    // Find the next upcoming schedule for the user's area
    // In a real app, we would match user.address.area exactly.
    // For this prototype, we'll try to match area or default to next available.
    
    const now = new Date();
    const nextSchedule = await Schedule.findOne({
      area: user?.address?.area || 'Koramangala', // Fallback if address missing
      scheduledTime: { $gt: now }
    }).sort({ scheduledTime: 1 });

    return NextResponse.json({ schedule: nextSchedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
