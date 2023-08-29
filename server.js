const express = require('express');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const PORT = 8080;

const app = express();

const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const credentials = require('./reel-talk-backend-firebase-adminsdk-dhaqm-929a64f8fc.json')
const url = 'https://api.themoviedb.org/3/authentication';
const axios = require('axios');

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
        const user = await db.collection('users').where('email', '==', email).limit(1).get();
        if (user.empty) return res.json({ message: 'User not found, please ensure you are using correct email!'})
        //data() to extract the actual js object
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
        const { email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(user.uid, {password: hashedPassword})
        await db.collection('users').doc(user.uid).update({
            email,
            hashedPassword,
        })
        res.json({ message: "Password reset successfully!"})
    } catch (err) {
        res.json({ message: "Something went wrong, please confirm you typed in the correct email!"})
    }
})


app.post('/add-like', async (req, res) => {
    try {
        const { userId, postId } = req.body;
        const userDoc = db.collection('users').doc(userId)
        const user = await userDoc.get();
        if (!user) return res.json({ message: "No user found!"})

        const userData = user.data();
        const userLikes = userData.likes || [];

        if (!userLikes.includes(postId)) {
            userLikes.push(postId)
        }

        await userDoc.update({ likes: userLikes })
        res.json({ message: "You just liked this post!"})
    } catch (err) {
        res.json({ message: "Something went wrong, please try again later!"})
    }
})

app.get('/like/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userDoc = db.collection('users').doc(userId);
        const user = await userDoc.get();
        if (!user) return res.json({ message: "No user found!"})
        // console.log(user)
        const userData = user.data();
        // console.log(userData)
        const userLikes = userData.likes || [];
        res.json({ likes: userLikes})
    } catch (err) {
        res.json({ message: "Failed to load your likes!"})
    }
})

app.get('/movies', async (req, res) => {
    try {
        const apiKey = "10209120d509162552fda65926e2ed59";
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en&sort_by=popularity.desc`)
        const movies = response.data.results;
        const arr = [];
        for (let movie of movies) {
            arr.push(movie.title)
        }
        res.json(arr)
    } catch (err) {
        res.json(err)
    }
})