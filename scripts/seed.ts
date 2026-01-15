import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/db';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Report from '../models/Report';
import Schedule from '../models/Schedule';
import CompostListing from '../models/CompostListing';
import Route from '../models/Route';

async function seed() {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Report.deleteMany({});
    await Schedule.deleteMany({});
    await CompostListing.deleteMany({});
    await Route.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const citizen1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      password: hashedPassword,
      role: 'citizen',
      phone: '+91 98765 43210',
      address: {
        street: '123 MG Road',
        area: 'Koramangala',
        city: 'Bangalore',
        pincode: '560034',
        coordinates: { lat: 12.9352, lng: 77.6245 },
      },
      ecoPoints: 450,
    });

    const citizen2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: hashedPassword,
      role: 'citizen',
      phone: '+91 98765 43211',
      address: {
        street: '45 Brigade Road',
        area: 'Indiranagar',
        city: 'Bangalore',
        pincode: '560038',
        coordinates: { lat: 12.9716, lng: 77.6412 },
      },
      ecoPoints: 680,
    });

    const municipal = await User.create({
      name: 'BBMP Admin',
      email: 'admin@bbmp.gov.in',
      password: hashedPassword,
      role: 'municipal',
      phone: '+91 80 2222 3333',
      address: {
        street: 'BBMP Head Office',
        area: 'City Center',
        city: 'Bangalore',
        pincode: '560001',
        coordinates: { lat: 12.9716, lng: 77.5946 },
      },
      ecoPoints: 0,
    });

    console.log('✅ Created users');

    // Create Routes first
    const routes = await Route.create([
      {
        name: 'Route A - Koramangala South',
        startLocation: { lat: 12.9340, lng: 77.6100, address: 'Koramangala Depot' },
        endLocation: { lat: 12.9352, lng: 77.6245, address: 'Landfill Ext' },
        waypoints: [
            { lat: 12.9345, lng: 77.6150 },
            { lat: 12.9360, lng: 77.6200 },
        ],
        totalDistance: 5.2,
        estimatedDuration: 45,
        status: 'active',
        optimized: true,
      },
      {
        name: 'Route B - Indiranagar Central',
        startLocation: { lat: 12.9700, lng: 77.6400, address: 'Indiranagar Station' },
        endLocation: { lat: 12.9716, lng: 77.6412, address: 'Transfer Station B' },
        waypoints: [
            { lat: 12.9705, lng: 77.6405 },
            { lat: 12.9710, lng: 77.6410 },
        ],
        totalDistance: 3.8,
        estimatedDuration: 30,
        status: 'active',
        optimized: true,
      },
      {
        name: 'Route C - Whitefield Main',
        startLocation: { lat: 12.9690, lng: 77.7400, address: 'Whitefield Depot' },
        endLocation: { lat: 12.9698, lng: 77.7500, address: 'Processing Unit C' },
        waypoints: [
            { lat: 12.9692, lng: 77.7450 },
            { lat: 12.9695, lng: 77.7480 },
        ],
        totalDistance: 7.5,
        estimatedDuration: 60,
        status: 'pending',
        optimized: false,
      },
    ]);

    console.log('✅ Created routes');

    // Create vehicles and assign to routes
    const vehicles = await Vehicle.create([
      {
        vehicleNumber: 'KA-01-AB-1234',
        type: 'garbage_truck',
        driver: 'Suresh Kumar',
        currentLocation: { lat: 12.9352, lng: 77.6245 },
        route: routes[0]._id, // Assign to Route A's ID - this will be a string in DB but logical link
        status: 'active',
        scheduledAreas: ['Koramangala', 'HSR Layout'],
        lastUpdated: new Date(),
      },
      {
        vehicleNumber: 'KA-01-CD-5678',
        type: 'compactor',
        driver: 'Ramesh Babu',
        currentLocation: { lat: 12.9716, lng: 77.6412 },
        route: routes[1]._id,
        status: 'active',
        scheduledAreas: ['Indiranagar', 'Whitefield'],
        lastUpdated: new Date(),
      },
      {
        vehicleNumber: 'KA-01-EF-9012',
        type: 'garbage_truck',
        driver: 'Ganesh Rao',
        currentLocation: { lat: 12.9698, lng: 77.7500 },
        route: null, // Unassigned
        status: 'active',
        scheduledAreas: ['Whitefield', 'Marathahalli'],
        lastUpdated: new Date(),
      },
    ]);

    // Update routes with vehicle IDs
    routes[0].assignedVehicle = vehicles[0]._id as any;
    await routes[0].save();
    routes[1].assignedVehicle = vehicles[1]._id as any;
    await routes[1].save();


    console.log('✅ Created vehicles');

    // Create schedules
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    await Schedule.create([
      {
        area: 'Koramangala',
        vehicleId: vehicles[0]._id,
        scheduledTime: tomorrow,
        estimatedArrival: new Date(tomorrow.getTime() + 30 * 60000),
        wasteType: 'wet',
        status: 'scheduled',
        notificationsSent: false,
      },
      {
        area: 'Indiranagar',
        vehicleId: vehicles[1]._id,
        scheduledTime: tomorrow,
        estimatedArrival: new Date(tomorrow.getTime() + 45 * 60000),
        wasteType: 'dry',
        status: 'scheduled',
        notificationsSent: false,
      },
      {
        area: 'Koramangala',
        vehicleId: vehicles[0]._id,
        wasteType: 'dry', // Another type for next day
        scheduledTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
        estimatedArrival: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 + 30 * 60000),
        status: 'scheduled',
        notificationsSent: false,
      }
    ]);

    console.log('✅ Created schedules');

    // Create reports - More diverse for analytics
    await Report.create([
      {
        reportedBy: citizen1._id,
        type: 'illegal_dumping',
        description: 'Large pile of construction waste dumped near park entrance',
        location: {
            coordinates: { lat: 12.9354, lng: 77.6248 },
            address: 'Near Koramangala Park, Bangalore',
        },
        photos: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41'],
        status: 'pending',
        priority: 'high',
        ecoPointsAwarded: 10,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        reportedBy: citizen2._id,
        type: 'missed_pickup',
        description: 'Waste collection missed for 3 days in our street',
        location: {
            coordinates: { lat: 12.9718, lng: 77.6414 },
            address: 'Brigade Road, Indiranagar, Bangalore',
        },
        photos: [],
        status: 'assigned',
        assignedTo: 'Crew-B2',
        priority: 'medium',
        ecoPointsAwarded: 10,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        reportedBy: citizen1._id,
        type: 'poor_sanitation',
        description: 'Overflowing bins attracting stray animals',
        location: {
            coordinates: { lat: 12.9350, lng: 77.6242 },
            address: 'MG Road, Koramangala, Bangalore',
        },
        photos: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b'],
        status: 'resolved',
        assignedTo: 'Crew-A1',
        priority: 'high',
        ecoPointsAwarded: 60,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
          reportedBy: citizen2._id,
          type: 'segregation_issue',
          description: 'Neighbors mixing wet and dry waste',
          location: {
              coordinates: { lat: 12.9720, lng: 77.6410 },
              address: '1st Cross, Indiranagar',
          },
          photos: [],
          status: 'pending',
          priority: 'low',
          ecoPointsAwarded: 10,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      }
    ]);

    console.log('✅ Created reports');

    // Create compost listings
    await CompostListing.create([
      {
        seller: citizen2._id,
        title: 'Premium Home Compost - 10kg',
        description: 'Organic compost made from kitchen waste over 3 months. Rich in nutrients, perfect for gardens.',
        quantity: 10,
        price: 150,
        location: {
          coordinates: { lat: 12.9716, lng: 77.6412 },
          address: 'Indiranagar, Bangalore',
        },
        photos: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b'],
        status: 'available',
      },
      {
        seller: citizen1._id,
        title: 'Vermicompost - 5kg',
        description: 'High-quality vermicompost with earthworm castings. Excellent for potted plants.',
        quantity: 5,
        price: 100,
        location: {
          coordinates: { lat: 12.9352, lng: 77.6245 },
          address: 'Koramangala, Bangalore',
        },
        photos: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'],
        status: 'available',
      },
    ]);

    console.log('✅ Created compost listings');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Citizen: rajesh@example.com / password123');
    console.log('Citizen: priya@example.com / password123');
    console.log('Municipal: admin@bbmp.gov.in / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
