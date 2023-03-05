const Forum = require('../../models/forum');
const { auth } = require("../../middlewares/authorize");

let routes = (app) => {

    app.post('/forum', auth, async (req, res) => {
        try {
            let { userId } = req.user.id;
            let forum = new Forum(req.body);
            forum.userId = userId
            await forum.save()
            res.json(forum)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/forum', async (req, res) => {
        try {
            let forum = await Forum.find()
                .populate("investment_id")
                .populate("userId")
            res.json(forum)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/forum/:id', async (req, res) => {
        try {
            let forum = await Forum.findOne({ _id: req.params.id })
                .populate("investment_id")
                .populate("userId")
            res.json(forum)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/forums/:id', async (req, res) => {
        try {
            let forum = await Forum.find({ investment_id: req.params.id })
                .populate("userId", "userName")
            res.json(forum)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/forum/:id', async (req, res) => {
        try {
            await Forum.deleteOne({ _id: req.params.id })
            res.json({ msg: "Message Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;