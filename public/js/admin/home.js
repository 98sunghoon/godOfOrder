var db = firebase.firestore();
var tableData = [];
var uid;

function init() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            uid = user.uid;
            restaurantList();
        } else {
            // No user is signed in.
            location.href = 'loginForm'
        }
    });

}


window.onload = function () {
    init();
};


function kk() {
    // var myRef = db.collection("managers").doc(uid);
    // console.log(myRef)
    // myRef.set({
    //     name: "sunghoon"
    // })
}


function restaurantList() {
    //firestore에서 해당 uid로 가져온 뒤 테이블 그리기

    var rests = db.collection("managers").doc(uid).collection("rests");

    rests.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (ref) {
            console.log(ref);
            ref.data().restaurant.get().then(function (doc) {
                if (doc.exists) {
                    let object = {
                        name: doc.data().name,
                        table: doc.data().table,
                        takeout: doc.data().takeout ? "o" : "x",
                        serving: doc.data().serving ? "o" : "x"
                    };
                    tableData.push(object);//데이터 저장해놓기
                    var tr = document.createElement("tr");
                    tr.setAttribute("id", doc.id);
                    for (index in object) {
                        var td = document.createElement("td");
                        td.innerHTML = object[index];
                        tr.appendChild(td);
                    }

                    let tdEdit = document.createElement("td");
                    let EditButton = document.createElement("button");
                    EditButton.setAttribute("id", "editBtn");
                    EditButton.setAttribute("class", "btn btn-outline-dark");
                    EditButton.addEventListener('click', function (event) {
                        restaurantManage(doc.id)
                    });
                    EditButton.innerHTML = "수정";
                    tdEdit.appendChild(EditButton);
                    tr.appendChild(tdEdit);

                    let tdQrcode = document.createElement("td");
                    let QRButton = document.createElement("button");
                    QRButton.setAttribute("id", "qrBtn");
                    QRButton.setAttribute("class", "btn btn-outline-dark");
                    QRButton.addEventListener('click', function () {
                        window.open("/qr?id="+doc.id,"","width=1000, height=800, resizable=no, scrollbars=no, status=no;");
                    });
                    QRButton.innerHTML = "조회";
                    tdQrcode.appendChild(QRButton);
                    tr.appendChild(tdQrcode);

                    let tdOper = document.createElement("td");
                    let OperateButton = document.createElement("button");
                    OperateButton.setAttribute("id", "mngBtn");
                    OperateButton.setAttribute("class", "btn btn-outline-dark");
                    OperateButton.addEventListener('click', function (event) {
                        restaurantOperate(doc.id)
                    });
                    OperateButton.innerHTML = "운영하기";
                    tdOper.appendChild(OperateButton);
                    tr.appendChild(tdOper);

                    let tdDel = document.createElement("td");
                    let DeleteButton = document.createElement("button");
                    DeleteButton.setAttribute("id", "delBtn");
                    DeleteButton.setAttribute("class", "btn btn-outline-dark");
                    DeleteButton.addEventListener('click', function (event) {
                        restaurantDelete(doc.id)
                    });
                    DeleteButton.innerHTML = "삭제";
                    tdDel.appendChild(DeleteButton);
                    tr.appendChild(tdDel);

                    tableBody.append(tr);
                } else {
                    console.log("nonono");
                }
            });
        });
        //모든 행(점포 정보)를 가져오고 테이블을 만듬


    })
        .catch(function (error) {
            console.log("error : ", error);
        })
}

function restaurantManage(restId) {
    //null이면 새로생성
    //id있으면 수정
    if (restId != null) {
        var queryString = 'manage?id=' + restId;
        location.href = queryString;
    } else {
        var newRest = db.collection("restaurants").doc();
        var manager = db.collection("managers").doc(uid);
        newRest.set({
            manager: manager,
            sales:{"19000001":0},
            revenue:{"19000001":0},
            foodcourt:0
        }).then(function () {
            console.log(newRest);
            var queryString = 'manage?id=' + newRest.id;
            manager.collection("rests").doc(newRest.id).set({
                restaurant: newRest
            }).then(function () {
                location.href = queryString
            });
        });
    }

}

function restaurantDelete(restId) {
    let restaurant = db.collection('restaurants').doc(restId);
    db.collection('managers').doc(uid).collection("rests").doc(restId).delete()
        .then(function () {
            console.log("1 successfully deleted!");
        }).catch(function (error) {
        console.error("Error removing document: ", error);
    });

    db.collection('restaurants').doc(restId).delete()
        .then(function () {
            console.log("2 successfully deleted!");
        }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
    $("#" + restId).remove();
}

function restaurantOperate(restId) {
    var queryString = 'operate?id=' + restId;
    location.href = queryString;
}

function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });
}
