const jwt = require('jsonwebtoken')
const { User } = require('../models')


exports.authMiddleware = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }


    if (!token) {
        return next(
            res.status(401).json({
                status: 401,
                message: "Anda belum login",
            })
        );
    }

    let decoded;
    try {
        decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return next(res.status(401).json({
            status: 401,
            error: error,
            message: "Token invalid",
        }))
    }

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
        return next(
            res.status(401).json({
                status: 401,
                message: "User terhapus, token tidak bisa digunakan",
            })
        );
    }
    //   console.log(currentUser);
    req.user = currentUser;
    next();

}