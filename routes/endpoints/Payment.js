require('dotenv').config();
const Payment = require('../../models/payment');
const Flutterwave = require('flutterwave-node-v3');
const open = require("open");
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const User = require("../../models/user");
// const got = require("got");
const axios = require('axios');
const { auth } = require("../../middlewares/authorize");

let routes = (app) => {

    // app.post('/payment', async (req, res) => {
    //     try {
    //         // let { amount, card_number, cvv, expiry_month, expiry_year, redirect_url, fullname,
    //         //     email, phone_number, enckey, userId, investmentId } = req.body;
    //         // let user = await User.findOne({ _id: userId })
    //         // email = user.email;
    //         // phone_number = user.phone;
    //         // fullname = user.name;
    //         // enckey = process.env.ENCRYPTION_KEY;
    //         // redirect_url = "https://www.google.com"
    //         // const response = await flw.Charge.card({
    //         //     amount, card_number, cvv, expiry_month, expiry_year, redirect_url,
    //         //     fullname, email, phone_number, enckey
    //         // });

    //         // if (response.meta.authorization.mode === 'pin') {
    //         //     let payload2 = payload
    //         //     payload2.authorization = {
    //         //         "mode": "pin",
    //         //         "fields": [
    //         //             "pin"
    //         //         ],
    //         //         "pin": 3310
    //         //     }
    //         //     const reCallCharge = await flw.Charge.card(payload2)
    //         //     const callValidate = await flw.Charge.validate({
    //         //         "otp": "12345",
    //         //         "flw_ref": reCallCharge.data.flw_ref
    //         //     })
    //         //     // console.log(callValidate) uncomment for debugging purposes
    //         // }
    //         // if (response.meta.authorization.mode === 'redirect') {
    //         //     var url = response.meta.authorization.redirect
    //         //     open(url)
    //         // }
    //         // let payment = new Payment(req.body);



    //         // let { amount, fullname,
    //         //     email, userId } = req.body;
    //         // let user = await User.findOne({ _id: userId })
    //         // email = user.email;
    //         // fullname = user.name;
    //         // let payment = new Payment(req.body);
    //         // const response = await axios.post("https://api.flutterwave.com/v3/payments", {
    //         //     headers: {
    //         //         Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    //         //     },
    //         //     json: {
    //         //         tx_ref: payment._id,
    //         //         amount: amount,
    //         //         currency: "NGN",
    //         //         redirect_url: "https://www.google.com",
    //         //         customer: {
    //         //             email: email,
    //         //             name: fullname,
    //         //         },
    //         //         customizations: {
    //         //             title: "Ndembele",
    //         //             logo: "https://ndembele-admin.vercel.app/static/media/logo.67c7bb17.png",
    //         //         },
    //         //     },
    //         // })
    //         //     .json();

    //         // const paymentData = { response: response, payDetails: req.body };

    //         // // await payment.save()
    //         // // res.json(payment)
    //         // return paymentData;
    //     }
    //     catch (err) {
    //         res.status(500).send(err)
    //     }
    // });


    app.post('/pay', async (req, res) => {
        let user = await User.findOne({ _id: req.body.userId });
        let payment = new Payment(req.body);
        const payload = {
            card_number: req.body.card_number,
            cvv: req.body.card_cvv,
            expiry_month: req.body.card_expiry_month,
            expiry_year: req.body.card_expiry_year,
            currency: 'NGN',
            amount: req.body.amount,
            email: user.email,
            fullname: user.name,
            phone_number: user.phone,
            // Generate a unique transaction reference
            tx_ref: payment._id,
            // redirect_url: process.env.APP_BASE_URL + '/pay/redirect',
            redirect_url: 'https://www.goal.com/en-ng',
            enckey: process.env.FLW_ENCRYPTION_KEY
        }
        console.log(payment)
        await payment.save()
        const response = await flw.Charge.card(payload);

        switch (response?.meta?.authorization?.mode) {
            case 'pin':
                const payload2 = {
                    card_number: req.body.card_number,
                    cvv: req.body.card_cvv,
                    expiry_month: req.body.card_expiry_month,
                    expiry_year: req.body.card_expiry_year,
                    currency: 'NGN',
                    amount: req.body.amount,
                    email: user.email,
                    fullname: user.name,
                    phone_number: user.phone,
                    // Generate a unique transaction reference
                    tx_ref: payment._id,
                    // redirect_url: process.env.APP_BASE_URL + '/pay/redirect',
                    redirect_url: 'https://www.goal.com/en-ng',
                    enckey: process.env.FLW_ENCRYPTION_KEY,
                    authorization: {
                        "mode": "pin",
                        "pin": req.body.pin
                    }
                }

                const response = await flw.Charge.card(payload2);
                return res.send({ msg: response.data.processor_response, ref: response.data.flw_ref })
            // case 'avs_noauth':
            //     // Store the current payload
            //     req.session.charge_payload = payload;
            //     // Now we'll show the user a form to enter
            //     // the requested fields (PIN or billing details)
            //     req.session.auth_fields = response.meta.authorization.fields;
            //     req.session.auth_mode = response.meta.authorization.mode;
            //     return res.redirect('/pay/authorize');
            // case 'redirect':
            //     // Store the transaction ID
            //     // so we can look it up later with the flw_ref
            //     await redis.setAsync(`txref-${response.data.tx_ref}`, response.data.id);
            //     // Auth type is redirect,
            //     // so just redirect to the customer's bank
            //     const authUrl = response.meta.authorization.redirect;
            //     return res.redirect(authUrl);
            // default:
            //     // No authorization needed; just verify the payment
            //     const transactionId = response.data.id;
            //     const transaction = await flw.Transaction.verify({ id: transactionId });
            //     if (transaction.data.status == "successful") {
            //         return res.redirect('/payment-successful');
            //     } else if (transaction.data.status == "pending") {
            //         // Schedule a job that polls for the status of the payment every 10 minutes
            //         transactionVerificationQueue.add({ id: transactionId });
            //         return res.redirect('/payment-processing');
            //     } else {
            //         return res.redirect('/payment-failed');
            //     }
        }

    });


    // The route where we send the user's auth details (Step 4)
    // app.post('/pay/authorize', async (req, res) => {
    //     const payload = req.session.charge_payload;
    //     // Add the auth mode and requested fields to the payload,
    //     // then call chargeCard again
    //     payload.authorization = {
    //         mode: req.session.auth_mode,
    //     };
    //     req.session.auth_fields.forEach(field => {
    //         payload.authorization.field = req.body[field];
    //     });
    //     const response = await flw.Charge.card(payload);

    //     switch (response?.meta?.authorization?.mode) {
    //         case 'otp':
    //             // Show the user a form to enter the OTP
    //             req.session.flw_ref = response.data.flw_ref;
    //             return res.redirect('/pay/validate');
    //         case 'redirect':
    //             const authUrl = response.meta.authorization.redirect;
    //             return res.redirect(authUrl);
    //         default:
    //             // No validation needed; just verify the payment
    //             const transactionId = response.data.id;
    //             const transaction = await flw.Transaction.verify({ id: transactionId });
    //             if (transaction.data.status == "successful") {
    //                 return res.redirect('/payment-successful');
    //             } else if (transaction.data.status == "pending") {
    //                 // Schedule a job that polls for the status of the payment every 10 minutes
    //                 transactionVerificationQueue.add({ id: transactionId });
    //                 return res.redirect('/payment-processing');
    //             } else {
    //                 return res.redirect('/payment-failed');
    //             }
    //     }
    // });


    // The route where we validate and verify the payment (Steps 5 - 6)
    app.post('/pay/validate', async (req, res) => {
        const response = await flw.Charge.validate({
            otp: req.body.otp,
            flw_ref: req.body.ref
        });

        if (response.data.status === 'successful' || response.data.status === 'pending') {
            // Verify the payment
            const transactionId = response.data.id;
            const transaction = await flw.Transaction.verify({ id: transactionId });

            if (transaction.data.status == "successful") {
                return res.send({ msg: "payment confirmed" });
            } else if (transaction.data.status == "pending") {
                // Schedule a job that polls for the status of the payment every 10 minutes
                transactionVerificationQueue.add({ id: transactionId });
                return res.redirect('/payment-processing');
            }
        }

        // return res.redirect('/payment-failed');
    });

    // // Our redirect_url. For 3DS payments, Flutterwave will redirect here after authorization,
    // // and we can verify the payment (Step 6)
    // app.post('/pay/redirect', async (req, res) => {
    //     if (req.query.status === 'successful' || req.query.status === 'pending') {
    //         // Verify the payment
    //         const txRef = req.query.tx_ref;
    //         const transactionId = await redis.getAsync(`txref-${txRef}`);
    //         const transaction = flw.Transaction.verify({ id: transactionId });
    //         if (transaction.data.status == "successful") {
    //             return res.redirect('/payment-successful');
    //         } else if (transaction.data.status == "pending") {
    //             // Schedule a job that polls for the status of the payment every 10 minutes
    //             transactionVerificationQueue.add({ id: transactionId });
    //             return res.redirect('/payment-processing');
    //         }
    //     }

    //     return res.redirect('/payment-failed');
    // });

    app.post('/payment', async (req, res) => {
        try {
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
                .populate("userId", "name")
                .populate("investmentId")
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