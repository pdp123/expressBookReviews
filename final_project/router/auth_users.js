const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secret_key = "my_secret_key"

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
if(typeof username!=='string' || username.trim()===' '){
return false
}
for(let i=0;i<users.length;i++)
{
if(users[i].username===username){
return false
}
}
return true;

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
for(let i=0;i<users.length;i++){
if(users[i].username === username && users[i].password===password){
return true
}

}
return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
//Write your code here
const {username,password} = req.body
if (!username || !password) {
return res.status(400).json({ message: "Username and password are required" });
}
if (!authenticatedUser(username, password)) {
return res.status(401).json({ message: "Invalid username or password" });
}

const token = jwt.sign({username},'my_secret_key',{expiresIn:'1h'})


req.session.token = token;

return res.status(200).json({ message: "Login successful", token });
// return res.status(300).json({message: "Yet to be implemented"});
});

const findBookByISBN = (isbn) => {
return books[isbn];
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
const token = req.headers['authorization'];

if (!token) {
return res.status(403).json({ message: 'No token provided.' });
}

jwt.verify(token.split(' ')[1], 'my_secret_key', (err, decoded) => {
if (err) {
console.error('Failed to authenticate token:', err.message);
return res.status(401).json({ message: 'Failed to authenticate token.' });
}
req.username = decoded.username; // Store username from token in request object
next();
});
};


// Add a book review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
const { isbn } = req.params;
const { review } = req.body;
const username = req.username; // Username from token in request object

if (!books[isbn]) {
return res.status(404).json({ message: 'Book not found' });
}

if (!review) {
return res.status(400).json({ message: 'Review is required' });
}

// Check if the book already has reviews
if (!books[isbn].reviews) {
books[isbn].reviews = [];
}

// Check if the user has already reviewed this book
const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);

if (existingReviewIndex !== -1) {
// Modify existing review
books[isbn].reviews[existingReviewIndex].review = review;
return res.status(200).json({ message: 'Review updated successfully' });
} else {
// Add new review
books[isbn].reviews.push({ username, review });
return res.status(200).json({ message: 'Review added successfully' });
}
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;