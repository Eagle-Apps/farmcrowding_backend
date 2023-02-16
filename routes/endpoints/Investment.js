const Investment = require('../../models/investment');
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
    app.post('/investment', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err)
                return res.json({ msg: "File Missing " })
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
                        const { images, userId, budget, roi } = req.body;
                        if (!userId)
                            return res.status(500).json({ msg: "Please Login In" })
                        if (!images)
                            return res.status(500).json({ msg: "Please Upload Investment Image" })
                        let newInvestment = new Investment(req.body);
                        newInvestment.budget = Number(budget).toLocaleString()
                        await newInvestment.save()
                        return res.status(200).json({ msg: "Investment Successfully Created" })

                    }
                    catch (err) {
                        return res.status(500).send({ msg: "Missing fields" });
                    }
                }
            }
        });
    });

    // get all active investments
    app.get('/investments', async (req, res) => {
        try {
            let Investments = await Investment.find({ status: "active" }).sort({ createdAt: -1 })
                .populate("user_id", "firstname lastname ")
                .populate("category_id", "title")
            res.json(Investments)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    app.get('/investment-4', async (req, res) => {
        let arr = [];
        try {
            let investLatest = await Investment.find().sort({ createdAt: -1 }).limit(1)
            let investHighestBudget = await Investment.find().sort({ budget: -1 }).limit(1)
            let investLowestBudget = await Investment.find().sort({ budget: 1 }).limit(1)
            let investROI = await Investment.find().sort({ roi: -1 }).limit(1)
                .populate("category", "title")
            arr.push(investLatest[0], investHighestBudget[0], investLowestBudget[0], investROI[0])
            res.json(arr)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/investment/:id', async (req, res) => {
        try {
            let Investment = await Investment.findOne({ _id: req.params.id })
                .populate("user_id", "firstname lastname")
                .populate("category_id", "title")
            res.json(Investment)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.post('/investment/:id', async (req, res) => {
        try {
            let investment = await Investment.findOne({ _id: req.params.id })
            investment.subscribers.push(req.body)
            await investment.save()
            return res.json(investment)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/investment/:id', async (req, res) => {
        try {
            await Investment.deleteOne({ _id: req.params.id })
            res.json({ msg: "Investment Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;