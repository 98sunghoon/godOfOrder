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


            // console.log(id);
        } else {
            // No user is signed in.
            location.href='loginForm'
        }
    });

    var abc = getParameterByName('id');
    console.log(abc);
}


function menuList(){

}


window.onload = function() {
    init();
};


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}
