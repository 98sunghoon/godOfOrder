var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');
var db = admin.firestore();

/* GET users listing. */
router.get('/menus?:id', function (req, res, next) {//id=restId
    //SSR 바꾸기
    res.render('customer/customer');
});



router.post('/order', function (req, res, next) {//매니저 토큰 받기, 주문 db에 추가하기
    var tableNum = req.body.tableNum;
    var total = req.body.total;
    var basket = JSON.parse(req.body.basket);
    var restId = req.body.restId;
    var customerToken = req.body.customerToken;

    var managerToken;

    //get manager's token
    var restRef = db.collection("restaurants").doc(restId);
    restRef.get().then(function(doc){
        managerToken = doc.data().token;
    }).catch(function(error){
        console.log("cannot get manager Token",error);
    });

    //input data into database
    restRef.collection("orders").add({
        total:total,
        tableNum:tableNum,
        // time:new Date(),
        basket:basket,
        customerToken:customerToken,
        done:false
    }).then(function(docRef){
        //push send with orderId(docRef.id)
        //define message payload
        var message = {
            token: managerToken,
            data: {
                orderId: docRef.id,
                // time: new Date()
            }
        };
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
                res.render("customer/receipt",{});
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }).catch(function(error){
        // console.log();
    });
});

router.get('/order?:id', function (req, res, next) {//id=restId
    res.render('customer/order');
});

module.exports = router;

