const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per appointment
reviewSchema.index({ appointment: 1 }, { unique: true });

// Update employee rating when review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Employee = mongoose.model('Employee');
  
  const stats = await Review.aggregate([
    { $match: { employee: this.employee } },
    { $group: {
        _id: '$employee',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
    }}
  ]);
  
  if (stats.length > 0) {
    await Employee.findByIdAndUpdate(this.employee, {
      rating: stats[0].avgRating,
      totalReviews: stats[0].count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);