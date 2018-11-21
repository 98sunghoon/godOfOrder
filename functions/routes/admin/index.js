var express = require('express');
var router = express.Router();
// var firebase = require('firebase');
var admin = require('firebase-admin');
var config = {
    apiKey: "AIzaSyDTvG8uhbteGGsxqrpUW5PHRre0NP2SP90",
    authDomain: "fir-example-317d1.firebaseapp.com",
    databaseURL: "https://fir-example-317d1.firebaseio.com",
    projectId: "fir-example-317d1",
    storageBucket: "fir-example-317d1.appspot.com",
    messagingSenderId: "1094442791549"
};
admin.initializeApp(config);

var db = admin.firestore();



/* GET users listing. */
router.get('/', function(req, res, next) {
    // res.redirect('/loginForm');
    res.send("hi");
});

router.get('/loginForm',function (req,res,next) {
    res.render('admin/loginForm');
});

router.get('/home', function(req, res, next) {
    res.render('admin/home')
});

router.get('/manage?:id', function (req,res,next) {
    // var id = req.query.id;
    res.render('admin/manage');//{
    // res.render('admin/manage');
    // res.send(id);
});

router.get('/qr?:id', function (req,res,next) {
    res.render('admin/qrScreen');
})

router.get('/operate?:id', function (req,res,next) {
    res.render('admin/operate');
})

module.exports = router;
