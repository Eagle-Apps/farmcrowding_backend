const Investment = require('../../models/investment');

let routes = (app) => {
    app.post('/investment', async (req, res) => {
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
                            return res.status(500).json({ msg: "Please Upload Investment Image" })
                        let newInvestment = new Investment(req.body);
                        newInvestment.budget = Number(budget).toLocaleString()
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

    app.delete('/investment/:id', async (req, res) => {
        try {
            await Investment.deleteOne()
            res.json({ msg: "Investment Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;