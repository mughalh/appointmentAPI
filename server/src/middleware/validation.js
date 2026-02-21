const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const authValidation = {
  signup: [
    body('fullName')
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone')
      .notEmpty().withMessage('Phone number is required'),
    body('role')
      .optional()
      .isIn(['CUSTOMER', 'PROVIDER']).withMessage('Role must be either CUSTOMER or PROVIDER'),
    validate
  ],
  
  login: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    validate
  ]
};

const serviceValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('Service name is required')
      .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
    body('description')
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('durationMinutes')
      .notEmpty().withMessage('Duration is required')
      .isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
      .notEmpty().withMessage('Category is required')
      .isIn(['HAIR', 'NAILS', 'SPA', 'MASSAGE', 'FACIAL', 'OTHER']).withMessage('Invalid category'),
    validate
  ]
};

const appointmentValidation = {
  create: [
    body('employeeId')
      .notEmpty().withMessage('Employee ID is required')
      .isMongoId().withMessage('Invalid employee ID'),
    body('serviceId')
      .notEmpty().withMessage('Service ID is required')
      .isMongoId().withMessage('Invalid service ID'),
    body('startTime')
      .notEmpty().withMessage('Start time is required')
      .isISO8601().withMessage('Invalid date format'),
    validate
  ]
};

module.exports = {
  authValidation,
  serviceValidation,
  appointmentValidation
};