'use strict';

const applicationServerPublicKey = 'BCOh-JjtoWudxg1aLz0yC3CxZV6LtaL3UkAMy6GvvJ2-qY-EvO61E4yhS_veTvWZ1grkJTQOOlTf7GXqfZBcVIc';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('/sw.js')
        .then(function (swReg) {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;
            //초기작업
            reqSub();
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function init() {
    // Set the initial subscription value

}

function reqSub() {
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);

            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

        });
    if (!isSubscribed) {
        subscribeUser();
    }

    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);

            updateSubscriptionOnServer(subscription);

            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

            // updateBtn();
        });
}


function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function (subscription) {
            console.log('User is subscribed:', subscription);
            updateSubscriptionOnServer(subscription);
            isSubscribed = true;
        })
        .catch(function (err) {
            console.log('Failed to subscribe the user: ', err);
        });
}

var cusSub;
function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    // const subscriptionJson = document.querySelector('.js-subscription-json');
    // const subscriptionDetails =
    //     document.querySelector('.js-subscription-details');
    //
    if (subscription) {

        console.log(JSON.stringify(subscription));
        cusSub=JSON.stringify(subscription);
        // subscriptionDetails.classList.remove('is-invisible');
    } else {
        // subscriptionDetails.classList.add('is-invisible');
    }
}


var db = firebase.firestore();

var restId;
var tableNum;

var totalPrice = 0;
var basket = {};
var menuInfo = [];

window.onload = function () {
    init();
};

function init() {
    restId = getParameterByName('id');
    tableNum = getParameterByName('table');
    menuList();
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function menuList() {
    db.collection("restaurants").doc(restId).get().then(function (ref) {
        document.getElementById('restName').innerHTML = ref.data().name;
        console.log(ref.data().name);
        db.collection("restaurants").doc(restId).collection("menus").get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var ob = {
                    'id': doc.id,
                    'name': doc.data().name,
                    'detail': doc.data().description,
                    'price': doc.data().price,
                    "image": doc.data().image,
                };
                if (ob.image) {
                    drawImageMenu(ob);
                } else {
                    drawTableMenu(ob);
                }
                menuInfo.push(ob);
                // console.log(menuInfo);
            })
        });
    });
}

function drawImageMenu(obj) {

    var tag = "";
    tag += "<div id=\"" + obj.id + "\" onclick=selectMenu(\"" + obj.id + "\")>";
    // console.log("id", obj.id);
    tag += "<div id=\"menu\"> <img src=\"" + obj.image + "\" id=\"pic\">";
    tag += "<div>";
    tag += " <ul>";
    tag += "<li >" + obj.name + "</li>";//id="name"
    tag += "<li id=\"info\">" + obj.detail + "</li>";
    tag += "<li >" + obj.price + "원</li>";//id="price"
    tag += "</ul>";
    tag += "</div>";
    tag += "</div>";
    tag += "</div>";

    $("#img_menu_area").append(tag);

}

function drawTableMenu(obj) {
    var tag = "";
    tag += "<tr onclick=selectMenu(\"" + obj.id + "\")>";
    tag += "<td>" + obj.name;
    tag += "<div id=\"info\"> " + obj.detail + "</div>";
    tag += "</td>";
    tag += "<td id=\"price\">" + obj.price + "원</td>";
    tag += "</tr>";

    $("#menuTable").append(tag);
}

function selectMenu(menuId) {
    // var menuItem = document.getElementById(menuId);
    console.log(menuId);
    //이미 있으면 수량만 증가
    if (!basket[menuId]) {
        // console.log("new add");
        basket[menuId] = 1;
        addMenuToList(menuId);
    } else {
        // console.log("add");
        increaseAmount(menuId);
    }
    console.log('basket', basket);
    updateTotal();
}

function addMenuToList(menuId) {
    var ob = menuInfo.find(c => c.id === menuId);
    // var ob = menuInfo[0];
    var tag = "";
    tag += "<tr id=\"s" + menuId + "\">";
    tag += "<td>";
    tag += "<button type=\"button\" class=\"btn btn-outline-dark\" id=\"x\" onclick=deleteMenu(\"" + menuId + "\")>x</button>";
    tag += "</td>";
    // console.log("name",$("#"+menuId).children('#name').innerHTML);
    // const findArr = [{name:"lemon", age:17}, {name:"candy", age:27}];
    // {name:"candy", age:27}
    tag += "<td>" + ob.name + "</td>";
    tag += "<td>";
    tag += "<form>";
    tag += "<input type=\"button\" class=\"btn btn-outline-danger\" style=\"font-size: 40px;\" value=\" - \" onclick=decreaseAmount(\"" + menuId + "\")>";
    tag += "<input type=\"text\" name=\"amount\" value=" + basket[menuId] + " size=\"3\" style=\"text-align: center\">";
    tag += "<input type=\"button\" class=\"btn btn-outline-primary\" style=\"font-size: 40px;\" value=\" + \" onclick=increaseAmount(\"" + menuId + "\")>";
    tag += "</form>";
    tag += "</td>";
    tag += "</tr>";
    $("#orderList").append(tag);
}

function increaseAmount(menuId) {
    basket[menuId]++;
    $("#s" + menuId).find("input[name=amount]").val(basket[menuId]);
    updateTotal();
}

function decreaseAmount(menuId) {
    basket[menuId]--;
    if (basket[menuId] == 0) {
        $("#s" + menuId).remove()
    }
    $("#s" + menuId).find("input[name=amount]").val(basket[menuId]);
    updateTotal();
}

function deleteMenu(menuId) {
    basket[menuId] = 0;
    $("#s" + menuId).remove();
    updateTotal();
}

function updateTotal() {
    var total = 0;
    for (var index in basket) {//index=menuId , basket[index]=amount
        var ob = menuInfo.find(c => c.id === index);

        // console.log("type of price : ",typeof(obj.price));
        total += ob.price * basket[index];

        if (basket[index] == 0) {
            delete basket[index];
        }
    }
    $("#totalPrice").html(total + "원");
    totalPrice = total;


}

function sendOrder() {
    var data = {
        restId: restId,
        tableNum: tableNum,
        total: totalPrice,
        basket: JSON.stringify(basket),
        customerToken: cusSub
    };
    postSend(data);
}

function post_to_url(path, params, method) {
    method = method || "post"; // Set method to post by default, if not specified.

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
}

function postSend(data){
    $.ajax({
        type: "POST"
        ,url: "/customer/order"
        ,data: data
        ,success:function(data){

        }
        ,error:function(data){
            alert("error");
        }
    });
}

