require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const app = express();
const validUrl = require('valid-url');
const shortId = require('shortid');
// Basic Configuration
const port = process.env.PORT || 3000;
let counter = 0;
let savedData = []
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000});

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error'));
connection.once('open', () => {
  console.log("Connected to mongo db");
})

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String, 
  short_url: String
});
const URL = mongoose.model('URL', urlSchema);

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

app.post('/api/shorturl/new', async (req, res) => {
  const url = req.body.url;
  const urlCode = shortId.generate();
  if(!validUrl.isWebUri(url)) {
    res.json({"error": "invalid url"})
  } else {
    try {
      let findOne = await URL.findOne({
        original_url: url
      })
      if(findOne) {
        res.json({
          "original_url": findOne.original_url,
          "short_url": findOne.short_url
        })
      } else {
        findOne = new URL({
          original_url: url,
          short_url: urlCode
        })
        await findOne.save();
        res.json({
          "original_url": findOne.original_url,
          "short_url": findOne.short_url
        })
      }
    } catch(error) {
      console.error(error);
      res.status(500).json({"msg":"Server error"})
    }
  }
})

app.get('/api/shorturl/:url?', async (req, res) => {
  try {
    const urlParams = await URL.findOne({
      short_url: req.params.url
    })
    if(urlParams) {
      return res.redirect(urlParams.original_url)
    } else {
      return res.status(404).json({"error": "invalid url"});
    }
  } catch(err) {
    console.error(err);
    res.status(500).json({"msg": err});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
