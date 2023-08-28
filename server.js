// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const express = require('express');

const PORT = 8080;

const app = express();

const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const credentials = require('./reel-talk-backend-firebase-adminsdk-dhaqm-929a64f8fc.json')

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

// const analytics = getAnalytics(app);

app.use(bodyParser.json());

app.listen(PORT, () => console.log(`Server is now listening on port ${PORT}`));

app.get('/', (req, res) => {
    return res.send("Reel Talk Backend!")
})

app.post('/signup', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await admin.auth().createUser({
            email: email,
            password: password
        });
        res.json({ message: "Sign up successfully!"})
    } catch (err) {
        res.json({ message: "Sign up failed!"})
    }
})

app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const suer = await admin.auth().getUserByEmail(email);
        res.json({ message: "Login successful!"})
    } catch (err) {
        res.json({ message: "Login failed!"})
    }
})