const router = require('express').Router();
const multer = require('multer');
const ctrl = require('../controllers/ats.controller');
const authenticate = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype) || /\.(pdf|docx|txt)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, or TXT files are allowed'));
    }
  }
});

router.use(authenticate);

router.post('/check', upload.single('resume'), ctrl.check);
router.get('/history', ctrl.history);
router.get('/:id', ctrl.detail);

module.exports = router;
