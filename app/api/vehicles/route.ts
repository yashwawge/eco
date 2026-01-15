import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Vehicle from '@/models/Vehicle';

export async function GET() {
  try {
    await connectDB();
    const vehicles = await Vehicle.find({}).sort({ lastUpdated: -1 });
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const vehicle = await Vehicle.create(body);
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, currentLocation } = body;

    await connectDB();

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { currentLocation, lastUpdated: new Date() },
      { new: true }
    );

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Error updating vehicle location:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}
