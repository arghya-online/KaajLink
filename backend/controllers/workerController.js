import Worker from '../models/Worker.js';

// @desc    Get all workers (with optional service filter)
// @route   GET /api/workers
export const getWorkers = async (req, res) => {
  try {
    const { service, search, sort } = req.query;
    let query = { isAvailable: true };

    if (service) {
      query.service = { $regex: service, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { rating: -1 }; // default: highest rated
    if (sort === 'reviews') sortOption = { totalReviews: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const workers = await Worker.find(query).sort(sortOption);
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated workers
// @route   GET /api/workers/top
export const getTopWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({ isAvailable: true })
      .sort({ rating: -1 })
      .limit(4);
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single worker
// @route   GET /api/workers/:id
export const getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workers by service type
// @route   GET /api/workers/service/:serviceName
export const getWorkersByService = async (req, res) => {
  try {
    const workers = await Worker.find({
      service: { $regex: req.params.serviceName, $options: 'i' },
      isAvailable: true
    }).sort({ rating: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to a worker
// @route   POST /api/workers/:id/reviews
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const review = {
      userName: req.user.name,
      rating: Number(rating),
      comment,
      date: new Date()
    };

    worker.reviews.push(review);
    worker.totalReviews = worker.reviews.length;
    worker.rating = worker.reviews.reduce((acc, r) => acc + r.rating, 0) / worker.reviews.length;

    await worker.save();
    res.status(201).json({ message: 'Review added', worker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
