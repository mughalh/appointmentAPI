const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getPopularServices,
  getServicesByCategory
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { serviceValidation } = require('../middleware/validation');

// Public routes
router.get('/', getServices);
router.get('/popular', getPopularServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getServiceById);

// Protected routes
router.post('/', protect, authorize('ADMIN', 'PROVIDER'), serviceValidation.create, createService);
router.put('/:id', protect, authorize('ADMIN', 'PROVIDER'), updateService);
router.delete('/:id', protect, authorize('ADMIN'), deleteService);

module.exports = router;