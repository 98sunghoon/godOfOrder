var name, email, photoUrl, uid, emailVerified;
var db = firebase.firestore();

// var menuList = [];// menu = {name,price,soldout,description,price,imageFile}
var restId;
var menus;
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
    menuList();
}

window.onload = function () {
    init();
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });
}

// restRead
//파라미터에 id가 있을 경우 ( id로 firestore에서 메뉴 및 점포 정보를 가져와야함 )
//파라미터에 id가 null일 경우 ( 점포 새로 생성 )


function menuRead() {

}

function menuSave() {
    //attribute이지만 key로도 씀
    var name = $("input[name=input_menu_name]").val();
    var id = name.replace(/ /gi, "");
    console.log(id);
    var price = parseInt($("input[name=input_menu_price]").val());
    var description = $("input[name=input_menu_description]").val();

    var ref = menus.doc(id);
    var setWithMerge = ref.set({
        name: name,
        price: price,
        description: description
    },{ merge: true});

    if($("#"+id).length){
        //요소 있음 -> 수정
        $("#"+id+":td:eq(0)").innerText = name;
        $("#"+id+":td:eq(1)").innerText = price;
        $("#"+id+":td:eq(3)").innerText = description;

    }else{
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



    // ref.get().then(function(doc){
    //     if(doc.exist) {
    //         addMenu(doc);
    //     }else{
    //         console.log("없음");
    //     }
    // }).catch(function(error) {
    //     console.log("Error getting document:", error);
    // });
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



function docToObj(doc){
    let obj = {
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        description: doc.data().description,
        soldout: doc.data().soldout
    };
    return obj;
}

function addMenu(obj) {
    var tag = "";
    tag += "<tr id=\"" + obj.id + "\">\n";
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

function delMenu(name) {

    menus.doc(name).delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });

    $("#"+name).remove();
}

function parseDesc(str){
    if(str!=null){
        if(str.length>=10){
            return str.substring(0,7)+'...'
        }
        else{
            return str;
        }
    }else{
        return ""
    }
}
