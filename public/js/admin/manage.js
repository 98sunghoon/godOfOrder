var db = firebase.firestore();
var storage = firebase.storage();
var storageRef = storage.ref();
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
    table = Number(table);
    if ($("input[name=input_serving]").prop("checked") && table == 0) {
        alert("테이블 수는 반드시 입력해야 합니다!");
        return;
    }
    var takeout = $("input[name=input_takeout]").prop("checked");
    var serving = $("input[name=input_serving]").prop("checked");


    if (restId != "") {//점포 수정
        console.log(restId);
        var setWithMerge = restaurants.doc(restId).set({
            // manager: manager,
            name: name,
            table: table,
            takeout: takeout,
            serving: serving
        }, {merge: true}).then(function () {
            //메뉴 soldout 정보 push/ then 이동
            location.href = 'home'
        });
        // restId=restaurants.doc();


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
    var imgURL;

    var arae = document.getElementById('profile_pt').files;
    var img = arae[0];

    if (img) {
        //사진 업로드
        var imageRef = storageRef.child('images/' + restId + '/' + id + ".png");
        var metadata = {
            contentType: 'image/png',
        };
        var uploadTask = imageRef.put(img, metadata);
        uploadTask.on('state_changed', function (snapshot) {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }
        }, function (error) {
            // Handle unsuccessful uploads
        }, function () {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                imgURL = downloadURL;
                //업로드 후
                var ref = menus.doc(id);
                var setWithMerge = ref.set({
                    name: name,
                    price: price,
                    description: description,
                    image: imgURL
                }, {merge: true});

                if ($("#" + id).length) {
                    $("#" + id).remove();
                }
                let tmpDoc = {
                    id: name.replace(/ /gi, ""),
                    name: name,
                    price: price,
                    description: description,
                    // image: imgURL
                }
                addMenu(tmpDoc);
                resetMenuInfo();
            });
        });
    }else{
        var ref = menus.doc(id);
        var setWithMerge = ref.set({
            name: name,
            price: price,
            description: description,
        }, {merge: true});

        if ($("#" + id).length) {
            $("#" + id).remove();
        }
        let tmpDoc = {
            id: name.replace(/ /gi, ""),
            name: name,
            price: price,
            description: description,
        }
        addMenu(tmpDoc);
        resetMenuInfo();
    }
    // console.log("image link : ", imageRef);

    //db에 저장

}

function resetMenuInfo() {
    $("input[name=input_menu_name]").val("");
    $("input[name=input_menu_price]").val(0);
    $("input[name=input_menu_description]").val("");
    //이미지 지우기 (storage)
    var preview = document.getElementById("View_area");
    var prevImg = document.getElementById("prev_" + "View_area");
    if (prevImg) {
        preview.removeChild(prevImg);
    }
}

function menuRead(id) {
    menus.doc(id).get().then(function (doc) {
        if (doc.exists) {
            $("input[name=input_menu_name]").val(doc.data().name);
            $("input[name=input_menu_price]").val(doc.data().price);
            $("input[name=input_menu_description]").val(doc.data().description);
            //이미지 불러오기 (storage)
            var preview = document.getElementById("View_area"); //div id
            var prevImg = document.getElementById("prev_" + "View_area"); //이전에 미리보기가 있다면 삭제
            if (prevImg) {
                preview.removeChild(prevImg);
            }
            var img = document.createElement("img");
            img.id = "prev_View_area";
            img.classList.add("obj");
            img.src = doc.data().image;
            img.style.width = '200px';
            img.style.height = '200px';
            preview.appendChild(img);
            // $("#View_area").setAttribute("src",doc.data().image);
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
    tag += "<input type=\"button\" class=\"btn btn-outline-dark\" style=\"height:min-content;\" onclick=delMenu(\"" + obj.id + "\") />\n";
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

function foodcourt(){
    var popUrl = "/manage/foodcourt?id="+restId;
    var popOption = "width=400, height=500, resizable=no, scrollbars=no, status=no;";
    window.open(popUrl,"",popOption);
}

window.onload = function () {
    init();
};
