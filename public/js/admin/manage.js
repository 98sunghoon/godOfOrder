var db = firebase.firestore();
var restId;
var menus;
var restaurants;
var name, email, photoUrl, uid, emailVerified;//추후 삭제할 것

function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });
}

function restRead() {
    if (restId != "") {
        restaurants = db.collection("restaurants");
        restaurants.doc(restId).get().then(function (doc) {
            if (doc.exists) {
                console.log("restInfo reading...", doc.data().name);
                $("input[name=input_name]").val(doc.data().name);
                $("input[name=input_table]").val(doc.data().table);
                $("input[name=input_takeout]").prop("checked", doc.data().takeout);
                $("input[name=input_serving]").prop("checked", doc.data().serving);
                setDisabled();
            } else {
                console.log("nonono");
            }
            // collection("menus");
        });
        menuList();
    } else {
        console.log("make new rest")
    }
    setDisabled();
}

function restSave() {
    var name = $("input[name=input_name]").val();
    if (blackChk(name)) {
        alert("점포 이름은 반드시 입력해야 합니다!");
        return;
    }
    var table = $("input[name=input_table]").val();
    if ($("input[name=input_serving]").prop("checked") && table == 0) {
        alert("테이블 수는 반드시 입력해야 합니다!");
        return;
    }
    var takeout = $("input[name=input_takeout]").prop("checked");
    var serving = $("input[name=input_serving]").prop("checked");
    console.log(table);
    console.log(serving);

    var manager = db.collection("managers").doc(uid);
    if (restId != "") {//점포 수정
        var setWithMerge = restaurants.doc(restId).set({
            manager: manager,
            name: name,
            table: table,
            takeout: takeout,
            serving: serving
        }, {merge: true});
        // restId=restaurants.doc();

        window.open('/qr?id=' + restId,"QRcode");
        location.href = 'home'
    }
    // } else {//점포 새로 생성
    //     var newRest = db.collection("restaurants").doc();
    //     newRest.set({
    //         manager: manager,
    //         name: name,
    //         table: table,
    //         takeout: takeout,
    //         serving: serving
    //     });
    //
    //     manager.collection("rests").add({
    //         restaurant: newRest
    //     }).then(function () {
    //         window.open('/qr?'+newRest.id);
    //         location.href = 'home'
    //     });
    // }

    //메뉴 soldout 입력
}

function menuSave() {
    //attribute이지만 key로도 씀
    var name = $("input[name=input_menu_name]").val();
    if (blackChk(name)) {
        alert("메뉴 이름은 반드시 입력해야 합니다!");
        return
    }
    var id = name.replace(/ /gi, "");

    var price = parseInt($("input[name=input_menu_price]").val());
    if (price == 0) {
        alert("가격은 반드시 입력해야 합니다!");
        return
    }
    var description = $("input[name=input_menu_description]").val();

    var ref = menus.doc(id);
    var setWithMerge = ref.set({
        name: name,
        price: price,
        description: description
    }, {merge: true});

    if ($("#" + id).length) {
        // //요소 있음 -> 수정
        // $("#"+id).children().eq(0).innerText = name;
        // $("#"+id).children().eq(1).innerText = price;
        // $("#"+id).children().eq(3).innerText = description;

        $("#" + id).remove();

    }
    let tmpDoc = {
        id: name.replace(/ /gi, ""),
        // data:  {
        //     name: name,
        //     price: price,
        //     description: description
        // }
        name: name,
        price: price,
        description: description
    }
    addMenu(tmpDoc);
}

function menuRead(id) {
    menus.doc(id).get().then(function (doc) {
        if (doc.exists) {
            $("input[name=input_menu_name]").val(doc.data().name);
            $("input[name=input_menu_price]").val(doc.data().price);
            $("input[name=input_menu_description]").val(doc.data().description);

        } else {
            console.log("nonono");
        }
    });
}

function menuList() {
    //읽어서 addMenu()
    menus = db.collection("restaurants").doc(restId).collection("menus");

    menus.get().then(function (querySnapshot) {
        querySnapshot.forEach(
            function (doc) {
                if (doc.exists) {
                    addMenu(docToObj(doc));
                } else {
                    console.log("nonono");
                }
            });
    });
}

function addMenu(obj) {
    var tag = "";
    tag += "<tr id=\"" + obj.id + "\" onclick=menuRead(this.id)>\n";
    tag += "<td>\n" + obj.name;
    tag += "</td>\n";

    tag += "<td align='right'>\n" + obj.price + "원";
    tag += "</td>\n";

    tag += "<td>\n";
    tag += "<input type=\"checkbox\" " + (obj.soldout ? "checked" : "") + ">\n";
    tag += "</td>\n";

    tag += "<td>\n" + parseDesc(obj.description);
    tag += "</td>\n";

    tag += "<td>\n";
    tag += "<input type=\"button\" onclick=delMenu(\"" + obj.id + "\") />\n";
    tag += "</td>\n";

    tag += "</tr>\n";

    // $("#"+obj).append(tag);

    $("#menuTable").append(tag);
    //list에 추가(데이터)
}

function delMenu(id) {

    menus.doc(id).delete().then(function () {
        console.log("Document successfully deleted!");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });

    $("#" + id).remove();
}

function setDisabled() {
    if ($("input[name=input_serving]").is(":checked")) {
        $("input[name=input_table]").attr('disabled', false);
    } else {
        $("input[name=input_table]").attr('disabled', true);
    }

    $(document).ready(function () {
        $("input[name=input_serving]").change(function () {
            if ($("input[name=input_serving]").prop("checked")) {
                $("input[name=input_table]").attr('disabled', false);
            } else {
                $("input[name=input_table]").val(0);
                $("input[name=input_table]").attr('disabled', true);
            }
        });
    });
}

function blackChk(str) {
    var blank_pattern = /^\s+|\s+$/g;
    if (str.replace(blank_pattern, '') == "") {
        return true;
    } else {
        return false;
    }
}

function docToObj(doc) {
    let obj = {
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        description: doc.data().description,
        soldout: doc.data().soldout
    };
    return obj;
}

function parseDesc(str) {
    if (str != null) {
        if (str.length >= 10) {
            return str.substring(0, 7) + '...'
        }
        else {
            return str;
        }
    } else {
        return ""
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function init() {
    //authorize
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;

            // console.log(id);
        } else {
            // No user is signed in.
            location.href = 'loginForm'
        }
    });

    restId = getParameterByName('id');


    console.log(restId);
    restRead();
}

window.onload = function () {
    init();
};
