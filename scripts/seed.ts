import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/db';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Route from '../models/Route';
import Schedule from '../models/Schedule';
import Report from '../models/Report';
import CompostListing from '../models/CompostListing';
import Notification from '../models/Notification';

// Bangalore coordinates for different areas
const BANGALORE_AREAS = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar', lat: 12.9716, lng: 77.6412 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Jayanagar', lat: 12.9250, lng: 77.5838 },
  { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
];

async function clearDatabase() {
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Vehicle.deleteMany({});
  await Route.deleteMany({});
  await Schedule.deleteMany({});
  await Report.deleteMany({});
  await CompostListing.deleteMany({});
  await Notification.deleteMany({});
  console.log('Database cleared!');
}

async function seedUsers() {
  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    // Citizens
    {
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
      ecoPoints: 250,
    },
    {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: hashedPassword,
      role: 'citizen',
      phone: '+91 98765 43211',
      address: {
        street: '45 100 Feet Road',
        area: 'Indiranagar',
        city: 'Bangalore',
        pincode: '560038',
        coordinates: { lat: 12.9716, lng: 77.6412 },
      },
      ecoPoints: 180,
    },
    {
      name: 'Amit Patel',
      email: 'amit@example.com',
      password: hashedPassword,
      role: 'citizen',
      phone: '+91 98765 43212',
      address: {
        street: '78 ITPL Main Road',
        area: 'Whitefield',
        city: 'Bangalore',
        pincode: '560066',
        coordinates: { lat: 12.9698, lng: 77.7500 },
      },
      ecoPoints: 320,
    },
    {
      name: 'Lakshmi Reddy',
      email: 'lakshmi@example.com',
      password: hashedPassword,
      role: 'citizen',
      phone: '+91 98765 43213',
      address: {
        street: '12 South End Circle',
        area: 'Jayanagar',
        city: 'Bangalore',
        pincode: '560011',
        coordinates: { lat: 12.9250, lng: 77.5838 },
      },
      ecoPoints: 150,
    },
    {
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      password: hashedPassword,
      role: 'citizen',
      phone: '+91 98765 43214',
      address: {
        street: '34 Sector 1',
        area: 'HSR Layout',
        city: 'Bangalore',
        pincode: '560102',
        coordinates: { lat: 12.9121, lng: 77.6446 },
      },
      ecoPoints: 200,
    },
    // Municipal workers
    {
      name: 'Admin User',
      email: 'admin@eco.com',
      password: hashedPassword,
      role: 'municipal',
      phone: '+91 98765 43215',
      address: {
        street: 'Municipal Office',
        area: 'Koramangala',
        city: 'Bangalore',
        pincode: '560034',
        coordinates: { lat: 12.9352, lng: 77.6245 },
      },
      ecoPoints: 0,
    },
    {
      name: 'Supervisor Kumar',
      email: 'supervisor@eco.com',
      password: hashedPassword,
      role: 'municipal',
      phone: '+91 98765 43216',
      address: {
        street: 'Municipal Office',
        area: 'Indiranagar',
        city: 'Bangalore',
        pincode: '560038',
        coordinates: { lat: 12.9716, lng: 77.6412 },
      },
      ecoPoints: 0,
    },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedVehicles() {
  console.log('Seeding vehicles...');

  const vehicles = [
    {
      vehicleNumber: 'KA-01-AB-1234',
      type: 'garbage_truck',
      driver: 'Ramesh Kumar',
      currentLocation: { lat: 12.9352, lng: 77.6245 },
      status: 'active',
      scheduledAreas: ['Koramangala', 'HSR Layout'],
      lastUpdated: new Date(),
    },
    {
      vehicleNumber: 'KA-01-CD-5678',
      type: 'garbage_truck',
      driver: 'Suresh Babu',
      currentLocation: { lat: 12.9716, lng: 77.6412 },
      status: 'active',
      scheduledAreas: ['Indiranagar'],
      lastUpdated: new Date(),
    },
    {
      vehicleNumber: 'KA-01-EF-9012',
      type: 'compactor',
      driver: 'Ganesh Rao',
      currentLocation: { lat: 12.9698, lng: 77.7500 },
      status: 'active',
      scheduledAreas: ['Whitefield'],
      lastUpdated: new Date(),
    },
    {
      vehicleNumber: 'KA-01-GH-3456',
      type: 'garbage_truck',
      driver: 'Prakash Reddy',
      currentLocation: { lat: 12.9250, lng: 77.5838 },
      status: 'active',
      scheduledAreas: ['Jayanagar'],
      lastUpdated: new Date(),
    },
    {
      vehicleNumber: 'KA-01-IJ-7890',
      type: 'compactor',
      driver: 'Maintenance',
      currentLocation: { lat: 12.9352, lng: 77.6245 },
      status: 'maintenance',
      scheduledAreas: [],
      lastUpdated: new Date(),
    },
  ];

  const createdVehicles = await Vehicle.insertMany(vehicles);
  console.log(`Created ${createdVehicles.length} vehicles`);
  return createdVehicles;
}

async function seedRoutes(vehicles: any[]) {
  console.log('Seeding routes...');

  const routes = [
    {
      name: 'Koramangala Circuit',
      startLocation: {
        lat: 12.9352,
        lng: 77.6245,
        address: 'Koramangala 5th Block',
      },
      endLocation: {
        lat: 12.9121,
        lng: 77.6446,
        address: 'HSR Layout Sector 1',
      },
      waypoints: [
        { lat: 12.9352, lng: 77.6245 },
        { lat: 12.9300, lng: 77.6300 },
        { lat: 12.9250, lng: 77.6350 },
        { lat: 12.9200, lng: 77.6400 },
        { lat: 12.9121, lng: 77.6446 },
      ],
      assignedVehicle: vehicles[0]._id,
      totalDistance: 8.5,
      estimatedDuration: 45,
      status: 'active',
      optimized: true,
    },
    {
      name: 'Indiranagar Route',
      startLocation: {
        lat: 12.9716,
        lng: 77.6412,
        address: 'Indiranagar 100 Feet Road',
      },
      endLocation: {
        lat: 12.9800,
        lng: 77.6500,
        address: 'Indiranagar 12th Main',
      },
      waypoints: [
        { lat: 12.9716, lng: 77.6412 },
        { lat: 12.9750, lng: 77.6450 },
        { lat: 12.9800, lng: 77.6500 },
      ],
      assignedVehicle: vehicles[1]._id,
      totalDistance: 5.2,
      estimatedDuration: 30,
      status: 'active',
      optimized: true,
    },
    {
      name: 'Whitefield Loop',
      startLocation: {
        lat: 12.9698,
        lng: 77.7500,
        address: 'Whitefield Main Road',
      },
      endLocation: {
        lat: 12.9750,
        lng: 77.7600,
        address: 'ITPL Main Road',
      },
      waypoints: [
        { lat: 12.9698, lng: 77.7500 },
        { lat: 12.9720, lng: 77.7550 },
        { lat: 12.9750, lng: 77.7600 },
      ],
      assignedVehicle: vehicles[2]._id,
      totalDistance: 6.8,
      estimatedDuration: 40,
      status: 'active',
      optimized: true,
    },
  ];

  const createdRoutes = await Route.insertMany(routes);
  console.log(`Created ${createdRoutes.length} routes`);
  return createdRoutes;
}

async function seedSchedules(vehicles: any[]) {
  console.log('Seeding schedules...');

  const now = new Date();
  const schedules = [];

  // Create schedules for next 7 days
  for (let day = 0; day < 7; day++) {
    const scheduleDate = new Date(now);
    scheduleDate.setDate(scheduleDate.getDate() + day);
    scheduleDate.setHours(8, 0, 0, 0); // 8 AM

    BANGALORE_AREAS.forEach((area, index) => {
      const vehicleIndex = index % vehicles.length;
      const estimatedArrival = new Date(scheduleDate);
      estimatedArrival.setHours(scheduleDate.getHours() + 2);

      schedules.push({
        area: area.name,
        vehicleId: vehicles[vehicleIndex]._id,
        scheduledTime: scheduleDate,
        estimatedArrival,
        wasteType: day % 2 === 0 ? 'wet' : 'dry',
        status: day === 0 ? 'in_transit' : 'scheduled',
        notificationsSent: day === 0,
      });
    });
  }

  const createdSchedules = await Schedule.insertMany(schedules);
  console.log(`Created ${createdSchedules.length} schedules`);
  return createdSchedules;
}

async function seedReports(users: any[]) {
  console.log('Seeding reports...');

  const citizens = users.filter(u => u.role === 'citizen');
  const reportTypes = ['illegal_dumping', 'missed_pickup', 'poor_sanitation', 'segregation_issue'];
  const statuses = ['pending', 'assigned', 'in_progress', 'resolved'];

  const reports = [
    {
      reportedBy: citizens[0]._id,
      type: 'illegal_dumping',
      description: 'Large pile of garbage dumped near the park entrance. Needs immediate attention.',
      location: {
        coordinates: { lat: 12.9352, lng: 77.6245 },
        address: 'Koramangala 5th Block Park',
      },
      photos: [],
      status: 'pending',
      priority: 'high',
      ecoPointsAwarded: 10,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      reportedBy: citizens[1]._id,
      type: 'missed_pickup',
      description: 'Waste collection was scheduled for today morning but the truck did not arrive.',
      location: {
        coordinates: { lat: 12.9716, lng: 77.6412 },
        address: 'Indiranagar 100 Feet Road',
      },
      photos: [],
      status: 'assigned',
      priority: 'medium',
      ecoPointsAwarded: 10,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      reportedBy: citizens[2]._id,
      type: 'poor_sanitation',
      description: 'Overflowing bins attracting flies and creating health hazard.',
      location: {
        coordinates: { lat: 12.9698, lng: 77.7500 },
        address: 'Whitefield Main Road',
      },
      photos: [],
      status: 'in_progress',
      priority: 'high',
      ecoPointsAwarded: 10,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      reportedBy: citizens[3]._id,
      type: 'segregation_issue',
      description: 'Mixed waste being collected instead of segregated waste.',
      location: {
        coordinates: { lat: 12.9250, lng: 77.5838 },
        address: 'Jayanagar 4th Block',
      },
      photos: [],
      status: 'resolved',
      priority: 'low',
      ecoPointsAwarded: 60, // 10 + 50 for verification
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      reportedBy: citizens[4]._id,
      type: 'illegal_dumping',
      description: 'Construction debris dumped on the roadside.',
      location: {
        coordinates: { lat: 12.9121, lng: 77.6446 },
        address: 'HSR Layout Sector 2',
      },
      photos: [],
      status: 'pending',
      priority: 'medium',
      ecoPointsAwarded: 10,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      reportedBy: citizens[0]._id,
      type: 'poor_sanitation',
      description: 'Stray dogs tearing open garbage bags.',
      location: {
        coordinates: { lat: 12.9360, lng: 77.6250 },
        address: 'Koramangala 6th Block',
      },
      photos: [],
      status: 'resolved',
      priority: 'medium',
      ecoPointsAwarded: 60,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
  ];

  const createdReports = await Report.insertMany(reports);
  console.log(`Created ${createdReports.length} reports`);
  return createdReports;
}

async function seedCompostListings(users: any[]) {
  console.log('Seeding compost listings...');

  const citizens = users.filter(u => u.role === 'citizen');

  const listings = [
    {
      seller: citizens[0]._id,
      title: 'Premium Vermicompost',
      description: 'High-quality vermicompost made from kitchen waste. Rich in nutrients, perfect for home gardens.',
      quantity: 25,
      price: 50,
      type: 'vermicompost',
      location: {
        coordinates: { lat: 12.9352, lng: 77.6245 },
        address: 'Koramangala 5th Block',
      },
      photos: [],
      status: 'available',
    },
    {
      seller: citizens[1]._id,
      title: 'Organic Pot Compost',
      description: 'Composted from dry leaves and kitchen waste. Ideal for potted plants.',
      quantity: 15,
      price: 40,
      type: 'pot_compost',
      location: {
        coordinates: { lat: 12.9716, lng: 77.6412 },
        address: 'Indiranagar',
      },
      photos: [],
      status: 'available',
    },
    {
      seller: citizens[2]._id,
      title: 'Dry Leaf Compost',
      description: 'Made from fallen leaves and garden waste. Great for improving soil quality.',
      quantity: 30,
      price: 35,
      type: 'dry_leaf',
      location: {
        coordinates: { lat: 12.9698, lng: 77.7500 },
        address: 'Whitefield',
      },
      photos: [],
      status: 'available',
    },
    {
      seller: citizens[3]._id,
      title: 'Kitchen Waste Compost',
      description: 'Fresh compost from vegetable and fruit peels. Ready to use.',
      quantity: 20,
      price: 45,
      type: 'vermicompost',
      location: {
        coordinates: { lat: 12.9250, lng: 77.5838 },
        address: 'Jayanagar',
      },
      photos: [],
      status: 'sold',
    },
    {
      seller: citizens[4]._id,
      title: 'Garden Compost Mix',
      description: 'Mixed compost from garden and kitchen waste. Nutrient-rich blend.',
      quantity: 40,
      price: 55,
      type: 'pot_compost',
      location: {
        coordinates: { lat: 12.9121, lng: 77.6446 },
        address: 'HSR Layout',
      },
      photos: [],
      status: 'available',
    },
  ];

  const createdListings = await CompostListing.insertMany(listings);
  console.log(`Created ${createdListings.length} compost listings`);
  return createdListings;
}

async function seedNotifications(users: any[]) {
  console.log('Seeding notifications...');

  const citizens = users.filter(u => u.role === 'citizen');
  const notifications = [];

  citizens.forEach((citizen, index) => {
    notifications.push(
      {
        userId: citizen._id,
        title: 'Collection Vehicle Approaching',
        message: 'Your waste collection vehicle will arrive in approximately 30 minutes. Please keep your waste ready.',
        type: 'collection',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        userId: citizen._id,
        title: 'Eco-Points Earned! 🌱',
        message: `You've earned 10 Eco-Points for submitting a report. Keep up the great work!`,
        type: 'reward',
        read: index % 2 === 0,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    );
  });

  // Add some report status notifications
  notifications.push(
    {
      userId: citizens[1]._id,
      title: 'Report Status Update',
      message: 'Your report has been assigned to a cleanup crew.',
      type: 'report',
      read: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      userId: citizens[2]._id,
      title: 'Report Status Update',
      message: 'Cleanup crew is working on your reported issue.',
      type: 'report',
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: citizens[3]._id,
      title: 'Report Status Update',
      message: 'Your reported issue has been resolved. Thank you for keeping our city clean!',
      type: 'report',
      read: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  );

  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`Created ${createdNotifications.length} notifications`);
  return createdNotifications;
}

async function main() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Seed data in order
    const users = await seedUsers();
    const vehicles = await seedVehicles();
    const routes = await seedRoutes(vehicles);
    const schedules = await seedSchedules(vehicles);
    const reports = await seedReports(users);
    const listings = await seedCompostListings(users);
    const notifications = await seedNotifications(users);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length} (5 citizens, 2 municipal)`);
    console.log(`   Vehicles: ${vehicles.length}`);
    console.log(`   Routes: ${routes.length}`);
    console.log(`   Schedules: ${schedules.length}`);
    console.log(`   Reports: ${reports.length}`);
    console.log(`   Compost Listings: ${listings.length}`);
    console.log(`   Notifications: ${notifications.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Citizen: rajesh@example.com / password123');
    console.log('   Municipal: admin@eco.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
