import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import Notification from '@/models/Notification';
import { awardPoints, POINTS_CONFIG } from '@/lib/ecopoints';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await connectDB();
    const report = await Report.findById(params.id).populate('reportedBy', 'name email');

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    await connectDB();

    const report = await Report.findById(params.id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report fields
    if (body.status) report.status = body.status;
    if (body.assignedTo) report.assignedTo = body.assignedTo;
    if (body.completionPhoto) report.completionPhoto = body.completionPhoto;
    if (body.priority) report.priority = body.priority;

    // If resolved, award verification points
    if (body.status === 'resolved' && report.status !== 'resolved') {
      report.resolvedAt = new Date();
      const additionalPoints = POINTS_CONFIG.REPORT_VERIFIED;
      report.ecoPointsAwarded += additionalPoints;

      await awardPoints(
        report.reportedBy.toString(),
        additionalPoints,
        'Report verified and resolved'
      );

      // Create notification for points awarded
      await Notification.create({
        userId: report.reportedBy,
        title: 'Eco-Points Earned! 🌱',
        message: `You've earned ${additionalPoints} Eco-Points for verified report resolution. Keep up the great work!`,
        type: 'reward',
      });
    }

    await report.save();

    // Send notification about status change
    if (body.status) {
      const statusMessages: Record<string, string> = {
        assigned: 'Your report has been assigned to a cleanup crew.',
        in_progress: 'Cleanup crew is working on your reported issue.',
        resolved: 'Your reported issue has been resolved. Thank you for keeping our city clean!',
      };

      const message = statusMessages[body.status] || `Your report status: ${body.status}`;

      await Notification.create({
        userId: report.reportedBy,
        title: 'Report Status Update',
        message,
        type: 'report',
      });
    }

    // Populate reportedBy before returning
    const updatedReport = await Report.findById(params.id).populate('reportedBy', 'name email');

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
