const messaging = firebase.messaging();

messaging.usePublicVapidKey('BCOh-JjtoWudxg1aLz0yC3CxZV6LtaL3UkAMy6GvvJ2-qY-EvO61E4yhS_veTvWZ1grkJTQOOlTf7GXqfZBcVIc');
messaging.onTokenRefresh(function () {
    messaging.getToken().then(function (refreshedToken) {
        console.log('Token refreshed.');

    }).catch(function (err) {
        console.log('Unable to retrieve refreshed token ', err);
        //홈으로
    });
});
messaging.onMessage(function (payload) {
    console.log('Message received. ', payload);

    navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification('주문의 신', {
            body: '주문하신 음식이 완성되었습니다!',
            icon: '/images/Logo.jpg',
            badge: '/images/Logo.jpg',
            vibrate: [200, 100, 200, 100, 200, 100, 400],
        });
    });
});
