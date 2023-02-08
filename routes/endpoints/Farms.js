const Farm = require('../../models/farms');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;


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

// const { auth, isLoggedIn } = require('../middlewares/loggedIn');

// cloudinary configuration
cloudinary.config({
    cloud_name: "dfv4cufzp",
    api_key: 861174487596545,
    api_secret: "6n_1lICquMhRN4YgAMzQlhuG6tY"
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
    app.post('/farm', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err)
                res.json({ msg: "Error occurred" })
            } else {
                console.log(req.files)
                console.log(req.body)
                if (req.files) {
                    const reqFiles = [];
                    for (let i = 0; i < req.files.length; i++) {
                        var locaFilePath = req.files[i].path
                        var result = await uploadToCloudinary(locaFilePath);
                        reqFiles.push(result.url)
                    }
                    req.body.images = reqFiles;
                    try {
                        const { images, userId } = req.body;
                        if (!userId)
                            return res.status(500).json({ msg: "Please Login In" })
                        if (!images)
                            return res.status(500).json({ msg: "Please Upload Farm Image" })
                        let newFarm = new Farm(req.body);
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



    // get active farms according to categories
    app.get('/farms-by-category', async (req, res) => {
        try {
            let farms = await Farm.find({ status: "active", category_id: req.query.category }).sort({ createdAt: -1 })
                .populate("user_id", "firstname lastname")
                .populate("category_id", "title")
            res.json(farms)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get all active farms
    app.get('/farms', async (req, res) => {
        try {
            let farms = await Farm.find().sort({ name: 1 })
            // .populate("user_id", "firstname lastname ")
            // .populate("category_id", "title")
            res.json(farms)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get latest 8 farms
    app.get('/farm-8', async (req, res) => {
        try {
            let farms = await Farm.find().sort({ createdAt: -1 }).limit(8)
                .populate("user_id", "firstname lastname role")
                .populate("category_id", "title")
            res.json(farms)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/farm/:id', async (req, res) => {
        try {
            let farm = await Farm.findOne({ _id: req.params.id })
                .populate("user_id", "firstname lastname")
                .populate("category_id", "title")
            res.json(farm)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/farm/:id', async (req, res) => {
        try {
            await Farm.deleteOne()
            res.json({ msg: "Farm Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;