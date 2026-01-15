import User from '@/models/User';
import Report from '@/models/Report';

export const POINTS_CONFIG = {
  REPORT_SUBMITTED: 10,
  REPORT_VERIFIED: 50,
  COMPOST_LISTING: 100,
  COMPOST_SOLD: 200,
  SEGREGATION_COMPLIANCE: 25,
};

export async function awardPoints(
  userId: string,
  points: number,
  reason: string
): Promise<{ success: boolean; newBalance: number }> {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { ecoPoints: points } },
      { new: true }
    );

    if (!user) {
      return { success: false, newBalance: 0 };
    }

    return { success: true, newBalance: user.ecoPoints };
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, newBalance: 0 };
  }
}

export async function getPointsHistory(userId: string) {
  try {
    // Get all reports by user
    const reports = await Report.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .select('type ecoPointsAwarded createdAt status');

    return reports.map((report) => ({
      action: `Report: ${report.type.replace('_', ' ')}`,
      points: report.ecoPointsAwarded,
      date: report.createdAt,
      status: report.status,
    }));
  } catch (error) {
    console.error('Error fetching points history:', error);
    return [];
  }
}

export async function getLeaderboard(limit: number = 10) {
  try {
    const topUsers = await User.find({ role: 'citizen' })
      .sort({ ecoPoints: -1 })
      .limit(limit)
      .select('name ecoPoints address.area');

    return topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      area: user.address?.area || 'Unknown',
      points: user.ecoPoints,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
