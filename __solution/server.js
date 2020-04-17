'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { getCollection } = require('./exercise-1-2');
const { createGreeting } = require('./exercises/exercise-2');

const PORT = process.env.PORT || 8000;

express()
  .use(morgan('tiny'))
  .use(express.static('public'))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .use('/', express.static(__dirname + '/'))

  // exercise 1
  .get('/ex-1/:dbName/:collection', getCollection)

  // exercise 2
  .post('/ex-2/greeting', createGreeting)

  // handle 404s
  .use((req, res) => {
    const errMessage = "The page you requested doesn't seem to exist.🤷‍♂️";

    if (req.accepts('json')) {
      res.status(404).json({ error: errMessage });
      return;
    }

    res.status(404).type('txt').send(errMessage);
  })

  .listen(PORT, () => console.log(`Listening on port ${PORT}`));
