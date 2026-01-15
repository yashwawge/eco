import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import CompostListing from '@/models/CompostListing';

export async function GET() {
  try {
    await connectDB();
    const listings = await CompostListing.find({ status: 'available' })
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching compost listings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    const listing = await CompostListing.create({
      seller: session.user.id,
      title: `${body.type.replace('_', ' ')}` || 'Compost', // Generate title
      description: body.description,
      quantity: body.quantity,
      price: body.pricePerKg, // Schema uses 'price'
      type: body.type || 'vermicompost',
      location: {
         coordinates: { lat: body.location?.lat || 12.9716, lng: body.location?.lng || 77.5946 },
         address: body.location?.address || 'Bangalore'
      }, // In real app, we'd use body location
      status: 'available',
      photos: [] // Optional for now
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating compost listing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
