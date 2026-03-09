import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Service from './models/Service.js';
import Worker from './models/Worker.js';
import Booking from './models/Booking.js';

dotenv.config();

const services = [
  { name: "Electrician", icon: "Zap", color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Plumber", icon: "Droplet", color: "text-cyan-600", bg: "bg-cyan-50" },
  { name: "Carpenter", icon: "Hammer", color: "text-orange-600", bg: "bg-orange-50" },
  { name: "Painter", icon: "Brush", color: "text-purple-600", bg: "bg-purple-50" },
  { name: "AC Repair", icon: "Thermometer", color: "text-red-600", bg: "bg-red-50" },
  { name: "Mechanic", icon: "Wrench", color: "text-slate-600", bg: "bg-slate-100" },
  { name: "Tutor", icon: "BookOpen", color: "text-indigo-600", bg: "bg-indigo-50" },
  { name: "House Cleaner", icon: "Brush", color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Pest Control", icon: "Zap", color: "text-red-600", bg: "bg-red-50" },
  { name: "Appliance Repair", icon: "Wrench", color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Beautician", icon: "Zap", color: "text-pink-600", bg: "bg-pink-50" },
  { name: "Driver", icon: "Zap", color: "text-green-600", bg: "bg-green-50" }
];

const workers = [
  {
    name: "Raju Electrician",
    service: "Electrician",
    rating: 4.8,
    totalReviews: 120,
    distance: "2.1 km",
    location: "Kalyani",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop",
    phone: "+91 98765 43210",
    experience: 8,
    jobsDone: 340,
    about: "Expert electrician with 8 years of experience in residential and commercial electrical work. Specialized in wiring, panel upgrades, and smart home installations.",
    isVerified: true,
    reviews: [
      { userName: "Amit S.", rating: 5, comment: "Great service! Arrived on time and fixed the issue perfectly. Highly recommended." },
      { userName: "Priya D.", rating: 5, comment: "Very professional. Fixed a complex wiring issue quickly." },
      { userName: "Rohit K.", rating: 4, comment: "Good work, slightly delayed but quality was excellent." }
    ]
  },
  {
    name: "Sanjay Plumber",
    service: "Plumber",
    rating: 4.6,
    totalReviews: 98,
    distance: "1.4 km",
    location: "Barrackpore",
    image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop",
    phone: "+91 87654 32109",
    experience: 6,
    jobsDone: 256,
    about: "Reliable plumber specializing in leak repairs, pipe installations, and bathroom renovations. Available for emergency calls.",
    isVerified: true,
    reviews: [
      { userName: "Meena R.", rating: 5, comment: "Fixed a major leak in no time. Very skilled!" },
      { userName: "Arjun M.", rating: 4, comment: "Good service, reasonable pricing." }
    ]
  },
  {
    name: "Amit Carpenter",
    service: "Carpenter",
    rating: 4.9,
    totalReviews: 145,
    distance: "0.8 km",
    location: "Sodepur",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    phone: "+91 76543 21098",
    experience: 12,
    jobsDone: 520,
    about: "Master carpenter with 12 years of experience. Specializes in custom furniture, kitchen cabinets, and home renovation woodwork.",
    isVerified: true,
    reviews: [
      { userName: "Suresh B.", rating: 5, comment: "Amazing craftsmanship! Built custom shelves that look fantastic." },
      { userName: "Kavita P.", rating: 5, comment: "Best carpenter in the area. Very creative and detail-oriented." }
    ]
  },
  {
    name: "Priya Cleaner",
    service: "House Cleaner",
    rating: 4.7,
    totalReviews: 89,
    distance: "3.2 km",
    location: "Dum Dum",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    phone: "+91 65432 10987",
    experience: 4,
    jobsDone: 180,
    about: "Professional house cleaner offering deep cleaning, regular cleaning, and move-in/move-out cleaning services.",
    isVerified: true,
    reviews: [
      { userName: "Neha T.", rating: 5, comment: "My house has never been cleaner! Excellent attention to detail." },
      { userName: "Rahul G.", rating: 4, comment: "Very thorough cleaning. Will hire again." }
    ]
  },
  {
    name: "Vikram AC Expert",
    service: "AC Repair",
    rating: 4.5,
    totalReviews: 72,
    distance: "4.5 km",
    location: "Khardaha",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    phone: "+91 54321 09876",
    experience: 7,
    jobsDone: 290,
    about: "AC repair and servicing expert. Handles all brands - split AC, window AC, and central air conditioning systems.",
    isVerified: true,
    reviews: [
      { userName: "Deepak L.", rating: 5, comment: "Fixed my AC in under an hour. Great expertise!" },
      { userName: "Anita M.", rating: 4, comment: "Honest pricing and good quality work." }
    ]
  },
  {
    name: "Anita Tutor",
    service: "Tutor",
    rating: 4.9,
    totalReviews: 156,
    distance: "1.1 km",
    location: "Naihati",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    phone: "+91 99887 76655",
    experience: 10,
    jobsDone: 450,
    about: "Experienced tutor offering personalized classes in Mathematics, Science, and English for classes 5-12. IIT preparation specialist.",
    isVerified: true,
    reviews: [
      { userName: "Ramesh K.", rating: 5, comment: "My son's grades improved dramatically. Anita is an exceptional teacher." },
      { userName: "Sunita D.", rating: 5, comment: "Very patient and knowledgeable. Highly recommended for board exam preparation." }
    ]
  },
  {
    name: "Manoj Painter",
    service: "Painter",
    rating: 4.6,
    totalReviews: 67,
    distance: "2.8 km",
    location: "Baranagar",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    phone: "+91 88776 65544",
    experience: 9,
    jobsDone: 310,
    about: "Professional painter for interior and exterior. Specializes in texture painting, waterproofing, and color consultation.",
    isVerified: true,
    reviews: [
      { userName: "Pooja S.", rating: 5, comment: "Beautiful finish on our living room walls. Very clean work." }
    ]
  },
  {
    name: "Rakesh Mechanic",
    service: "Mechanic",
    rating: 4.4,
    totalReviews: 55,
    distance: "3.0 km",
    location: "Titagarh",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    phone: "+91 77665 54433",
    experience: 11,
    jobsDone: 480,
    about: "Auto mechanic specializing in two-wheelers and four-wheelers. Engine repair, servicing, and diagnostics.",
    isVerified: true,
    reviews: [
      { userName: "Vikash R.", rating: 4, comment: "Knows his stuff. Fixed my bike's engine problem quickly." }
    ]
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Worker.deleteMany({});
    await Booking.deleteMany({});

    console.log('Cleared existing data');

    // Create demo user
    const user = await User.create({
      name: 'Arghya',
      email: 'arghya@example.com',
      password: 'password123',
      phone: '+91 99887 76655',
      address: 'Kolkata, West Bengal',
      isVerified: true
    });

    console.log(`Created demo user: ${user.email}`);

    // Seed services
    const createdServices = await Service.insertMany(services);
    console.log(`Seeded ${createdServices.length} services`);

    // Seed workers
    const createdWorkers = await Worker.insertMany(workers);
    console.log(`Seeded ${createdWorkers.length} workers`);

    // Create sample bookings
    const sampleBookings = [
      {
        user: user._id,
        worker: createdWorkers[4]._id, // Vikram AC Expert
        service: 'AC Repair',
        description: 'AC not cooling properly, makes noise when running',
        address: 'Flat 3B, Rose Apartments, Park Street, Kolkata',
        scheduledDate: new Date(),
        status: 'pending'
      },
      {
        user: user._id,
        worker: createdWorkers[1]._id, // Sanjay Plumber
        service: 'Plumber',
        description: 'Leaking pipe under kitchen sink',
        address: '12 MG Road, Barrackpore',
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed'
      },
      {
        user: user._id,
        worker: createdWorkers[0]._id, // Raju Electrician
        service: 'Electrician',
        description: 'Multiple power outlets not working in bedroom',
        address: '45 Lake Town, Kolkata',
        scheduledDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        status: 'cancelled'
      }
    ];

    const createdBookings = await Booking.insertMany(sampleBookings);
    console.log(`Seeded ${createdBookings.length} bookings`);

    console.log('\n✅ Database seeded successfully!');
    console.log('Demo login: arghya@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
