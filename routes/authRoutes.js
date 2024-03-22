const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
const userController = require("../controllers/userController");
const { validateEmail, validateName, validatePassword, validateEmailExists } = require("../services/validators");

// Rotas de autenticação
router.post('/signup',[validateEmail, validateName, validatePassword, validateEmailExists], auth.signUpUser);
router.post('/signin',[validateEmail, validatePassword], auth.signInUser);

// Rotas do usuário
router.put('/profile', auth.verifyToken, userController.updateUserProfile);
router.put('/change-password', auth.verifyToken, userController.changePassword);
router.delete('/delete-user', auth.verifyToken, userController.deleteUser);

module.exports = router;
