/*eslint-env node*/
/*eslint quotes:0*/
"use strict";

var express = require('express'),
  exphbs = require('express-handlebars'),
  path = require('path');

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '..')));

app.get('/echo', function(req, res){
  res.set('Content-Type', 'text/html');

  var host = req.get('Host');
  host = host.replace(/\:[0-9]*$/, ''); // Strip port

  var callback = req.query.callback;
  delete req.query.callback;

  res.render('echo', {
    host: host,
    callback: callback,
    response: JSON.stringify(req.query)
  });
});

app.listen(3000);
