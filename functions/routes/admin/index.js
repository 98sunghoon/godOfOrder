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
const webpush = require('web-push');

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

router.post('/operate', function (req, res, next) {
    var restId = req.body.restId;
    var orderId = req.body.orderId;
    console.log(restId,orderId);
    var orderRef = db.collection("restaurants").doc(restId).collection("orders").doc(orderId);
    var pushSubscription;
    orderRef.get().then(function(order){
        pushSubscription = JSON.parse(order.data().customerToken);

        const vapidKeys = webpush.generateVAPIDKeys();
        webpush.setGCMAPIKey('AAAAh9oi1mI:APA91bGzWo2qVZLei7Ab0Oun2IA6Efb4B299KsM9lsAxhmgqUiogyLTnSGZe87JqLUDp5IpjPQrFQpyPZS8_Y-DPxjtYQhvZfU2XVmvoVCvbPTQ8hyvwMIJJX1YLgqcfwi-ngtpA3bTu');
        webpush.setVapidDetails(
            'mailto:example@yourdomain.org',
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );
        webpush.sendNotification(pushSubscription, ""+order.data().orderNum).catch(function(error){
            console.log("this is error : ",error);
        });
    });

});

module.exports = router;
