const router = require("express").Router();

const UserController = require("../controllers/userController");

// Send Email Route
router.post("/delete/:id", UserController.deleteUser);

module.exports = router;