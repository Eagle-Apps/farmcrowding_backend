require('dotenv').config();
const User = require("../../models/user");
const multer = require('multer');
const bcrypt = require('bcrypt');
const paginate = require('jw-paginate');
const jwt = require("jsonwebtoken");
const { auth, isAdmin } = require("../../middlewares/authorize")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getMilliseconds() + file.originalname);
    }
});
const upload = multer({ storage: storage }).single('image');

let routes = (app) => {
    app.post("/register", async (req, res) => {
        try {
            const { firstname, lastname, email, password, phone, userName, address } = req.body;

            if (!firstname || !lastname || !email || !password || !userName)
                return res.status(400).json({ msg: "Please fill in all fields, one or more fileds are empty!" })

            if (!validateEmail(email))
                return res.status(400).json({ msg: "Please enter a valid email address!" })

            const user_name = await User.findOne({ userName })
            if (user_name) return res.status(400).json({ msg: "This username is already taken!" })

            const user = await User.findOne({ email })
            if (user) return res.status(400).json({ msg: "This email already exists, please use another email address!" })

            if (password.length < 8)
                return res.status(400).json({ msg: "Password must be atleaast 8 characters long!" })

            const passwordHash = await bcrypt.hash(password, 12)
            let name = firstname + " " + lastname;
            const newUser = {
                name, email, password: passwordHash, phone, userName, address
            }
            let user_ = new User(newUser);
            // const activation_token = createActivationToken(newUser)

            // const url = `${CLIENT_URL}/user/activate/${activation_token}`

            // sendMail(email, url, "Verify your email address")
            await user_.save();
            res.status(200).json({ msg: "Registration Successful, Please proceed to login" })

        }
        catch (err) {
            console.log('error o')
            return res.status(500).json({ msg: err.message });
        }

    });

    app.post("/register/admin", async (req, res) => {
        try {
            const { firstname, lastname, email, password, phone, userName, address } = req.body;
            if (!firstname || !lastname || !email || !password)
                return res.status(400).json({ msg: "Please fill in all fields, one or more fileds are empty!" })

            if (!validateEmail(email))
                return res.status(400).json({ msg: "Please enter a valid email address!" })

            const user_name = await User.findOne({ userName })
            if (user_name) return res.status(400).json({ msg: "This username is already taken!" })

            const user = await User.findOne({ email })
            if (user) return res.status(400).json({ msg: "This email already exists, please use another email address!" })

            if (password.length < 8)
                return res.status(400).json({ msg: "Password must be atleaast 8 characters long!" })

            const passwordHash = await bcrypt.hash(password, 12)
            let name = firstname + " " + lastname;
            const newUser = {
                name, email, password: passwordHash, phone, role: "admin", userName, address
            }

            let user_ = new User(newUser);

            // const activation_token = createActivationToken(newUser)

            // const url = `${CLIENT_URL}/user/activate/${activation_token}`

            // sendMail(email, url, "Verify your email address")
            await user_.save();
            // res.json({ msg: "Registration Successful, Please check you email for verification mail to activate your account!" })
            res.status(200).json({ msg: "Registration Successful, Please proceed to login!" })

        }
        catch (err) {
            console.log('error o')
            return res.status(500).json({ msg: err.message });
        }

    });
    // not paged
    app.get("/users", isAdmin, async (req, res) => {
        try {
            let users = await User.find({ role: "user" }).sort({ name: 1 })
            res.json(users)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });
    // paged
    app.get("/userss", isAdmin, async (req, res) => {
        try {
            let users = await User.find({ role: "user" }).sort({ name: 1 })
            const page = parseInt(req.query.page) || 1;
            const pager = paginate(users.length, page);
            const pageOfItems = users.slice(pager.startIndex, pager.endIndex + 1);
            return res.json({ pager, pageOfItems });
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get("/admins", async (req, res) => {
        try {
            let users = await User.find({ role: "admin" }).sort({ name: 1 })
            res.json(users)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // to edit
    app.put('/user/:id', async (req, res) => {
        try {
            let update = req.body;
            let user = await User.updateOne({ _id: req.params.id }, update, { returnOriginal: false });
            return res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    // to suspend user
    app.put('/suspend-user/:id', isAdmin, async (req, res) => {
        try {
            await User.updateOne({ _id: req.params.id }, { status: "suspended" }, { returnOriginal: false });
            return res.json({ msg: "User Suspended" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    // to remove user from suspension
    app.put('/revoke-user/:id', isAdmin, async (req, res) => {
        try {
            await User.updateOne({ _id: req.params.id }, { status: "inactive" }, { returnOriginal: false });
            return res.json({ msg: "Suspension Revoked" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    app.get("/user/:id", isAdmin, async (req, res) => {
        try {
            let user = await User.findOne({ _id: req.params.id });
            res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get("/user", auth, async (req, res) => {
        try {
            let user = await User.findOne({ _id: req.user.id });
            res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // update dp
    app.put('/profilepic/:id', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err);
            } else {
                if (req.file) {
                    req.body.image = '/' + req.file.path;
                    try {
                        let update = req.body;
                        let user = await User.findOneAndUpdate({ _id: req.params.id }, update, { returnOriginal: false });
                        return res.json(user)
                    }
                    catch (err) {
                        res.status(500).send(err);
                    }
                }
            }
        });
    });

    app.delete('/user/:id', async (req, res) => {
        try {
            await User.deleteOne()
            res.json({ msg: "User Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });


    app.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) return res.status(400).json({ msg: "This email does not exist." })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })
            await User.updateOne({ email }, { status: "active" }, { returnOriginal: false })

            const token = createAccessToken({ id: user._id })
            const refreshToken = createRefreshToken({ id: user._id })
            res.cookie('ndembelejwt', refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
                path: '/refresh',
                maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
            });

            return res.json({
                msg: "Login successful !!!",
                access_token: token,
                refreshToken
            })
        }
        catch (err) {
            res.status(500).send(err);
        }
    });

    app.post('/refresh', (req, res) => {
        let { token } = req.body
        if (token) {
            const refreshToken = token;
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
                (err, user) => {
                    if (err) {
                        return res.status(406).json({ message: 'Unauthorized' });
                    }
                    else {
                        const accessToken = createAccessToken({ id: user.id })
                        return res.json({ accessToken, msg: "Access token created successfully" });
                    }
                })
        } else {
            return res.status(406).json({ message: 'Unauthorized' });
        }
        // if (req.cookies?.ndembelejwt) {
        //     const refreshToken = req.cookies.ndembelejwt;

        //     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
        //         (err, user) => {
        //             if (err) {
        //                 return res.status(406).json({ message: 'Unauthorized' });
        //             }
        //             else {
        //                 console.log("reach")
        //                 const accessToken = createAccessToken({ id: user.id })
        //                 return res.json({ accessToken, msg: "Access token created successfully" });
        //             }
        //         })
        // } else {
        //     return res.status(406).json({ message: 'Unauthorized' });
        // }
    });

    app.post("/logout/:id", async (req, res) => {
        try {
            // const { email, password, status } = req.body;
            await User.updateOne({ _id: req.params.id }, { status: "inactive" }, { returnOriginal: false })
            res.clearCookie('ndembelejwt', { path: '/refresh' })
            return res.json({ msg: "Logged out." })
        }
        catch (err) {
            res.status(500).send(err);
        }
    });
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

function createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
};

function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' })
};

module.exports = routes;