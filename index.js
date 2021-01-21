const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();


//Oauth Tokens
const CLIENT_ID = process.env.CLI_ID
const CLIENT_SECRET = process.env.CLI_SEC
const REDIRECT_URI = process.env.RED_URI
const REFRESH_TOKEN = process.env.REF_TOK

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//middlewares
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.render("index");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/contact', (req, res) => {
    res.render("contact");
});


app.post('/contact/send', (req, res) => {
    async function sendmail() {
        try {
            const accessToken = await oAuth2Client.getAccessToken();
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.USER,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken
                }
            });
            const mailOptions = {
                from: process.env.FROM,
                to: process.env.TO,
                subject: 'Website Submission',
                text: 'You have a submission with the following details... Name: ' + req.body.name + 'Email: ' + req.body.email + 'Message: ' + req.body.message,
                html: '<p>You have a submission with the following details...</p><ul><li>Name: ' + req.body.name + '</li><li>Email: ' + req.body.email + '</li><li>Message: ' + req.body.message + '</li></ul>'
            };
            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.redirect('/');
                } else {
                    console.log('Message Sent: ' + info.responce);
                    res.redirect('/');
                }
            });
            const result = await transport.sendMail(mailOptions);
            return result;
        }
        catch (error) {
            return error;
        }

    }

    sendmail().then(result => console.log('Email sent', result))
        .catch(error => console.log(error.message))
})



const port = process.env.PORT || 5600;

app.listen(port, () => {
    console.log("Sample App is Running On The Port " + port);
})