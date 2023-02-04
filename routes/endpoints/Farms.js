const Farm = require('../../models/farms');
const multer = require('multer');
// const cloudinary = require('cloudinary').v2;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getMilliseconds() + file.originalname);
    }
});
const fs = require('fs');

const upload = multer({ storage: storage }).single('image');

// cloudinary configuration
// cloudinary.config({
//     cloud_name: "dfv4cufzp",
//     api_key: 861174487596545,
//     api_secret: "6n_1lICquMhRN4YgAMzQlhuG6tY"
// });

// async function uploadToCloudinary(locaFilePath) {

//     var mainFolderName = "ndembele"
//     var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
//     return cloudinary.uploader.upload(locaFilePath)
//         .then((result) => {
//             fs.unlinkSync(locaFilePath)
//             return {
//                 message: "Success",
//                 url: result.url
//             };
//         }).catch((error) => {
//             fs.unlinkSync(locaFilePath)
//             return { message: "Fail", };
//         });
// };

let routes = (app) => {
    app.post('/farm', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err)
                res.json({ msg: "File Missing " })
            } else {
                if (req.file) {
                    var locaFilePath = req.file.path
                    var result = await uploadToCloudinary(locaFilePath);
                    req.body.image = [result.url][0];
                    try {
                        const { image, user_id, budget } = req.body;
                        if (!user_id)
                            return res.status(500).json({ msg: "Please Login In" })
                        if (!image)
                            return res.status(500).json({ msg: "Please Upload Farm Image" })
                        let newFarm = new Farm(req.body);
                        newFarm.budget = Number(budget).toLocaleString()
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
            let farms = await Farm.find({ status: "active" }).sort({ createdAt: -1 })
                .populate("user_id", "firstname lastname ")
                .populate("category_id", "title")
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