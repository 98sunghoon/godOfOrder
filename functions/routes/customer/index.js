var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');
var db = admin.firestore();

/* GET users listing. */
router.get('/menus?:id', function (req, res, next) {
    res.render('customer/menu');
});

router.get('/menu?:id',function(req,res,next){//id=restId
    //SSR 바꾸기
    res.render('customer/menu');
});

router.get('/Fmenu?:id',function(req,res,next){
    var fid = req.query.id;
    var data = {};

    var rests = db.collection("cooperation").doc(fid).collection("rests");
    rests.get().then(function (querySnapshot) {
        querySnapshot.forEach(
            function (rest) {
                if (rest.exists) {
                    data[rest.id] = rest.data().name;
                    console.log(rest.id);
                } else {
                    console.log("nonono");
                }
            });
    }).then(function(){
        res.render('customer/Fmenu',{data:data});
    });


});

router.post('/order', function (req, res, next) {//매니저 토큰 받기, 주문 db에 추가하기
    var tableNum = req.body.tableNum;
    var total = req.body.total;
    var basket = JSON.parse(req.body.basket);
    var restId = req.body.restId;
    var customerToken = req.body.customerToken;
    var priceInfo = JSON.parse(req.body.priceInfo);
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
        time:new Date(),
        basket:basket,
        customerToken:customerToken,
        done:false,
        priceInfo:priceInfo
    }).then(function(rest){
        //push send with orderId(docRef.id)
        //data to render
        //define message payload
        var message = {
            token: managerToken,
            data: {
                orderId: rest.id,
            }
        };
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
                res.send(rest.id);
                // res.render("customer/receipt",{basket:basket,priceInfo:priceInfo});

                // res.send({orderId:docRef.id});
            })
            .catch((error) => {
                console.log('Error sending message:', error);
                res.send(199);
            });
    }).catch(function(error){
        // console.log();
    });
});

router.get('/receipt?:id',function(req,res,next){
    var basket,priceInfo;
    db.collection("restaurants").doc(req.query.rest).collection("orders").doc(req.query.id).get().then(function(doc){
        basket=doc.data().basket;
        priceInfo=doc.data().priceInfo;
        res.render("customer/receipt",{basket:basket,priceInfo:priceInfo});
    });
});

router.get('/payment', function (req, res, next) {
   res.send(200);
});

module.exports = router;

