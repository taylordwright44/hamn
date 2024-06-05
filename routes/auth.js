const HyperExpress = require('hyper-express');
const {
    register, login, getMe
} = require('../controllers/auth');

const router = new HyperExpress.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;