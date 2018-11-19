var name, email, photoUrl, uid, emailVerified;
var db = firebase.firestore();

var menuList = [];// menu = {name,price,soldout,description,price,imageFile}
var restaurantInfo;

function init(){
    //authorize
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;


            // console.log(id);
        } else {
            // No user is signed in.
            location.href='loginForm'
        }
    });

    var abc = getParameterByName('id');
    console.log(abc);
}
window.onload = function() {
    init();
};
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}


function loadData(){
    //파라미터에 id가 있을 경우 ( id로 firestore에서 메뉴 및 점포 정보를 가져와야함 )

    //파라미터에 id가 null일 경우 ( 점포 새로 생성 )
}

function saveData(){

}

function createMenu(){
    let obj = {
        name : $("input[name=input_name]").attr(value)
    }
}

// var index=0;
function addMenu(){
    //유효성 검사
    //같은 이름이 있으면 수정, 없으면 생성

    var name = $("input[name='input_menu_name']").val();
    var price = $("input[name='input_menu_price']").val();
    var description = $("input[name='input_menu_description']").val();


    var tag= "";
    tag +="<tr id=\"tr" + name +"\">\n";
    tag +="<td>\n"+name;
    tag +="</td>\n";

    tag +="<td>\n"+price;
    tag +="</td>\n";

    tag +="<td>\n";
    tag +="<input type=\"checkbox\" />\n";
    tag +="</td>\n";

    tag +="<td>\n"+description;
    tag +="</td>\n";

    tag +="<td>\n";
    tag +="<input type=\"button\" onclick=delMenu("+name+")/>\n";
    tag +="</td>\n";

    tag +="</tr>\n";

    // $("#"+obj).append(tag);

    $("#menuTable").append(tag);
    //list에 추가(데이터)
}


function delMenu(trId) {
    console.log(trId);
    $("#tr"+trId).remove();
}
