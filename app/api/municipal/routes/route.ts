import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Route from '@/models/Route';
import Vehicle from '@/models/Vehicle';

export async function GET() {
  try {
    await connectDB();
    const routes = await Route.find()
      .populate('assignedVehicle', 'vehicleNumber driver status')
      .sort({ name: 1 });
    
    return NextResponse.json({ routes });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { routeId, vehicleId } = body;

    if (!routeId || !vehicleId) {
      return NextResponse.json({ error: 'Route ID and Vehicle ID are required' }, { status: 400 });
    }

    await connectDB();

    // 1. Find the route and the vehicle
    const route = await Route.findById(routeId);
    const vehicle = await Vehicle.findById(vehicleId);

    if (!route || !vehicle) {
      return NextResponse.json({ error: 'Route or Vehicle not found' }, { status: 404 });
    }

    // 2. If vehicle was assigned to another route, clear it
    if (vehicle.route) {
      const oldRouteId = typeof vehicle.route === 'object' && vehicle.route ? (vehicle.route as any)._id : vehicle.route;
      await Route.findByIdAndUpdate(oldRouteId, { assignedVehicle: null });
    }

    // 3. If route had another vehicle, clear that vehicle's route
    if (route.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(route.assignedVehicle, { route: null });
    }

    // 4. Assign new relationship
    route.assignedVehicle = vehicle._id as any;
    vehicle.route = route._id as any;

    await route.save();
    await vehicle.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle assigned to route successfully',
      route,
      vehicle
    });

  } catch (error) {
    console.error('Error assigning route:', error);
    return NextResponse.json({ error: 'Failed to assign route' }, { status: 500 });
  }
}
