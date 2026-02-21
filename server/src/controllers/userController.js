const User = require('../models/User');
const Employee = require('../models/Employee');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address, dateOfBirth, preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (preferences) user.preferences = preferences;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
const getUserActivity = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ customer: req.user._id })
      .populate('employee', 'specialization')
      .populate('service', 'name')
      .sort('-createdAt')
      .limit(10);

    const activity = appointments.map(apt => ({
      type: 'appointment',
      description: `Booked ${apt.service.name}`,
      timestamp: apt.createdAt,
      status: apt.status
    }));

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    
    // Also delete associated employee profile if exists
    await Employee.findOneAndDelete({ user: req.user._id });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    // Get total appointments
    const totalAppointments = await Appointment.countDocuments({ 
      customer: req.user._id 
    });

    // Get completed appointments
    const completedAppointments = await Appointment.countDocuments({ 
      customer: req.user._id,
      status: 'COMPLETED'
    });

    // Calculate total spent
    const appointments = await Appointment.find({ 
      customer: req.user._id,
      status: 'COMPLETED'
    }).populate('service');

    const totalSpent = appointments.reduce((sum, apt) => 
      sum + (apt.service?.price || 0), 0
    );

    // Calculate loyalty points (example: 1 point per $10 spent)
    const loyaltyPoints = Math.floor(totalSpent / 10);

    res.json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        totalSpent,
        loyaltyPoints
      }
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  getUserActivity,
  uploadProfilePicture,
  deleteAccount,
  getUserStats,
};