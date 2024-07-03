const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
  
//   return res.status(300).json({message: "Yet to be implemented"});
});


const fetchBooks =() =>{
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        resolve(books);
      }, 1000);
    });
  };

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  fetchBooks()
  .then(bookList => {
    res.status(200).send(JSON.stringify(bookList,null,2));
  })
  .catch(error => {
    res.status(500).json({message:'Error fetching books',error:error.message });
  });
  
});

const fetchBooksisbn = (isbn)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            const book = books[isbn]
            if(book){
                resolve(book)
            }else {
                reject(new Error('Book not found'));
              }
        },2000)

    })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const { isbn } = req.params;

  fetchBooksisbn(isbn)
  .then(book => {
    return res.status(200).json(book);
  })
  .catch(error => {
    res.status(404).json({ message: error.message });
  });

 });
  
// Get book details based on author

const fetchBooksAuthor = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let filteredBooks = [];
      for (let isbn in books) {
        if (books[isbn].author === author) {
          filteredBooks.push(books[isbn]);
        }
      }
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error('book not fnd'));
      }
    }, 2000);
  });
};
public_users.get('/author/:author',function (req, res) {
    // const author = req.params.author;
    const author=req.params.author;
  fetchBooksAuthor(author)
    .then(books=>{
      res.status(200).json(books);
    })
    .catch(error => {
      res.status(404).json({message:error.message });
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
    let filteredBooks = [];

    for (let isbn in books) {
        if (books[isbn].title === title) {
            filteredBooks.push(books[isbn]);
        }
    }

    if (filteredBooks.length === 0) {
        return res.status(404).json({ message: "No books found with this title" });
    }

    return res.status(200).json(filteredBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "No book found with this ISBN" });
    }
  
    return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
