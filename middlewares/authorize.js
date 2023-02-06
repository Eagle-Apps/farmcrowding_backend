// const jwt = require("jsonwebtoken")
// require("dotenv").config()
const ErrorResponse = require("../utils/errorResponse");


// const authorize = (req, res, next) => {
//     let token;
//     const authHeader = req.headers.authorization

//     if (authHeader && authHeader.startsWith("Bearer")) {
//         token = authHeader.split(" ")[1]
//     }
//     if (req.cookies.token) {
//         token = req.cookies.token
//     }

//     if (!token) return next(new ErrorResponse("unauthorize user", 401))

//     const verified = jwt.verify(token, process.env.JWT_SECRET)

//     req.user = verified

//     next()

// }

const authorize = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(404).json({ success: false, msg: "unauthorize user" })
    }
    const token = authHeader.split(" ")[1]
    let verified = jwt.verify(token, process.env.SECRET)
    req.user = verified
    next()

}

const access = () => {
    return (req, res, next) => {
        if (!req.userId.role === "admin") {
            return next(new ErrorResponse(`the ${req.userId.role} is not authorized to visit this route`, 403))
        }
        next()
    }
}

module.exports = { authorize, access } 