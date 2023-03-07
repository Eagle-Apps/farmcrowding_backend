const Investment = require('../../models/investment');
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
    app.post('/investment', auth, async (req, res) => {
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
                        const { images, budget } = req.body;
                        if (!images)
                            return res.status(500).json({ msg: "Please Upload Investment Image" })
                        let newInvestment = new Investment(req.body);
                        newInvestment.ownerId = req.user.id
                        newInvestment.budget = Number(budget).toLocaleString()
                        newInvestment.available = Number(budget).toLocaleString()
                        await newInvestment.save()
                        return res.status(200).json({ msg: "Investment Successfully Created" })

                    }
                    catch (err) {
                        return res.status(500).send(err);
                    }
                }
            }
        });
    });

    // get all active investments
    app.get('/investments/active', async (req, res) => {
        try {
            let investments = await Investment.find({ status: "active" }).sort({ createdAt: -1 })
                .populate("category", "title")
            const page = parseInt(req.query.page) || 1;
            const pager = paginate(investments.length, page);
            const pageOfItems = investments.slice(pager.startIndex, pager.endIndex + 1);

            // return pager object and current page of items
            return res.json({ pager, pageOfItems });
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get investments created by a User
    app.get('/investments-user', auth, async (req, res) => {
        try {
            let investments = await Investment.find({ ownerId: req.user.id }).sort({ createdAt: -1 })
                .populate("category", "title")
            return res.json(investments);
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get all investments paged
    app.get('/investments', async (req, res) => {
        try {
            let investments = await Investment.find()
                .populate("category", "title")
                .populate("ownerId", "name")
            const page = parseInt(req.query.page) || 1;
            const pager = paginate(investments.length, page, 12);
            const pageOfItems = investments.slice(pager.startIndex, pager.endIndex + 1);
            return res.json({ pager, pageOfItems });
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get investments by verification status paged
    app.get('/verify/investments', async (req, res) => {
        try {
            let investments = await Investment.find({ verified: req.query.verified })
                .populate("category", "title")
                .populate("ownerId", "name")
            const page = parseInt(req.query.page) || 1;
            const pager = paginate(investments.length, page);
            const pageOfItems = investments.slice(pager.startIndex, pager.endIndex + 1);
            return res.json({ pager, pageOfItems });
        }
        catch (err) {
            res.status(400).send(err)
        }
    });


    // get all investments not paged
    app.get('/investmentss', async (req, res) => {
        try {
            let investments = await Investment.find()
                .populate("category", "title")
            return res.json(investments);
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

    // to verify investment
    app.put('/verify-investment/:id', isAdmin, async (req, res) => {
        try {
            await Investment.updateOne({ _id: req.params.id }, { status: "active", verified: true }, { returnOriginal: false });
            return res.json({ msg: "Investment Verified" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    // to suspend investment
    app.put('/suspend-investment/:id', isAdmin, async (req, res) => {
        try {
            await Investment.updateOne({ _id: req.params.id }, { status: "inactive", verified: false }, { returnOriginal: false });
            return res.json({ msg: "Investment Suspended" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    app.get('/investment/:id', async (req, res) => {
        try {
            let investment = await Investment.findOne({ _id: req.params.id })
                .populate("category", "title")
            res.json(investment)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/investment/:id', auth, async (req, res) => {
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
