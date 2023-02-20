require('dotenv').config();
const Payment = require('../../models/payment');
const Flutterwave = require('flutterwave-node-v3');
const open = require("open");
const flw = new Flutterwave(process.env.PUBLIC_KEY, process.env.SECRET_KEY);
const User = require("../../models/user");

let routes = (app) => {

    app.post('/payment', async (req, res) => {
        try {
            let { amount, card_number, cvv, expiry_month, expiry_year, redirect_url, fullname,
                email, phone_number, enckey, userId, investmentId } = req.body;
            let user = await User.findOne({ _id: userId })
            email = user.email;
            phone_number = user.phone;
            fullname = user.name;
            enckey = process.env.ENCRYPTION_KEY;
            redirect_url = "https://www.google.com"
            const response = await flw.Charge.card({
                amount, card_number, cvv, expiry_month, expiry_year, redirect_url,
                fullname, email, phone_number, enckey
            });
            console.log(response)
            console.log(req.body)
            if (response.meta.authorization.mode === 'pin') {
                let payload2 = payload
                payload2.authorization = {
                    "mode": "pin",
                    "fields": [
                        "pin"
                    ],
                    "pin": 3310
                }
                const reCallCharge = await flw.Charge.card(payload2)
                const callValidate = await flw.Charge.validate({
                    "otp": "12345",
                    "flw_ref": reCallCharge.data.flw_ref
                })
                // console.log(callValidate) uncomment for debugging purposes
            }
            if (response.meta.authorization.mode === 'redirect') {
                var url = response.meta.authorization.redirect
                open(url)
            }
            let payment = new Payment(req.body);
            await payment.save()
            res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/payment', async (req, res) => {
        try {
            let payment = await Payment.find()
                .populate("userId", "name role")
                .populate("investment_id")
            res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/payment/:id', async (req, res) => {
        try {
            await Payment.deleteOne({ _id: req.params.id })
            res.json({ msg: "Payment Record Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;