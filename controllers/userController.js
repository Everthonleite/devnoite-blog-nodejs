const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signUpUser = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Falha de validação");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt.hash(password, 12)
        .then(passHashed => {
            const user = new User({
                email: email,
                name: name,
                password: passHashed,
            });

            return user.save();
        })
        .then(user => {
            user.password = undefined;
            res.status(201).json({
                message: "User criado com sucesso!!",
                result: user
            });
        })
        .catch(error => {
            res.status(500).json({
                message: "Erro ao salvar o usuário...",
                result: error
            });
        });
};

exports.signInUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("Falha de validação");
            error.statusCode = 422;
            throw error;
        }
        loadedUser = user;
        const passIsEqual = await bcrypt.compare(password, user.password);
        if (!passIsEqual) {
            const error = new Error("Email ou senha inválida...");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            "MinhaChaveJWT@2024Senai",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Usuário logado com sucesso!",
            token: token,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.updateUserProfile = (req, res, next) => {
    const userId = req.userId;
    const updatedName = req.body.name;

    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Usuário não encontrado.');
                error.statusCode = 404;
                throw error;
            }
            user.name = updatedName;
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Perfil atualizado com sucesso!',
                result: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.changePassword = (req, res, next) => {
    const userId = req.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Usuário não encontrado.');
                error.statusCode = 404;
                throw error;
            }
            return bcrypt.compare(oldPassword, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('A senha anterior está incorreta.');
                error.statusCode = 401;
                throw error;
            }
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            user.password = hashedPassword;
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Senha alterada com sucesso!',
                result: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteUser = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Usuário não encontrado.');
                error.statusCode = 404;
                throw error;
            }
            return User.findByIdAndRemove(userId);
        })
        .then(result => {
            res.status(200).json({
                message: 'Usuário excluído com sucesso!',
                result: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.addFavorite = (req, res, next) => {
    const userId = req.userId;
    const favoriteItemId = req.body.itemId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Usuário não encontrado.');
                error.statusCode = 404;
                throw error;
            }
            
            user.favorites.push(favoriteItemId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Item adicionado aos favoritos com sucesso!',
                result: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.removeFavorite = (req, res, next) => {
    const userId = req.userId;
    const favoriteItemId = req.params.itemId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Usuário não encontrado.');
                error.statusCode = 404;
                throw error;
            }
            user.favorites.pull(favoriteItemId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Item removido dos favoritos com sucesso!',
                result: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

