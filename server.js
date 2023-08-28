const express = require('express');

const PORT = 8080;

const app = express();

const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const credentials = require('./reel-talk-backend-firebase-adminsdk-dhaqm-929a64f8fc.json')

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});


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
        const { email } = req.body;
        const user = await admin.auth().getUserByEmail(email);
        res.json({ message: "Login successful!"})
    } catch (err) {
        res.json({ message: "Login failed!"})
    }
})

app.post('/reset', async(req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(user.uid, {password: newPassword})
        res.json({ message: "Password reset successfully!"})
    } catch (err) {
        res.json({ message: "Something went wrong, please confirm you typed in the correct email!"})
    }
})