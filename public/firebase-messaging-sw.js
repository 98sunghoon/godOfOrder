// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('/__/firebase/5.5.6/firebase-app.js');
importScripts('/__/firebase/5.5.6/firebase-messaging.js');
importScripts('/__/firebase/init.js');

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const title = '주문의 신';
    const options = {
        body: '주문하신 음식이 완성되었습니다!',
        icon: '/images/Logo.jpg',
        badge: '/images/Logo.jpg',
        vibrate: [200, 100, 200, 100, 200, 100, 400],
    };
    return self.registration.showNotification(title,
        options);
});
