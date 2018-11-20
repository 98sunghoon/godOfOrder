var auth;
var name, email, photoUrl, uid, emailVerified;
var db = firebase.firestore();

function login() {

    auth = firebase.auth();
    var authProvider = new firebase.auth.GoogleAuthProvider();
    auth.onAuthStateChanged(function (user) {
        // Authentication Success
        if (user) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;
            db.collection("managers").doc(uid).set({
                name: name
            }).then(function () {
                location.href = 'home';
            })

        }
        // Authentication Fail
        else {
            auth.signInWithPopup(authProvider);
        }
    })
}


