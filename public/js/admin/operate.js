var db = firebase.firestore();

function sendTockenToMyServer(currentToken) {
    // var form = document.createElement("form");
    // form.setAttribute("charset","UTF-8");
    // form.setAttribute("method", "Post");
    // form.setAttribute("action", "/operate/token");
    // // form.setAttribute("target","iframe");
    //
    // var hiddenField = document.createElement("input");
    // hiddenField.setAttribute("type", "hidden");
    // hiddenField.setAttribute("name", "token");
    // hiddenField.setAttribute("value", currentToken);
    // form.appendChild(hiddenField);
    //
    // document.body.appendChild(form);
    // form.submit();
    var restId = getParameterByName('id');
    console.log(restId);
    db.collection("restaurants").doc(restId).set({
        token: currentToken
    },{merge:true});
}

const messaging = firebase.messaging();
// [END get_messaging_object]
// [START set_public_vapid_key]
// Add the public key generated from the console here.
messaging.usePublicVapidKey('BCOh-JjtoWudxg1aLz0yC3CxZV6LtaL3UkAMy6GvvJ2-qY-EvO61E4yhS_veTvWZ1grkJTQOOlTf7GXqfZBcVIc');
// [END set_public_vapid_key]
// IDs of divs that display Instance ID token UI or request permission UI.
// const tokenDivId = 'token_div';
// const permissionDivId = 'permission_div';
// [START refresh_token]
// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(function() {
    messaging.getToken().then(function(refreshedToken) {
        console.log('Token refreshed.');
        // Indicate that the new Instance ID token has not yet been sent to the
        // app server.
        setTokenSentToServer(false);
        // Send Instance ID token to app server.
        sendTokenToServer(refreshedToken);
        // [START_EXCLUDE]
        // Display new Instance ID token and clear UI of all previous messages.
        setToken();
        // [END_EXCLUDE]
    }).catch(function(err) {
        console.log('Unable to retrieve refreshed token ', err);
        showToken('Unable to retrieve refreshed token ', err);
    });
});
// [END refresh_token]
// [START receive_message]
// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
messaging.onMessage(function(payload) {
    console.log('Message received. ', payload);
    // [START_EXCLUDE]
    // Update the UI to include the received message.
    // appendMessage(payload);


    // [END_EXCLUDE]
});
// [END receive_message]
// function reset() {
//     // [START get_token]
//     // Get Instance ID token. Initially this makes a network call, once retrieved
//     // subsequent calls to getToken will return from cache.
//
//     // [END get_token]
// }
// function showToken(currentToken) {
//     // Show token in console and UI.
//     var tokenElement = document.querySelector('#token');
//     tokenElement.textContent = currentToken;
// }

function setToken(){
    messaging.getToken().then(function(currentToken) {
        if (currentToken) {
            sendTokenToServer(currentToken);
            // updateUIForPushEnabled(currentToken);
        } else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
            // Show permission UI.
            // updateUIForPushPermissionRequired();
            setTokenSentToServer(false);


        }
    }).catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
    });
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
        console.log('Sending token to server...');
        // TODO(developer): Send the current token to your server.
        sendTockenToMyServer(currentToken);

        setTokenSentToServer(true);
    } else {
        console.log('Token already sent to server so won\'t send it again ' +
            'unless it changes');
    }
}
function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function requestPermission() {
    console.log('Requesting permission...');
    // [START request_permission]
    messaging.requestPermission().then(function() {
        console.log('Notification permission granted.');
        // TODO(developer): Retrieve an Instance ID token for use with FCM.
        // [START_EXCLUDE]
        // In many cases once an app has been granted notification permission, it
        // should update its UI reflecting this.
        setToken();
        // [END_EXCLUDE]
    }).catch(function(err) {
        console.log('Unable to get permission to notify.', err);
    });
    // [END request_permission]
}

function deleteToken() {
    // Delete Instance ID token.
    // [START delete_token]
    messaging.getToken().then(function(currentToken) {
        messaging.deleteToken(currentToken).then(function() {
            console.log('Token deleted.');
            setTokenSentToServer(false);
            // [START_EXCLUDE]
            // Once token is deleted update UI.
            setToken();
            // [END_EXCLUDE]
        }).catch(function(err) {
            console.log('Unable to delete token. ', err);
        });
        // [END delete_token]
    }).catch(function(err) {
        console.log('Error retrieving Instance ID token. ', err);
        showToken('Error retrieving Instance ID token. ', err);
    });
}

window.onload = function(){
    init();
    requestPermission();
};

function init() {
    //authorize
    // console.log()
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // name = user.displayName;
            // email = user.email;
            // photoUrl = user.photoURL;
            // emailVerified = user.emailVerified;
            // uid = user.uid;

            // console.log(id);
        } else {
            // No user is signed in.
            location.href = 'loginForm'
        }
    });

    // restId = getParameterByName('id');


    // console.log(restId);
    // restRead();
}

function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
