
var name, email, photoUrl, uid, emailVerified;
var db = firebase.firestore();

function init(){
    //authorize
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;

        } else {
            // No user is signed in.
            location.href='loginForm'
        }
    });

}

window.onload = function() {
    init();
};


function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}
