const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/google', ctrl.googleAuth);
router.get('/me', authenticate, ctrl.me);
router.patch('/me', authenticate, ctrl.updateProfile);

module.exports = router;
