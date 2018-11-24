var db = firebase.firestore();
const messaging = firebase.messaging();
messaging.usePublicVapidKey('BCOh-JjtoWudxg1aLz0yC3CxZV6LtaL3UkAMy6GvvJ2-qY-EvO61E4yhS_veTvWZ1grkJTQOOlTf7GXqfZBcVIc');
messaging.onTokenRefresh(function() {
    messaging.getToken().then(function(refreshedToken) {
        //orderId로 customerToken 수정
    }).catch(function(err) {
    });
});
messaging.onMessage(function(payload) {
    console.log('Message received. ', payload);
});

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
                let obj = {
                    'id': doc.id,
                    'name': doc.data().name,
                    'detail': doc.data().description,
                    'price': doc.data().price,
                    "image": doc.data().image,
                };
                if (obj.image) {
                    drawImageMenu(obj);
                } else {
                    drawTableMenu(obj);
                }
                menuInfo.push(obj);
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
    let obj = menuInfo.find(c => c.id === menuId);
    var tag = "";
    tag += "<tr id=\"s" + menuId + "\">";
    tag += "<td>";
    tag += "<button type=\"button\" class=\"btn btn-outline-dark\" id=\"x\" onclick=deleteMenu(\"" + menuId + "\")>x</button>";
    tag += "</td>";
    // console.log("name",$("#"+menuId).children('#name').innerHTML);
    // const findArr = [{name:"lemon", age:17}, {name:"candy", age:27}];
    // {name:"candy", age:27}
    tag += "<td>" + obj.name + "</td>";
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
    for (index in basket) {//index=menuId , basket[index]=amount
        let obj = menuInfo.find(c => c.id === index);
        // console.log("type of price : ",typeof(obj.price));
        total += obj.price * basket[index];

        if (basket[index] == 0) {
            delete basket[index];
        }
    }
    $("#totalPrice").html(total + "원");
    totalPrice = total;


}





function sendOrder() {
    messaging.requestPermission().then(function(){
        messaging.getToken().then(function(currentToken){
            console.log("order is sending now...");
            //post payload
            let data = {
                restId: restId,
                tableNum: tableNum,
                total: totalPrice,
                basket: JSON.stringify(basket),
                customerToken: currentToken
            };
            post_to_url('order',data);
        }).catch(function(error){
           console.log("error in get customer token.. info:",error);
        });
    });
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
