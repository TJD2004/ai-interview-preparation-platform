const router = require('express').Router();
const ctrl = require('../controllers/interview.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.post('/start', ctrl.start);
router.post('/chat', ctrl.chat);
router.get('/history', ctrl.history);
router.get('/analytics', ctrl.analytics);
router.get('/:id', ctrl.sessionDetail);

module.exports = router;
