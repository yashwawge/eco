import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { awardPoints, POINTS_CONFIG } from '@/lib/ecopoints';
import { uploadImage } from '@/lib/cloudinary';

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    // Get user from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upload photos to Cloudinary if provided
    let photoUrls: string[] = [];
    if (body.photos && Array.isArray(body.photos)) {
      for (const photo of body.photos) {
        if (photo) {
          try {
            const result = await uploadImage(photo, 'eco-waste/reports');
            photoUrls.push(result.url);
          } catch (error) {
            console.error('Error uploading photo:', error);
            // Continue with other photos even if one fails
          }
        }
      }
    }

    const report = await Report.create({
      reportedBy: user._id,
      type: body.type,
      description: body.description,
      location: body.location,
      photos: photoUrls,
      ecoPointsAwarded: POINTS_CONFIG.REPORT_SUBMITTED,
    });

    // Award points for submitting report
    await awardPoints(
      user._id.toString(),
      POINTS_CONFIG.REPORT_SUBMITTED,
      'Submitting a report'
    );

    // Create notification
    await Notification.create({
      userId: user._id,
      title: 'Eco-Points Earned! 🌱',
      message: `You've earned ${POINTS_CONFIG.REPORT_SUBMITTED} Eco-Points for submitting a report. Keep up the great work!`,
      type: 'reward',
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
