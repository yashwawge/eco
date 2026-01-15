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
    
    // 1. Get User Balance
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Synthesize History from Reports & Compost Sales
    // Reports
    const reports = await Report.find({ reportedBy: user._id, ecoPointsAwarded: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .select('type ecoPointsAwarded createdAt status')
      .limit(10);
    
    // Compost
    const sales = await CompostListing.find({ seller: user._id, status: 'sold' })
      .sort({ createdAt: -1 })
      .select('title quantity createdAt');

    // Combine and format
    const history = [
      ...reports.map(r => ({
        points: r.ecoPointsAwarded || 10,
        reason: `Report: ${r.type.replace('_', ' ')}`,
        date: new Date(r.createdAt).toLocaleDateString(),
        type: 'credit'
      })),
      ...sales.map(s => ({
        points: 50, // Fixed points for sale for now or calculate
        reason: `Sold: ${s.title}`,
        date: new Date(s.createdAt).toLocaleDateString(),
        type: 'credit'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // 3. Leaderboard
    const leaderboard = await User.find({ role: 'citizen' })
      .sort({ ecoPoints: -1 })
      .limit(5)
      .select('name ecoPoints');

    return NextResponse.json({
      balance: user.ecoPoints,
      history,
      leaderboard
    });

  } catch (error) {
    console.error('Error fetching ecopoints:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
