const express = require('express')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const { Configuration, OpenAIApi } = require("openai");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

const configuration = new Configuration({
    organization: "org-io2SZGXtupzJqRbl4i3MIEec",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


async function send_mail (sub, text, to_email) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'atharvkulkarni399@gmail.com',
            pass: process.env.PASSWORD,
        },
    })

    const options = {
        from: "athukarad109@gmail.com",
        to: to_email,
        subject: sub,
        text: text
    }

    transporter.sendMail(options, function(error, info){
        if(error){
            console.log(error)
        }
        else{
            console.log("Success" + info.response);
        }
    });

}
//blciyvcnfujjzywj
app.get('/', async (req, res) => {
    res.send('Hello There')
})

app.get('/generate-mail', async (req, res) => {

    const {your_name, to_name, subject, to_email} = req.body;

    const prompt = `Write a mail from ${your_name}, education-BTech, working as project enginner in wipro for 1 year, to ${to_name} regarding ${subject} don't mention eduction, only mention skills. Write subject as 'subject: [subject text]'`

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
    });
    let data = completion.data.choices[0].message
    // console.log(data.content)
    let lines = data.content.split('\n')

    let sub = lines.splice(0, 1)[0]
    let subj = sub.substring(9, sub.length)

    let body = lines.join('\n');

    res.json({"subject": subj, "body": body})
})


app.post('/send-email', (req, res) => {
    const {subj, body, to_email} = req.body;
    try{
        send_mail(subj, body, to_email);
    }catch(e){
        res.status(500).json({'Error': e})
    }
    res.status(200).json({"Status":"Success"})
})


app.listen(process.env.PORT || 3000, () => {
    console.log(`App is running`)
})