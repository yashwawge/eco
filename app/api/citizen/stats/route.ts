import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Report from '@/models/Report';
import CompostListing from '@/models/CompostListing';

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

    const reportCount = await Report.countDocuments({ reportedBy: user._id });
    const compostSold = await CompostListing.aggregate([
      { $match: { seller: user._id, status: 'sold' } },
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
    ]);

    // Calculate total quantity sold (default to 0 if no sales)
    const totalCompostSold = compostSold.length > 0 ? compostSold[0].totalQty : 0;

    return NextResponse.json({
      ecoPoints: user.ecoPoints || 0,
      reportsSubmitted: reportCount,
      compostSold: totalCompostSold
    });
  } catch (error) {
    console.error('Error fetching citizen stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
