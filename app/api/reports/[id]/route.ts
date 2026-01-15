import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import { awardPoints, POINTS_CONFIG } from '@/lib/ecopoints';
import { sendReportUpdate, sendPointsAwarded } from '@/lib/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectDB();

    const report = await Report.findById(params.id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report
    Object.assign(report, body);

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

      sendPointsAwarded(
        report.reportedBy.toString(),
        additionalPoints,
        'verified report resolution'
      );
    }

    await report.save();

    // Send notification about status change
    sendReportUpdate(report.reportedBy.toString(), report.type, report.status);

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
