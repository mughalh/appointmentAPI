const express = require('express');
const router = express.Router();
const {
  createReview,
  getEmployeeReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/employee/:employeeId', getEmployeeReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;