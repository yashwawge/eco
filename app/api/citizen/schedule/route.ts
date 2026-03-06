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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the next upcoming schedule for the user's area
    const now = new Date();
    const query: any = {
      scheduledTime: { $gt: now },
      status: { $in: ['scheduled', 'in_transit'] },
    };

    // Only filter by area if user has an area set
    if (user.address?.area) {
      query.area = user.address.area;
    }

    const nextSchedule = await Schedule.findOne(query)
      .sort({ scheduledTime: 1 })
      .populate('vehicleId');

    return NextResponse.json({ schedule: nextSchedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
