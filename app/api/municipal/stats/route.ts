import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    // Recent reports for the feed
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reportedBy', 'name');

    return NextResponse.json({
      stats: {
        totalReports,
        pendingReports: totalReports - resolvedReports,
        resolvedRate: totalReports ? Math.round((resolvedReports / totalReports) * 100) : 0,
        activeVehicles,
        totalCitizens
      },
      recentReports
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
