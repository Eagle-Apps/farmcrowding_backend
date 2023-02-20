const flutter = async () => {
    return async (req, res, next) => {
        const payload = {
            "card_number": "5531886652142950",
            "cvv": "564",
            "expiry_month": "09",
            "expiry_year": "21",
            "currency": "ZMW",
            "amount": "100",
            "redirect_url": "https://www.google.com", //Put your redirect link here
            "fullname": "Gift Banda",
            "email": "bandagift42@gmail.com",
            "phone_number": "0977560054",
            "enckey": process.env.ENCRYPTION_KEY,
            "tx_ref": "MC-32444ee--4eerye4euee3rerds4423e43e"// This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
        }
        try {
            const response = await flw.Charge.card(payload)
            console.log(response)
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
            res.status(200).json(response)
            // console.log(response) uncomment for debugging purposes
        } catch (error) {
            console.log(error)
        }
    }

    next()
}

module.exports = { flutter } 