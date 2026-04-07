require('dotenv').config();
const express = require('express');
const path = require('path');
const enquiryRouter = require('./routes/enquiry');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/area-guide', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'area-guide.html'));
});

app.use('/api', enquiryRouter);


app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'blog', 'index.html'));
});
 
app.get('/blog/:slug', (req, res) => {
  const file = path.join(__dirname, 'views', 'blog', req.params.slug + '.html');
  res.sendFile(file, err => {
    if (err) res.status(404).send('<h2>Post not found</h2><a href="/blog">← Back to Blog</a>');
  });
});

// ADD to server.js — before the 404 handler
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gallery.html'));
});



// 404 handler
app.use((req, res) => {
  res.status(404).send('<h2>Page not found</h2><a href="/">Go Home</a>');
});

app.listen(PORT, () => {
  console.log(`\n🌴 NIVRRITII Villa is running!`);
  console.log(`👉  Open: http://localhost:${PORT}\n`);
});