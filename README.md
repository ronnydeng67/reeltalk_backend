# Reel Talk Bakcend

## Technologies

- Node.js 
- Express.js (Backend Framework)
- Firestore NoSQL(Database)
- Firebase authentication
- Axios

## MVPs

- User can sign up, login to account with correct email and password
- User email and hashed password will be store in Firestore database
- User can reset their password, new password will be update to both Firebase authentication and Firestore database
- Movie endpoint can fetch movies by popularity from an external APIs 

## Sample State

```
{
    users: {
        userUid: {
            email: "ronny@gmail.com",
            hashedPassword: "**********",
            likes: [postId1, postId2, postId3]
        }
    }
}
```