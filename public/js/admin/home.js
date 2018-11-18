
var name, email, photoUrl, uid, emailVerified;
var db = firebase.firestore();;

function init(){
    firebase.auth().onAuthStateChanged(function(user) {
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
        }
    });

}


window.onload = function() {
    init();
};


function kk() {
    // var myRef = db.collection("managers").doc(uid);
    // console.log(myRef)
    // myRef.set({
    //     name: "sunghoon"
    // })
}



function restaurantList(){
    //firestore에서 해당 uid로 가져온 뒤 테이블 그리기

    var rests = db.collection("managers").doc(uid).collection("rests");

    // console.log("haha",rests.data());
    rests.get().then(function(querySnapshot){
        querySnapshot.forEach(function(ref){
            console.log(ref.id ,",",ref.data());
            ref.data().restaurant.get().then(function(doc){
                if(doc.exists){
                    console.log("doc data : ", doc.data().name);
                }else{
                    console.log("nononon");
                }
            })
        });
    })
    .catch(function(error){
        console.log("error : ",error);
    })
}




function restaurantManage(){

}
function restaurantDelete(){

}


function logout(){

}
