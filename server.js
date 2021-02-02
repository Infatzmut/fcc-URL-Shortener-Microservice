require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const app = express();
const dns = require('dns');
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
    dns.lookup(url, (err, address, family) => {
      if(err) {
        console.error(err);
        res.json({"error": "invalid url"});
      } else {
        counter++;
        const original_url = `http://${url}`;
        const short_url = counter;
        let variable = {"url": original_url, "shortUrl": short_url};
        savedData.push(variable);
        res.json({"msg": "saved"});
      } 
    })
  }
})

app.get('/api/shorturl/:url', (req, res) => {
  const {url} = req.params;
  console.info("urls guardadas: ");
  console.info(savedData);
  let doc = savedData.filter(data => data.shortUrl == url)
  console.log(doc);
  res.redirect(doc[0].url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
