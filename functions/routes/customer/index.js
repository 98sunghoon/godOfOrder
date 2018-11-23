var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');
// var config = {
//     apiKey: "AIzaSyAWhKVEGr3o6rM4QQLTxgvArv_LCanc1EU",
//     authDomain: "godoforder-74975.firebaseapp.com",
//     databaseURL: "https://godoforder-74975.firebaseio.com",
//     projectId: "godoforder-74975",
//     storageBucket: "godoforder-74975.appspot.com",
//     messagingSenderId: "583480301154"
// };
// admin.initializeApp(config);
var db = admin.firestore();
//
// var admin = require('firebase-admin');
// var config = {
//     apiKey: "AIzaSyDTvG8uhbteGGsxqrpUW5PHRre0NP2SP90",
//     authDomain: "fir-example-317d1.firebaseapp.com",
//     databaseURL: "https://fir-example-317d1.firebaseio.com",
//     projectId: "fir-example-317d1",
//     storageBucket: "fir-example-317d1.appspot.com",
//     messagingSenderId: "1094442791549"
// };
// admin.initializeApp(config);
//
// var db = admin.firestore();


/* GET users listing. */
router.get('/menus?:id', function (req, res, next) {//id=restId
    // res.redirect('/loginForm');
    res.render('customer/customer');
    // res.send("hi");
});

router.post('/order', function (req, res, next) {
    var restId = req.body.restId;
    var body = req.body.data;
    // var menuId = req.body.menuId;
    // var amount = req.body.amount;
    // var time = req.body.time;
    var token;
    //주문 정보 생성
    var order = {
        // menus: body.id,
        // amount: body.amount,
        total: parseInt(req.body.total),
        
        // time:
    };
    console.log(body);
    db.collection("restaurants").doc(restId).get().then(function (doc) {
        token = doc.data().token;
        //날짜정보생성
        var d = new Date();
        var date=""+d.getFullYear()+d.getMonth()+d.getDate();
        console.log(date,typeof(date));
        //주문정보 db에 등록
        db.collection("restaurants").doc(restId).collection("orders").doc(date).collection("today").add(order).then(function(docRef){
            //manager에게 푸시 (간단 정보, 주문 키)
            var registrationToken = token;
            var message = {
                notification: {
                    "title": "주문 알림",
                    "body": ""
                },
                data: {
                    "orderId": docRef.id
                },
                token: registrationToken
            };
            admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                    res.send(true);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    res.send(false);
                });
        });

        // console.log(message)

    })
});


module.exports = router;

// function getAccessToken() {
//     return new Promise(function(resolve, reject) {
//         var key = require('./service-account.json');
//         var jwtClient = new google.auth.JWT(
//             key.client_email,
//             null,
//             key.private_key,
//             SCOPES,
//             null
//         );
//         jwtClient.authorize(function(err, tokens) {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             resolve(tokens.access_token);
//         });
//     });
// }
