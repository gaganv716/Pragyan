const router = require('express').Router();
const {protect} = require('../Middlewares/authMiddleware');
const  {accessChat,fetchChat,createGroupChat,renameGroup,addToGroup,removeFromGroup} = require("../controllers/chatControllers");

router.route("/").post(protect,accessChat);
router.route("/").get(protect,fetchChat);
router.route("/group").post(protect,createGroupChat);
router.route("/rename").put(protect,renameGroup);
router.route("/groupadd").put(protect,addToGroup);
router.route("/groupremove").put(protect,removeFromGroup);

module.exports = router;1123