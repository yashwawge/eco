import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import { awardPoints, POINTS_CONFIG } from '@/lib/ecopoints';
import { sendPointsAwarded } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    await connectDB();

    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.reportedBy = userId;

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const report = await Report.create({
      ...body,
      ecoPointsAwarded: POINTS_CONFIG.REPORT_SUBMITTED,
    });

    // Award points for submitting report
    await awardPoints(
      body.reportedBy,
      POINTS_CONFIG.REPORT_SUBMITTED,
      'Submitting a report'
    );

    sendPointsAwarded(
      body.reportedBy,
      POINTS_CONFIG.REPORT_SUBMITTED,
      'submitting a report'
    );

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
