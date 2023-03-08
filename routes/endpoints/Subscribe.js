const Subscribe = require('../../models/subscribe');
const Investment = require('../../models/investment');
const { auth } = require("../../middlewares/authorize");

let routes = (app) => {

    app.post('/investment-subscribe', auth, async (req, res) => {
        try {
            let subscribe = new Subscribe(req.body);
            subscribe.userId = req.user.id
            let investment = await Investment.findOne({ _id: subscribe.investmentId })
            let available = Number(investment.available.replaceAll(",", "")) - Number(subscribe.commitment.replaceAll(",", ""))
            await Investment.updateOne({ _id: subscribe.investmentId }, { available: Number(available).toLocaleString() })
            await subscribe.save()
            res.json({ msg: "Project Successfully Joined" })
        }
        catch (err) {
            console.log(err)
            res.status(500).send({ err, msg: "error" })
        }
    });

    // get subscribers of a project
    app.get('/subscribe/:id', async (req, res) => {
        try {
            let subscribe = await Subscribe.find({ investmentId: req.params.id })
                .populate("userId", "name role")
                .populate("investmentId", "title")
            res.json(subscribe)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });


    // get projects a user is subscribed to
    app.get('/subscribe-user', auth, async (req, res) => {
        try {
            let subscribe = await Subscribe.find({ userId: req.user.id })
                .populate("userId", "name role")
                .populate("investmentId", "title")
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