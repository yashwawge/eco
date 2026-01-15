import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Schedule from '@/models/Schedule';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');

    await connectDB();

    const filter: any = {};
    if (area) filter.area = area;

    const schedules = await Schedule.find(filter)
      .populate('vehicleId')
      .sort({ scheduledTime: 1 });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const schedule = await Schedule.create(body);
    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
