// routes/formulaRoutes.js - COMPLETE VERSION
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  createFormulaSheet,
  getAllFormulaSheets,
  getFormulaSheet,
  updateFormulaSheet,
  deleteFormulaSheet,
  downloadFormulaSheet,
  getFormulasByCategory,
  getAllAdminFormulas,
  togglePublish,
  uploadFormulaImage,
  deleteFormulaImage,
  searchFormulas
} = require('../controllers/formulaController');
router.use(protect);

// Public routes
router.get('/', getAllFormulaSheets);
router.get('/search', searchFormulas);  // Algolia search
router.get('/category/:category', getFormulasByCategory);
router.get('/:slug', getFormulaSheet);
router.get('/:slug/download', downloadFormulaSheet);

router.use(requireRole("admin"));
// Admin routes
router.post('/',  createFormulaSheet);
router.post('/upload-image', upload.single('image'), uploadFormulaImage);
router.delete('/image/:publicId', deleteFormulaImage);
router.get('/admin/all', getAllAdminFormulas);
router.put('/:id', updateFormulaSheet);
router.delete('/:id', deleteFormulaSheet);
router.patch('/:id/toggle-publish', togglePublish);

module.exports = router;