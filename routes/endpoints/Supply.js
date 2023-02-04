const Supply = require('../../models/supply');

let routes = (app) => {

    app.post('/supply', async (req, res) => {
        try {
            let supply = new Supply(req.body);
            await supply.save()
            res.json(supply)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/supply', async (req, res) => {
        try {
            let supply = await Supply.find()
                .populate("investment_id")
                .populate("user_id")
            res.json(supply)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/supply:id', async (req, res) => {
        try {
            let supply = await Supply.findOne({ _id: req.params.id })
                .populate("investment_id")
                .populate("user_id")
            res.json(supply)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/supply/:id', async (req, res) => {
        try {
            await Supply.deleteOne({ _id: req.params.id })
            res.json({ msg: "Supply Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;