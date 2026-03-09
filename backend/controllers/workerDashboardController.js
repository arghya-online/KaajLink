import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc    Register as worker
// @route   POST /api/worker-auth/register
export const registerWorker = async (req, res) => {
  try {
    const { name, email, password, phone, service, hourlyRate, about, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user with worker role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'worker',
      isVerified: true
    });

    // Create worker profile linked to user
    const worker = await Worker.create({
      user: user._id,
      name,
      service: service || 'General',
      phone,
      hourlyRate: hourlyRate || 300,
      about: about || '',
      location: location || 'Kolkata',
      coordinates: { lat: 22.57, lng: 88.36 },
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F97316&color=fff&size=200`,
      isVerified: true,
      isAvailable: true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      workerId: worker._id,
      name: user.name,
      email: user.email,
      role: 'worker',
      service: worker.service,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Worker login
// @route   POST /api/worker-auth/login
export const loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'worker' }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or not a worker account' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const worker = await Worker.findOne({ user: user._id });

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      workerId: worker?._id,
      name: user.name,
      email: user.email,
      role: 'worker',
      service: worker?.service,
      isAvailable: worker?.isAvailable,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get worker profile (self)
// @route   GET /api/worker-dashboard/profile
export const getWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update worker availability & location
// @route   PUT /api/worker-dashboard/profile
export const updateWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const { isAvailable, coordinates, hourlyRate, about, phone, service } = req.body;

    if (isAvailable !== undefined) worker.isAvailable = isAvailable;
    if (coordinates) worker.coordinates = coordinates;
    if (hourlyRate) worker.hourlyRate = hourlyRate;
    if (about) worker.about = about;
    if (phone) worker.phone = phone;
    if (service) worker.service = service;

    await worker.save();
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update worker live location
// @route   PUT /api/worker-dashboard/location
export const updateWorkerLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    worker.coordinates = { lat, lng };
    await worker.save();

    res.json({ message: 'Location updated', coordinates: worker.coordinates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get jobs assigned to this worker
// @route   GET /api/worker-dashboard/jobs
export const getWorkerJobs = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const { status } = req.query;
    const filter = { worker: worker._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const jobs = await Booking.find(filter)
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get new/pending jobs for this worker
// @route   GET /api/worker-dashboard/jobs/pending
export const getPendingJobs = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const jobs = await Booking.find({ worker: worker._id, status: 'pending' })
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a job
// @route   PUT /api/worker-dashboard/jobs/:id/accept
export const acceptJob = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Job not found' });
    if (booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'Not your job' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Job is not pending' });
    }

    booking.status = 'confirmed';
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('user', 'name email phone address');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a job
// @route   PUT /api/worker-dashboard/jobs/:id/reject
export const rejectJob = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Job not found' });
    if (booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'Not your job' });
    }

    booking.status = 'cancelled';
    booking.notes = req.body.reason || 'Rejected by worker';
    await booking.save();

    res.json({ message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start a job (in-progress)
// @route   PUT /api/worker-dashboard/jobs/:id/start
export const startJob = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Job not found' });
    if (booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'Not your job' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Job must be confirmed first' });
    }

    booking.status = 'in-progress';
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('user', 'name email phone address');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete a job
// @route   PUT /api/worker-dashboard/jobs/:id/complete
export const completeJob = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Job not found' });
    if (booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'Not your job' });
    }
    if (booking.status !== 'in-progress') {
      return res.status(400).json({ message: 'Job must be in-progress to complete' });
    }

    const amount = req.body.amount || worker.hourlyRate;
    booking.status = 'completed';
    booking.totalAmount = amount;
    booking.earnings = amount * 0.85; // 85% to worker, 15% platform fee
    booking.completedAt = new Date();
    await booking.save();

    // Update worker stats
    worker.jobsDone += 1;
    worker.totalEarnings += booking.earnings;
    await worker.save();

    const updated = await Booking.findById(booking._id)
      .populate('user', 'name email phone address');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get earnings summary
// @route   GET /api/worker-dashboard/earnings
export const getEarnings = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const completedJobs = await Booking.find({
      worker: worker._id,
      status: 'completed'
    }).sort({ completedAt: -1 });

    // Calculate stats
    const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.earnings || 0), 0);
    const totalJobs = completedJobs.length;

    // This week's earnings
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyJobs = completedJobs.filter(j => new Date(j.completedAt) >= weekStart);
    const weeklyEarnings = weeklyJobs.reduce((sum, job) => sum + (job.earnings || 0), 0);

    // Today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayJobs = completedJobs.filter(j => new Date(j.completedAt) >= todayStart);
    const todayEarnings = todayJobs.reduce((sum, job) => sum + (job.earnings || 0), 0);

    res.json({
      totalEarnings,
      weeklyEarnings,
      todayEarnings,
      totalJobs,
      weeklyJobs: weeklyJobs.length,
      todayJobs: todayJobs.length,
      recentJobs: completedJobs.slice(0, 10),
      hourlyRate: worker.hourlyRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats for worker
// @route   GET /api/worker-dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const [pendingCount, activeCount, completedCount, totalBookings] = await Promise.all([
      Booking.countDocuments({ worker: worker._id, status: 'pending' }),
      Booking.countDocuments({ worker: worker._id, status: { $in: ['confirmed', 'in-progress'] } }),
      Booking.countDocuments({ worker: worker._id, status: 'completed' }),
      Booking.countDocuments({ worker: worker._id })
    ]);

    res.json({
      worker: {
        name: worker.name,
        service: worker.service,
        rating: worker.rating,
        totalReviews: worker.totalReviews,
        isAvailable: worker.isAvailable,
        hourlyRate: worker.hourlyRate,
        totalEarnings: worker.totalEarnings,
        jobsDone: worker.jobsDone,
        image: worker.image,
        coordinates: worker.coordinates
      },
      stats: {
        pending: pendingCount,
        active: activeCount,
        completed: completedCount,
        total: totalBookings
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby workers with coordinates for map
// @route   GET /api/workers/nearby
export const getNearbyWorkers = async (req, res) => {
  try {
    const { lat, lng, service, radius } = req.query;
    const maxDistance = parseFloat(radius) || 10; // km

    let filter = { isAvailable: true };
    if (service) filter.service = service;

    const workers = await Worker.find(filter).select('name service rating coordinates image phone distance location hourlyRate isVerified totalReviews');

    // If lat/lng provided, calculate distances and filter
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      const workersWithDistance = workers.map(w => {
        const wObj = w.toObject();
        if (w.coordinates?.lat && w.coordinates?.lng) {
          // Haversine formula
          const R = 6371;
          const dLat = (w.coordinates.lat - userLat) * Math.PI / 180;
          const dLng = (w.coordinates.lng - userLng) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(w.coordinates.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          wObj.calculatedDistance = parseFloat((R * c).toFixed(1));
          wObj.distance = `${wObj.calculatedDistance} km`;
        }
        return wObj;
      });

      // Filter by radius and sort by distance
      const filtered = workersWithDistance
        .filter(w => !w.calculatedDistance || w.calculatedDistance <= maxDistance)
        .sort((a, b) => (a.calculatedDistance || 999) - (b.calculatedDistance || 999));

      return res.json(filtered);
    }

    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
