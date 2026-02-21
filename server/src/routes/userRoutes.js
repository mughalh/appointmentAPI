const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  getUserActivity,
  uploadProfilePicture,
  deleteAccount,
  getUserStats  // ← Import it here
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `user-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.use(protect);

router.get('/', authorize('ADMIN'), getUsers);
router.get('/stats', getUserStats);  // ← Add this line BEFORE the :id route
router.get('/activity', getUserActivity);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/profile-picture', upload.single('profilePicture'), uploadProfilePicture);
router.delete('/account', deleteAccount);

module.exports = router;