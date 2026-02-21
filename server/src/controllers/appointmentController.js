const Appointment = require('../models/Appointment');
const Employee = require('../models/Employee');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('customer', 'fullName email phone')
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'fullName' }
      })
      .populate('service', 'name price')
      .sort('-startTime');

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer appointments
// @route   GET /api/appointments/my-appointments
// @access  Private/Customer
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ customer: req.user._id })
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'fullName phone profilePicture' }
      })
      .populate('service', 'name price durationMinutes')
      .sort('-startTime');

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider appointments
// @route   GET /api/appointments/provider
// @access  Private/Provider
const getProviderAppointments = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const appointments = await Appointment.find({ employee: employee._id })
      .populate('customer', 'fullName email phone')
      .populate('service', 'name price durationMinutes')
      .sort('-startTime');

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res, next) => {
  try {
    const { employeeId, serviceId, startTime, notes } = req.body;

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Get employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.durationMinutes * 60000);

    // Check for conflicts
    const conflicts = await Appointment.findConflicts(employeeId, start, end);
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      customer: req.user._id,
      employee: employeeId,
      service: serviceId,
      startTime: start,
      endTime: end,
      price: service.price,
      notes
    });

    // Update employee stats
    employee.totalClients = await Appointment.distinct('customer', { employee: employeeId }).length;
    await employee.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'fullName email')
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'fullName' }
      })
      .populate('service', 'name price');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isCustomer = appointment.customer.toString() === req.user._id.toString();
    const isProvider = await Employee.findOne({ 
      user: req.user._id, 
      _id: appointment.employee 
    });

    if (!isCustomer && !isProvider && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Validate status transition
    if (status === 'CANCELLED' && appointment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    appointment.status = status;
    if (reason) appointment.cancellationReason = reason;
    await appointment.save();

    res.json({
      success: true,
      message: `Appointment ${status.toLowerCase()}`,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled
    const startTime = new Date(appointment.startTime);
    const now = new Date();
    const hoursUntilAppointment = (startTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel appointment less than 1 hour before start time'
      });
    }

    appointment.status = 'CANCELLED';
    if (reason) appointment.cancellationReason = reason;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'fullName email phone')
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'fullName phone profilePicture' }
      })
      .populate('service', 'name price durationMinutes description');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isCustomer = appointment.customer._id.toString() === req.user._id.toString();
    const employee = await Employee.findOne({ user: req.user._id });
    const isProvider = employee && employee._id.toString() === appointment.employee._id.toString();

    if (!isCustomer && !isProvider && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAppointments,
  getMyAppointments,
  getProviderAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById
};