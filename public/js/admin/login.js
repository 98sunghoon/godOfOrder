// // var firebase = require('firebase');
// // var firebaseui = require('firebaseui');
//
// var ui = new firebaseui.auth.AuthUI(firebase.auth());
// var uiConfig = {
//     callbacks: {
//         signInSuccessWithAuthResult: function(authResult, redirectUrl) {
//             // User successfully signed in.
//             // Return type determines whether we continue the redirect automatically
//             // or whether we leave that to developer to handle.
//             return true;
//         },
//         uiShown: function() {
//             // The widget is rendered.
//             // Hide the loader.
//             // document.getElementById('loader').style.display = 'none';
//         }
//     },
//     // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
//     signInFlow: 'popup',
//     signInSuccessUrl: '/admin/home',
//     signInOptions: [
//         // Leave the lines as is for the providers you want to offer your users.
//         firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//     ],
//     // Terms of service url.
//     tosUrl: '<your-tos-url>',
//     // Privacy policy url.
//     privacyPolicyUrl: '/'
// };
//
//
// ui.start('#loginBtn', uiConfig);
//
//
//