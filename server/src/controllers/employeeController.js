const Employee = require('../models/Employee');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Public
const getEmployees = async (req, res, next) => {
  try {
    const { specialization, service, minRating } = req.query;
    
    let query = { isActive: true };

    if (specialization && specialization !== 'all') {
      query.specialization = specialization;
    }

    if (service && service !== 'all') {
      query.services = service;
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const employees = await Employee.find(query)
      .populate('user', 'fullName email phone profilePicture')
      .populate('services', 'name price durationMinutes')
      .sort('-rating -totalReviews');

    // Get unique specializations for filter
    const specializations = await Employee.distinct('specialization');

    res.json({
      success: true,
      count: employees.length,
      employees,
      specializations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Public
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'fullName email phone profilePicture')
      .populate('services', 'name price durationMinutes description');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee profile for logged in provider
// @route   GET /api/employees/my-profile
// @access  Private/Provider
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'fullName email phone profilePicture')
      .populate('services', 'name price durationMinutes');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update employee profile
// @route   POST /api/employees
// @access  Private/Provider
const createOrUpdateEmployee = async (req, res, next) => {
  try {
    const { specialization, experience, bio, workingHours, services } = req.body;

    let employee = await Employee.findOne({ user: req.user._id });

    if (employee) {
      // Update existing
      employee.specialization = specialization || employee.specialization;
      employee.experience = experience || employee.experience;
      employee.bio = bio || employee.bio;
      if (workingHours) employee.workingHours = workingHours;
      if (services) employee.services = services;

      await employee.save();
    } else {
      // Create new
      employee = await Employee.create({
        user: req.user._id,
        specialization,
        experience,
        bio,
        workingHours,
        services
      });
    }

    res.json({
      success: true,
      message: employee.isNew ? 'Employee profile created' : 'Employee profile updated',
      employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees by service
// @route   GET /api/employees/by-service/:serviceId
// @access  Public
const getEmployeesByService = async (req, res, next) => {
  try {
    const employees = await Employee.find({
      services: req.params.serviceId,
      isActive: true
    })
      .populate('user', 'fullName profilePicture')
      .populate('services', 'name price');

    res.json({
      success: true,
      employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee availability for a date
// @route   GET /api/employees/:id/availability
// @access  Public
const getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get working hours for that day
    const daySchedule = employee.workingHours.find(w => w.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.json({
        success: true,
        available: false,
        message: 'Employee not available on this day'
      });
    }

    // Get booked appointments for that day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      employee: employee._id,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['BOOKED', 'CONFIRMED'] }
    }).sort('startTime');

    // Generate available time slots
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
    
    let currentSlot = new Date(targetDate);
    currentSlot.setHours(startHour, startMin, 0, 0);
    
    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMin, 0, 0);

    const availableSlots = [];

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + 60); // 1-hour slots

      // Check if slot is free
      const isBooked = appointments.some(apt => 
        (apt.startTime < slotEnd && apt.endTime > currentSlot)
      );

      if (!isBooked) {
        availableSlots.push(new Date(currentSlot));
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + 30); // 30-min intervals
    }

    res.json({
      success: true,
      availableSlots
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  getMyProfile,
  createOrUpdateEmployee,
  getEmployeesByService,
  getAvailability
};