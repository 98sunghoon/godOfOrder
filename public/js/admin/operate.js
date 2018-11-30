var db = firebase.firestore();
const messaging = firebase.messaging();
var restId = getParameterByName('id');

messaging.usePublicVapidKey('BCOh-JjtoWudxg1aLz0yC3CxZV6LtaL3UkAMy6GvvJ2-qY-EvO61E4yhS_veTvWZ1grkJTQOOlTf7GXqfZBcVIc');
messaging.onTokenRefresh(function () {
    messaging.getToken().then(function (refreshedToken) {
        console.log('Token refreshed.');
        sendTockenToMyServer();
    }).catch(function (err) {
        console.log('Unable to retrieve refreshed token ', err);
        //홈으로
    });
});
messaging.onMessage(function (payload) {
    console.log('Message received. ', payload);
    getOrder(payload.data.orderId);
});

function readyToGetOrder() {
    messaging.requestPermission().then(function () {
        messaging.getToken().then(function (currentToken) {
            sendTokenToMyServer(currentToken);
        })
    }).catch(function (error) {
        console.log("fail to get permission //info : ", error);
        //홈으로
    })
}

function sendTokenToMyServer(currentToken) {
    console.log(restId);
    console.log(currentToken);
    db.collection("restaurants").doc(restId).set({
        token: currentToken
    }, {merge: true});
}

//trigger from push message
function getOrder(orderId) {
    //load from db
    //transaction[get todaySales -> get orderInfo + assignOrderNum -> set orderNum ]
    var orderRef = db.collection("restaurants").doc(restId).collection("orders").doc(orderId);
    var restRef = db.collection("restaurants").doc(restId);
    var sales, todaysales;
    var today = getToday();
    db.runTransaction(function (transaction) {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(restRef).then(function (rest) {
            sales = rest.data().sales;
            today = getToday();
            todaysales;
            //get and update todaysales
            if (!sales.hasOwnProperty(today)) {//오늘의 첫주문
                todaysales = 0;
                sales[today] = 1;
                transaction.update(restRef, {sales: sales});
            } else {
                todaysales = sales[today];
                sales[today]++;
                transaction.update(restRef, {sales: sales});
            }
        });
    }).then(function () {
        db.runTransaction(function (transaction) {
            //get orderInfo, assignOrderNum, set orderNum
            return transaction.get(orderRef).then(function (order) {
                console.log("tableNum:", order.data().tableNum);
                var assignedOrderNum = 0;
                if (order.data().tableNum == 0) {
                    assignedOrderNum = 1000 + (todaysales % 4000);
                } else if (order.data().tableNum == -1) {
                    assignedOrderNum = 5000 + (todaysales % 4000);
                } else {
                    assignedOrderNum = order.data().tableNum;
                }
                transaction.set(orderRef, {orderNum: assignedOrderNum}, {merge: true});
                addOrderToOrderTable({orderId: order.id, orderNum: assignedOrderNum, basket: order.data().basket});
                console.log("order number successfully assigned!");
            }).catch(function (error) {
                console.log("error while setting order... info : ", error)
            });
        }).then(function () {
        }).catch(function (error) {
            console.log("error", error);
        });
    }).catch(function (error) {
        console.log("Transaction failed: ", error);
    });


}

//trigger from initialization
function orderList() {
    //onload
    var d = new Date();
    var todaystart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    console.log(d);
    console.log(todaystart);
    var restRef = db.collection("restaurants").doc(restId);
    restRef.collection("orders").where("time", ">", todaystart).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (order) {
            if (order.data().complete) {//처리된 정보
                addOrderToCompleteTable({
                    orderId: order.id,
                    time: order.data().time,
                    basket: order.data().basket,
                    total: order.data().total
                })
            } else {
                addOrderToOrderTable({
                    orderId: order.id,
                    orderNum: order.data().orderNum,
                    basket: order.data().basket,
                })
            }
        })
    }).catch(function (error) {
        console.log("invalid ref.. info:", error)
    });
    updateTotal(0);

}

