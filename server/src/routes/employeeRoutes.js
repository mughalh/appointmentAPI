const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  getMyProfile,
  createOrUpdateEmployee,
  getEmployeesByService,
  getAvailability
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getEmployees);
router.get('/by-service/:serviceId', getEmployeesByService);
router.get('/:id/availability', getAvailability);
router.get('/:id', getEmployeeById);
// Add this route
router.get('/specializations', async (req, res) => {
  try {
    // Get unique specializations from employees
    const specializations = await Employee.distinct('specialization');
    res.json({
      success: true,
      specializations: specializations.filter(s => s) // Remove empty values
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching specializations'
    });
  }
});

// Protected routes
router.get('/my-profile', protect, authorize('PROVIDER'), getMyProfile);
router.post('/', protect, authorize('PROVIDER'), createOrUpdateEmployee);

module.exports = router;