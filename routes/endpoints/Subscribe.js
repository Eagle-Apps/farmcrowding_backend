const Subscribe = require('../../models/subscribe');

let routes = (app) => {

    app.post('/subscribe', async (req, res) => {
        try {
            let subscribe = new Subscribe(req.body);
            await subscribe.save()
            res.json(subscribe)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/subscribe', async (req, res) => {
        try {
            let subscribe = await Subscribe.find()
                .populate("userId", "name role")
                .populate("investmentId", "name role")
            res.json(subscribe)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // to activate a user's subscription
    app.put('/activate-subscriber/:id', async (req, res) => {
        try {
            await Subscribe.updateOne({ _id: req.params.id }, { status: "participant" }, { returnOriginal: false });
            return res.json({ msg: "User is now a participant of the Project" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    // to decline a user's subscription
    app.put('/decline-subscriber/:id', async (req, res) => {
        try {
            await Subscribe.updateOne({ _id: req.params.id }, { status: "decline" }, { returnOriginal: false });
            return res.json({ msg: "User declined from joining the Project" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error Occurred" })
        }
    });

    app.delete('/subscribe/:id', async (req, res) => {
        try {
            await Subscription.deleteOne({ _id: req.params.id })
            res.json({ msg: "Subscription Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;