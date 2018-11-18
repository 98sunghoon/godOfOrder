
var name, email, photoUrl, uid, emailVerified;
var db = firebase.firestore();

function init(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;
            // console.log("user info : ",user);
            restaurantList();
        } else {
            // No user is signed in.
            console.log("hi");
        }
    });

}

window.onload = function() {
    init();
};