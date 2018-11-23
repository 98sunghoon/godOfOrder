const functions = require('firebase-functions');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs',require('ejs').__express);

//middleware 등록
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

// app.use('/', require('./routes'));
app.use('/', require('./routes/admin'));
app.use('/customer', require('./routes/customer'));
// app.use('/admin', require('./routes/admin'));
// app.use('/', require('/admin'));


app.use(function(req, res, next) {
    next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const api1 = functions.https.onRequest(app);

module.exports = {
    api1
};
