const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Employee = require('../models/Employee');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private/Customer
const createReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    // Check if appointment exists and belongs to user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: req.user._id,
      status: 'COMPLETED'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Completed appointment not found'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this appointment'
      });
    }

    // Create review
    const review = await Review.create({
      customer: req.user._id,
      employee: appointment.employee,
      appointment: appointmentId,
      rating,
      comment,
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for an employee
// @route   GET /api/reviews/employee/:employeeId
// @access  Public
const getEmployeeReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ employee: req.params.employeeId })
      .populate('customer', 'fullName profilePicture')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private/Customer
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Customer
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getEmployeeReviews,
  updateReview,
  deleteReview
};