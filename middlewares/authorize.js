const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/user");


const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(404).json({ success: false, msg: "Unauthorized User" })
    }
    try {
        const token = req.header("Authorization").split(" ")[1]
        if (!token) return res.status(400).json({ msg: "Invalid Authentication....." })

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(400).json({ msg: "Invalid Authentication." })
            let user_ = await User.findOne({ _id: user.id })
            if (user_.role === "admin") {
                req.user = user
                next()
            }
            else {
                return res.status(400).json({ msg: "User Not Authorised to Visit this Route." })
            }
        })
    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
};

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(404).json({ success: false, msg: "Unauthorized User" })
    }
    try {
        const token = req.header("Authorization").split(" ")[1]
        if (!token) return res.status(400).json({ msg: "Invalid Authentication....." })

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(400).json({ msg: "Invalid Authentication." })
            req.user = user
            next()
        })
    } catch (err) {
        return res.status(500).json({ msg: "User Not Authorised !!!" })
    }

}

// const access = () => {
//     return (req, res, next) => {
//         if (!req.userId.role === "admin") {
//             return next(new ErrorResponse(`the ${req.userId.role} is not authorized to visit this route`, 403))
//         }
//         next()
//     }
// }

module.exports = { auth, isAdmin } 