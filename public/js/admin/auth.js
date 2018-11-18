// var firebase = require('firebase');

// // Initialize Firebase
// var config = {
//     apiKey: "AIzaSyAWhKVEGr3o6rM4QQLTxgvArv_LCanc1EU",
//     authDomain: "godoforder-74975.firebaseapp.com",
//     databaseURL: "https://godoforder-74975.firebaseio.com",
//     projectId: "godoforder-74975",
//     storageBucket: "godoforder-74975.appspot.com",
//     messagingSenderId: "583480301154"
// };
// firebase.initializeApp(config);
var auth;

function login() {

    auth = firebase.auth();
    var authProvider = new firebase.auth.GoogleAuthProvider();
    auth.onAuthStateChanged(function(user) {
        // Authentication Success
        if (user) {
            console.log("Success");
            console.log(user);
            location.href='home';
        }
        // Authentication Fail
        else {
            auth.signInWithPopup(authProvider);
        }
    })
}


