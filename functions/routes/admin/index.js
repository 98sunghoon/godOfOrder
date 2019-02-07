var express = require('express');
var router = express.Router();
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
var rests = db.collection("restaurants");

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
    res.render('admin/manage');
});

router.get('/manage/foodcourt?:id', function (req, res, next) {
    var restID = req.query.id;
    var data = {};
    rests.doc(restID).get().then(function(rest){
        if(rest.data().foodcourt != 0){
            var isCheif = rest.data().foodcourt == -1;
            var rests = db.collection("cooperation").doc(rest.data().foodcourtID).collection("rests");
            rests.get().then(function (querySnapshot) {
                querySnapshot.forEach(
                    function (rest) {
                        if (rest.exists) {
                            // rests.doc(rest.id).get().then(function(doc){
                            //
                            // });
                            data[rest.id] = rest.data().name;
                            console.log(rest.id);
                        } else {
                            console.log("nonono");
                        }
                    });
            }).then(function(){
                res.render('admin/foodcourt', {restID: restID, fID:rest.data().foodcourtID,data: data, isCheif:isCheif});
            });
        }else{//참여중인 협업이 없다면
            res.render('admin/foodcourt',{restID: restID, fID:null,data:data, isCheif:false})
        }
    });



});

router.post('/manage/foodcourt/invite', function (req, res, next) {

    //초대하려는 rid, 초대자 rid
    var targetRID = req.body.targetRID;
    var myRID = req.body.myRID;
    db.collection("restaurants").doc(myRID).get().then(function (inviter) {

        db.collection("restaurants").doc(targetRID).get().then(function (invited) {
            //초대 가능
            var ref = db.collection("cooperation").doc(inviter.id);
            var firstInvite = inviter.data().foodcourt == 0;

            if (firstInvite) {
                ref.set({
                    cheif: inviter.id,
                });
                ref.collection("rests").doc(inviter.id).set({
                    name: inviter.data().name
                });
            }

            ref.collection("rests").doc(invited.id).set({
                name: invited.data().name
            });

            rests.doc(invited.id).update({foodcourt: 1, foodcourtID: ref.id});
            if (firstInvite) {
                rests.doc(inviter.id).update({foodcourt: -1, foodcourtID: ref.id});
            }
            // res.redirect('/manage/foodcourt');
            res.send("hi");
        }).catch(function (error) {
            console.log(error);
        })
    }).catch(function (error) {
        console.log(error);
    })
});

router.post('/manage/foodcourt/quit', function (req, res, next) {
    var targetID = req.body.targetRID;
    var myID = req.body.myRID;

    if(targetID == null){
        //quit
        rests.doc(myID).get().then(function(doc){
            db.collection("cooperation").doc(doc.data().foodcourtID).collection("rests").doc(myID).delete().then(function(){
                rests.doc(myID).update({foodcourt:0, foodcourtID:null});
                res.send("hi");
            }).catch(function(error){
                console.log("그런거 없습니다.",error)
            });
        });
    }else{
        // target fc=0, co에서 삭제
        //방장인 경우는 나중에 추가
        rests.doc(targetID).update({foodcourt:0, foodcourtID:null});
        db.collection("cooperation").doc(myID).collection("rests").doc(targetID).delete().then(function(){
            res.send("hi");
        }).catch(function(error){
            console.log("그런거 없습니다.",error)
        });
    }
});

router.get('/manage/foodcourt/qr?:id', function(req,res,next){

    res.render('admin/FCqr');
});

router.get('/qr?:id', function (req, res, next) {
    res.render('admin/qrScreen');
});

router.get('/operate?:id', function (req, res, next) {
    res.render('admin/operate');
});

router.post('/operate', function (req, res, next) {
    var restId = req.body.restId;
    var orderId = req.body.orderId;
    console.log(restId, orderId);
    var orderRef = db.collection("restaurants").doc(restId).collection("orders").doc(orderId);

    orderRef.get().then(function (order) {
        var message = {
            token: order.data().customerToken,
            notification: {
                title: "주문의 신",
                body: order.data().orderNum + "님! 주문하신 음식이 준비되었습니다!",

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
    }).catch(function (error) {
        console.log(error);
    });

});

module.exports = router;
