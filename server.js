require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const app = express();
const validUrl = require('valid-url');
// Basic Configuration
const port = process.env.PORT || 3000;
let counter = 0;
let savedData = []

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', (req, res) => {
  const {url} = req.body;
  if(!url) {
    res.json({"error":"Invalid url"})
  } else {
    if(!validUrl.isWebUri(url)) {
      res.status(401).json({"error":"invalid URL"});
    } else {
      counter++;
      const short_url = counter;
      let variable = {"original_url": url, "shortUrl": short_url};
      savedData.push(variable);
      res.json({"msg": "saved"});
    } 
  }
})

app.get('/api/shorturl/:url?', (req, res) => {
  console.log(req.params)
  if(!req.params.url || req.params.url == 'undefined') {
    res.json({"msg": "Invalid url"});
  } else {
    const {url} = req.params;
    console.info("urls guardadas: ");
    console.info(savedData);
    let doc = savedData.filter(data => data.shortUrl == url)
    console.log(doc);
    res.redirect(doc[0].url);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
