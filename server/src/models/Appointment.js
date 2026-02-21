const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'BOOKED'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    maxlength: 200
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
appointmentSchema.index({ customer: 1, startTime: -1 });
appointmentSchema.index({ employee: 1, startTime: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ startTime: 1, endTime: 1 });

// Compound index for conflict detection
appointmentSchema.index({ employee: 1, startTime: 1, endTime: 1 });

// Method to check if appointment conflicts with another
appointmentSchema.statics.findConflicts = async function(employeeId, startTime, endTime, excludeId = null) {
  const query = {
    employee: employeeId,
    status: { $in: ['BOOKED', 'CONFIRMED'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return await this.find(query).populate('customer service');
};

module.exports = mongoose.model('Appointment', appointmentSchema);