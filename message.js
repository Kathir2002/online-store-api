const fast2sms = require('fast-two-sms')
require("dotenv").config()

const options = {
    authorization: "CoEe14FHgx7vrST5bkDwlK8pUtndsWQXJPVBiZAzImcu9YROqNbTnIWo0ZH2jkV6tMY5qpKFCfxOd1gS",
    message: "Hai kathir",
    numbers: ["9080574409"]
}

fast2sms.sendMessage(options)
    .then((response) => { console.log(response) })
    .catch((error) => { console.log(error) })