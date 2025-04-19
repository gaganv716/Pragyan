const router = require('express').Router();
const {registerUser,authUser,allUsers} = require('../controllers/userControllers');
const {protect} = require('../Middlewares/authMiddleware');


router.post('/', registerUser);
router.get("/",protect,allUsers);
router.post("/login",authUser);

module.exports = router;  