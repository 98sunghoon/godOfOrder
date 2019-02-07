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
function refreshToken(){
    if(orderId!=null){
        //앱서버에게 토큰 새로고침 요청
    }
}

var db = firebase.firestore();

var restId;
var tableNum;

var totalPrice = 0;
var basket = {};
var priceInfo = {};
var menuInfo = [];
var orderId,orderNum;

window.onload = function () {
    init();
    var IMP = window.IMP; // 생략가능
    IMP.init('imp30817358');
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
    tag += "<div  id=\"" + obj.id + "\" onclick=selectMenu(\"" + obj.id + "\")>";
    // console.log("id", obj.id);
    tag += "<div style=\"height:550px;\" id=\"menu\"> <img src=\"" + obj.image + "\" id=\"pic\" style=\"height:300px\">";
    tag += "<div>";
    tag += " <ul>";
    tag += "<li >" + obj.name + "</li>";//id="name"
    tag += "<li id=\"info\">" + obj.detail + "</li>";
    tag += "<li style=\"\">" + obj.price + "원</li>";//id="price"
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
    updateTotal();
}

function addMenuToList(menuId) {
    var ob = menuInfo.find(c => c.id === menuId);
    // var ob = menuInfo[0];
    // 가격정보 여기서 저장
    priceInfo[menuId]=ob.price;

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
    tag += "<input type=\"text\" disabled=\"true\" name=\"amount\" value=" + basket[menuId] + " size=\"3\" style=\"text-align: center\">";
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
    messaging.requestPermission().then(function () {
        messaging.getToken().then(function (currentToken) {
            var data = {
                restId: restId,
                tableNum: tableNum,
                total: totalPrice,
                basket: JSON.stringify(basket),
                priceInfo: JSON.stringify(priceInfo),
                customerToken: currentToken
            };
            console.log(typeof(totalPrice));
            IMP.request_pay({
                pg : 'kakaopay', // version 1.1.0부터 지원.
                pay_method : 'card',
                merchant_uid : 'merchant_' + new Date().getTime(),
                name : '주문명:결제테스트',
                amount : totalPrice,
                buyer_email : 'iamport@siot.do',
                buyer_name : '구매자이름',
                buyer_tel : '010-1234-5678',
                buyer_addr : '서울특별시 강남구 삼성동',
                buyer_postcode : '123-456',
                m_redirect_url : '/customer/payment'
            }, function(rsp) {
                if ( rsp.success ) {
                    // alert("changed!");
                    postSend(data);
                } else {
                    alert("fail!!");
                    var msg = '결제에 실패하였습니다.';
                    msg += '에러내용 : ' + rsp.error_msg;
                }
                // alert(msg);
            });

            // postSend(data);

        })
    }).catch(function (error) {
        console.log("fail to get permission //info : ", error);
        //홈으로
    });
}

function payment(){

}

function postSend(data) {
    $.ajax({
        type: "POST"
        , url: "/customer/order"
        , data: data
        , success: function (res) {
            if(res==199){
                alert("영업이 종료되었습니다. 사장님께 문의하세요.")
            }else{
                orderId = res;
                location.href='receipt?id='+orderId+"&rest="+restId;
            }

        }
        , error: function (data) {
            alert("error");
        }
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
    // form.onsubmit = handleSubmit(event);
    document.body.appendChild(form);
    form.submit();
}

