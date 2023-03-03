const Report = require('../../models/report');

let routes = (app) => {

    app.post('/report', async (req, res) => {
        try {
            let report = new Report(req.body);
            await report.save()
            res.json(report)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/report', async (req, res) => {
        try {
            let report = await Report.find()
                .populate("investment_id", "title")
                .populate("userId")
            res.json(report)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/report/:id', async (req, res) => {
        try {
            let report = await Report.findOne({ _id: req.params.id })
                .populate("investment_id", "title")
                .populate("userId", "userName")
            res.json(report)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/reports/:id', async (req, res) => {
        try {
            let report = await Report.find({ investment_id: req.params.id })
                .populate("userId", "userName")
            res.json(report)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/report/:id', async (req, res) => {
        try {
            await Report.deleteOne({ _id: req.params.id })
            res.json({ msg: "Message Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;