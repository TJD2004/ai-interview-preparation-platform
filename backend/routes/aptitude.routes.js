const router = require('express').Router();
const ctrl = require('../controllers/aptitude.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/topics', ctrl.topics);
router.post('/start', ctrl.start);
router.post('/submit', ctrl.submit);
router.get('/history', ctrl.history);
router.get('/analytics', ctrl.analytics);
router.get('/report/:id', ctrl.report);

module.exports = router;
