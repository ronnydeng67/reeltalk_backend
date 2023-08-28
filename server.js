const express = require('express');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const PORT = 8080;

const app = express();

const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const credentials = require('./reel-talk-backend-firebase-adminsdk-dhaqm-929a64f8fc.json')

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();

app.use(bodyParser.json());

app.listen(PORT, () => console.log(`Server is now listening on port ${PORT}`));

app.get('/', (req, res) => {
    return res.send("Reel Talk Backend!")
})

app.post('/signup', async(req, res) => {
    try {
        const { email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await admin.auth().createUser({
            email: email,
            password: hashedPassword
        });
        // const token = jwt.sign({ uid: user.uid }, 'secret-key');

        await db.collection('users').doc(user.uid).set({
            email,
            hashedPassword,
            // token
        })
        res.json({ message: "Sign up successfully!"})
    } catch (err) {
        res.json({ message: "Sign up failed!"})
    }
})

app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        // const user = await admin.auth().getUserByEmail(email);
        const user = await db.collection('users').where('email', '==', email).limit(1).get();
        if (user.empty) return res.json({ message: 'User not found'})
        // console.log(user.docs[0].data().hashedPassword)
        const isPasswordMatch = await bcrypt.compare(password, user.docs[0].data().hashedPassword)
        if (!isPasswordMatch) return res.json({ message: "Invaild credentials"})
        // console.log(user.docs[0].data().token)
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