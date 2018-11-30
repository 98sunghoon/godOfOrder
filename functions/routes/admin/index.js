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

router.post('/operate', function (req, res, next) {
    var restId = req.body.restId;
    var orderId = req.body.orderId;
    console.log(restId,orderId);
    var orderRef = db.collection("restaurants").doc(restId).collection("orders").doc(orderId);

    orderRef.get().then(function(order){
        var message = {
            token: order.data().customerToken,
            notification: {
                title: "주문하신 음식이 준비되었습니다!",
                body: order.data().orderNum,
            }
        };
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }).catch(function(error){
        console.log(error);
    });

});

module.exports = router;