//draw one order to ordertable      //orderId, orderNum, basket
function addOrderToOrderTable(obj) {
    var menuKeys = Object.keys(obj.basket);
    console.log(menuKeys);
    var basket = obj.basket;
    var tag = "";
    // tag += "<tr id=\"" + obj.orderId + "\">";
    for (let i = 0; i < menuKeys.length; i++) {
        tag += "<tr id=\"" + obj.orderId + "\">";
        if (i == 0) {
            tag += "<td rowspan=\"" + menuKeys.length + "\">" + obj.orderNum + "</td>";
        }
        tag += "<td>" + menuKeys[i] + "</td>";
        tag += "<td>" + basket[menuKeys[i]] + "</td>";
        if (i == 0) {
            tag += "<td rowspan=\"" + menuKeys.length + "\">";
            tag += "<button type=\"button\"  class=\"btn btn-outline-dark\" onclick=orderComplete(\"" + obj.orderId + "\")> 완료</button>";
            tag += "</td>";
        }
        tag += "</tr>";

    }
    // tag += "</tr>";
    $("#orderTable").append(tag);
}

//draw one complete order to complete table         //orderId, time, basket, total
function addOrderToCompleteTable(obj) {
    var menuKeys = Object.keys(obj.basket);
    var basket = obj.basket;
    var timeInfo = "" + obj.time.getHours() + ":" + obj.time.getMinutes() + ":" + obj.time.getSeconds() + "";
    var tag = "";
    tag += "<tr id=\"" + obj.orderId + "\">";
    tag += "<td>" + timeInfo + "</td>";
    tag += "<td>";
    var menuString = "";
    for (menus in basket) {
        menuString += menus + basket[menus] + ",";
    }
    tag += menuString;
    tag += "</td>"
    tag += "<td>" + obj.total + "</td>";
    tag += "</tr>";
    console.log(tag);
    $("#receiptTable").append(tag);
}

//change complete value of order, post send to server, remove and draw again
function orderComplete(orderId) {
    //서버에게 푸시 알람 요청
    // var orderRef = db.collection("restaurants").doc(restId).collection("orders").dor(orderId);
    console.log("complete message is sending now...");
    //post payload
    let data = {
        restId: restId,
        orderId: orderId,
    };
    // if (post_to_url('', data)) {
    //     console.log("complete");
    // }
    //
    postSend(data);
    //orderTable에서 삭제 후 today 기록으로 넘어감
    // $("#" + orderId).remove();
    db.collection("restaurants").doc(restId).collection("orders").doc(orderId).get().then(function (order) {
        addOrderToCompleteTable({
            orderId: order.id,
            orderNum: order.data().orderNum,
            time: order.data().time,
            basket: order.data().basket,
            total: order.data().total
        })
        updateTotal(order.data().total);
    });
    //db 변경
    db.collection("restaurants").doc(restId).collection("orders").doc(orderId).update({
        complete: true
    });

    window.location.reload();
}

//trigger when order complete
function updateTotal(totalOfOrder) {
    var restRef = db.collection("restaurants").doc(restId);
    db.runTransaction(function (transaction) {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(restRef).then(function (rest) {
            revenue = rest.data().revenue;
            today = getToday();
            //get and update todaysales
            if (!revenue.hasOwnProperty(today)) {//오늘의 첫주문
                revenue[today] = totalOfOrder;
                transaction.update(restRef, {revenue: revenue});
                console.log(totalOfOrder);
                $("#total").innerHTML=totalOfOrder;
            } else {
                console.log(revenue[today]);
                revenue[today] += totalOfOrder;
                transaction.update(restRef, {revenue: revenue});
                $("#total").innerHTML=revenue[today]+"원";
            }
        });
    })
}


window.onload = function () {
    init();
    readyToGetOrder();
    orderList();
};

function init() {
    //authorize
    // console.log()
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
        } else {
            // No user is signed in.
            location.href = 'loginForm'
        }
    });
    console.log("init");

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

function getToday() {
    let d = new Date();
    let date = "" + d.getFullYear() + d.getMonth() + d.getDate();
    return date;
}

function post_to_url(path, params, method) {
    method = method || "post"; // Set method to post by default, if not specified.

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("target", "iframe");
    for (var key in params) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
    }
    // form.onsubmit = handleSubmit(event);
    document.body.appendChild(form);
    form.submit();
}

function postSend(data) {
    $.ajax({
        type: "POST"
        , url: "/operate"
        , data: data
        , success: function (data) {

        }
        , error: function (data) {

        }
    });
}

function handleSubmit(event) {
    console.log("waiting...")
    // event.preventDefault();
    return false;
};


