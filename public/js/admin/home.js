var name, email, photoUrl, uid, emailVerified;
var db = firebase.firestore();
var tableData = [];

function init() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;
            // User is signed in.
            // firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
            //     // Send token to your backend via HTTPS
            //     // ...
            // }).catch(function(error) {
            //     // Handle error
            // });
            restaurantList();
        } else {
            // No user is signed in.
            location.href='loginForm'
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

    // console.log("haha",rests.data());
    rests.get().then(function (querySnapshot) {
        // var tbody = document.createElement("tbody");
        querySnapshot.forEach(function (ref) {
            ref.data().restaurant.get().then(function (doc) {
                if (doc.exists) {
                    let object = {
                        name: doc.data().name,
                        table: doc.data().table,
                        takeout: doc.data().takeout ? "o" : "x",
                        serving: doc.data().serving ? "o" : "x"
                    }
                    tableData.push(object);//데이터 저장해놓기
                    var tr = document.createElement("tr");
                    for (index in object){
                        var td = document.createElement("td");
                        td.innerHTML = object[index];
                        tr.appendChild(td);
                    }

                    let tdEdit = document.createElement("td");
                    let EditButton = document.createElement("button");
                    EditButton.setAttribute("id", "editBtn");
                    EditButton.addEventListener('click', function(event){restaurantManage(doc.id)});
                    EditButton.innerHTML="수정";
                    tdEdit.appendChild(EditButton);
                    tr.appendChild(tdEdit);

                    let tdOper = document.createElement("td");
                    let OperateButton = document.createElement("button");
                    OperateButton.setAttribute("id", "mngBtn");
                    OperateButton.addEventListener('click', function(event){restaurantOperate(doc.id)});
                    OperateButton.innerHTML="운영하기";
                    tdOper.appendChild(OperateButton);
                    tr.appendChild(tdOper);

                    let tdDel = document.createElement("td");
                    let DeleteButton = document.createElement("button");
                    DeleteButton.setAttribute("id", "delBtn");
                    DeleteButton.addEventListener('click', function(event){restaurantDelete(doc.id)});
                    DeleteButton.innerHTML="삭제";
                    tdDel.appendChild(DeleteButton);
                    tr.appendChild(tdDel);

                    tableBody.append(tr);
                }else {
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
    var queryString = 'manage?id='+restId;
    location.href=queryString;
    // location.href='manage';
    // document.id.action="manage"
    // document.id.submit();

}

function restaurantDelete(restId) {

}

function restaurantOperate(restId){

}

function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}
