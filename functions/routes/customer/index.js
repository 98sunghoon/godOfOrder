var express = require('express');
var router = express.Router();

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
router.get('/menus?:id', function(req, res, next) {//id=restId
    // res.redirect('/loginForm');
    res.render('customer/customer');
    // res.send("hi");
});



module.exports = router;
