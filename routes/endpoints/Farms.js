require('dotenv').config();
const Farm = require('../../models/farms');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const paginate = require('jw-paginate');
const { auth, isAdmin } = require("../../middlewares/authorize");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getMilliseconds() + file.originalname);
    }
});

const fs = require('fs');

const upload = multer({ storage: storage }).array('images', 4);

// cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

async function uploadToCloudinary(locaFilePath) {
    // locaFilePath :
    // path of image which was just uploaded to "uploads" folder

    var mainFolderName = "ndembele"
    // filePathOnCloudinary :
    // path of image we want when it is uploded to cloudinary
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
    return cloudinary.uploader.upload(locaFilePath)
        .then((result) => {
            // Image has been successfully uploaded on cloudinary
            // So we dont need local image file anymore
            // Remove file from local uploads folder 
            fs.unlinkSync(locaFilePath)
            return {
                message: "Success",
                url: result.url
            };
        }).catch((error) => {
            // Remove file from local uploads folder 
            fs.unlinkSync(locaFilePath)
            return { message: "Fail", };
        });
};

let routes = (app) => {
    app.post('/farm', auth, async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err)
                res.json({ msg: "Error occurred" })
            } else {
                if (req.files) {
                    const reqFiles = [];
                    for (let i = 0; i < req.files.length; i++) {
                        var locaFilePath = req.files[i].path
                        var result = await uploadToCloudinary(locaFilePath);
                        reqFiles.push(result.url)
                    }
                    req.body.images = reqFiles;
                    try {
                        const { images } = req.body;
                        if (!images)
                            return res.status(500).json({ msg: "Please Upload Farm Image" })
                        let newFarm = new Farm(req.body);
                        newFarm.userId = req.user.id
                        await newFarm.save()
                        return res.status(200).json({ msg: "Farm Successfully Created" })

                    }
                    catch (err) {
                        return res.status(500).send(err);
                    }
                }
            }
        });
    });

    // get farms according to categories
    app.get('/farms-by-category', async (req, res) => {
        try {
            let farms = await Farm.find({ category: req.query.category }).sort({ name: 1 })
                .populate("userId", "name")
                .populate("category", "title")

            res.json(farms)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get all farms paged
    app.get('/farms', async (req, res) => {
        try {
            let farms = await Farm.find().sort({ name: 1 })
                .populate("userId", "name")
                .populate("category", "title")
            const page = parseInt(req.query.page) || 1;
            const pager = paginate(farms.length, page);
            const pageOfItems = farms.slice(pager.startIndex, pager.endIndex + 1);
            return res.json({ pager, pageOfItems });

        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get all based of verification  farms paged
    app.get('/verify/farms', async (req, res) => {
        try {
            let farms = await Farm.find({ verified: req.query.verified }).sort({ name: 1 })
                .populate("userId", "name")
                .populate("category", "title")
            const page = parseInt(req.query.page) || 1;
            const pager = paginate(farms.length, page);
            const pageOfItems = farms.slice(pager.startIndex, pager.endIndex + 1);
            return res.json({ pager, pageOfItems });

        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get all farms not paged
    app.get('/farmss', async (req, res) => {
        try {
            let farms = await Farm.find()
                .populate("userId", "name")
                .populate("category", "title")
            return res.json(farms);

        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // to verify farm
    app.put('/verify-farm/:id', isAdmin, async (req, res) => {
        try {
            await Farm.updateOne({ _id: req.params.id }, { status: "active", verified: true }, { returnOriginal: false });
            return res.json({ msg: "Farm Verified" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    // to suspend farm
    app.put('/suspend-farm/:id', isAdmin, async (req, res) => {
        try {
            await Farm.updateOne({ _id: req.params.id }, { status: "inactive", verified: false }, { returnOriginal: false });
            return res.json({ msg: "Farm Suspended" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    // get inactive 4 farms
    app.get('/farms/inactive', async (req, res) => {
        try {
            let farms = await Farm.find({ status: "inactive" }).sort({ name: 1 }).limit(4)
                .populate("userId", "name")
                .populate("category", "title")
            res.json(farms)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get farms according to status
    app.get('/farm', async (req, res) => {
        try {
            let farms = await Farm.find({ status: req.query.status }).sort({ name: 1 })
                .populate("userId", "name")
                .populate("category", "title")
            res.json(farms)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get farms created by a user
    app.get('/farms-user', auth, async (req, res) => {
        try {
            let farms = await Farm.find({ userId: req.user.id }).sort({ name: 1 })
                .populate("userId", "name")
                .populate("category", "title")
            res.json(farms)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/farm/:id', async (req, res) => {
        try {
            let farm = await Farm.findOne({ _id: req.params.id })
                .populate("userId", "name")
                .populate("category", "title")
            res.json(farm)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/farm/:id', auth, async (req, res) => {
        try {
            await Farm.deleteOne({ _id: req.params.id })
            res.json({ msg: "Farm Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;