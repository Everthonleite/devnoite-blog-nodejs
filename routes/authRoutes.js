const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
const userController = require("../controllers/userController");
const { validateEmail, validateName, validatePassword, validateEmailExists } = require("../services/validators");
const verifyToken = require("../middlewares/is-auth");

router.post('/signup', [validateEmail, validateName, validatePassword, validateEmailExists], auth.signUpUser);
router.post('/signin', [validateEmail, validatePassword], auth.signInUser);
router.post('/favorites/add', verifyToken, userController.addFavorite); 
router.delete('/favorites/remove/:itemId', verifyToken, userController.removeFavorite); 
router.put('/profile', verifyToken, userController.updateUserProfile);
router.put('/profile', verifyToken, userController.updateUserProfile);
router.put('/change-password', verifyToken, userController.changePassword);
router.delete('/delete-user', verifyToken, userController.deleteUser);

module.exports = router;
