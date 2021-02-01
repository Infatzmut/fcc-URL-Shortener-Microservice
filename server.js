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
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.catch(error => console.log(error));

const {Schema} = mongoose;
const urlSchema = new Schema({
    url: String,
    shortUrl: String
})

const UrlModel = mongoose.model('Url', urlSchema);


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
  dns.lookup(url, (err, address, family) => {
    if(err) {
      console.error(err);
      res.json({"error": "invalid url"});
    } else {
      counter++;
      const original_url = `http://${url}`;
      const short_url = counter;
      let variable = new UrlModel({"url": original_url, "shortUrl": short_url});
      variable.save((err, result) => {
        if(err) {
          res.status(404).json({"error": err});
      } else {
          res.send("Record saved")
      }
    })
    } 
  })
})

app.get('/api/shorturl/:url', (req, res) => {
  const {url} = req.params;
  UrlModel.find({"shortUrl": url}, (err, doc) => {
    if(err) {
      res.json({"error": err})
    } else {
      res.redirect(doc[0].url);
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
