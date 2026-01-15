import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // 1. Reports by Type (for Pie Chart)
    const reportsByType = await Report.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Weekly Activity (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyActivity = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates for the last 7 days
    const filledWeeklyActivity = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = weeklyActivity.find(w => w._id === dateStr);
      filledWeeklyActivity.unshift({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: found ? found.count : 0
      });
    }

    // 3. Efficiency Metrics
    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
    const totalVehicles = await Vehicle.countDocuments();
    const fleetUptime = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    // 4. Summary Cards Data
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    return NextResponse.json({
      reportsByType: reportsByType.map(r => ({ name: r._id, value: r.count })),
      weeklyActivity: filledWeeklyActivity,
      efficiency: {
        resolutionRate,
        fleetUptime,
        citizenEngagement: totalCitizens // Just a raw number for now
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
