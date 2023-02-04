const Forum = require('../../models/forum');

let routes = (app) => {

    app.post('/forum', async (req, res) => {
        try {
            let forum = new Forum(req.body);
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
                .populate("user_id")
            res.json(forum)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/forum:id', async (req, res) => {
        try {
            let forum = await Forum.findOne({ _id: req.params.id })
                .populate("investment_id")
                .populate("user_id")
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