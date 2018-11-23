var express = require('express');
var router = express.Router();
// var firebase = require('firebase');
var admin = require('firebase-admin');
var config = {
    apiKey: "AIzaSyAWhKVEGr3o6rM4QQLTxgvArv_LCanc1EU",
    authDomain: "godoforder-74975.firebaseapp.com",
    databaseURL: "https://godoforder-74975.firebaseio.com",
    projectId: "godoforder-74975",
    storageBucket: "godoforder-74975.appspot.com",
    messagingSenderId: "583480301154"
};
admin.initializeApp(config);

var db = admin.firestore();


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.redirect('/loginForm');
    // res.send("hi");
});

router.get('/loginForm', function (req, res, next) {
    res.render('admin/loginForm');
});

router.get('/home', function (req, res, next) {
    res.render('admin/home')
});

router.get('/manage?:id', function (req, res, next) {
    // var id = req.query.id;
    res.render('admin/manage');//{
    // res.render('admin/manage');
    // res.send(id);
});

router.get('/qr?:id', function (req, res, next) {
    res.render('admin/qrScreen');
})

router.get('/operate?:id', function (req, res, next) {
    res.render('admin/operate');
});

router.post('/operate/token', function (req,res,next){
    let token = req.body.token;
    //FCM에 푸시 요청
});

module.exports = router;
