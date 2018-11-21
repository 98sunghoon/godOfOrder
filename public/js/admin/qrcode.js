// http://localhost:5000/customer/menus?id=restId&table=-1
db = firebase.firestore();
var takeout, table, restId;

var qrlist = [];

function makeQRtable() {
    var tag = "";

    for (var i = 0; i < qrlist.length; i = i + 4) {
        tag += "<tr>\n";
        for (let j = i; j < i + 4 && j < qrlist.length; j++) {
            tag += thMake(qrlist[j]);
        }
        tag += "</tr>\n<tr>";
        for (let j = i; j < i + 4 && (j < qrlist.length); j++) {
            tag += "<td><div id=\"td" + j + "\"></div></td>";
            console.log("j", j);
        }
        tag += "</tr>";
    }

    $("#qrTable").append(tag);
    for (let i = 0; i < qrlist.length; i++) {
        //디버그 모드
        // $("#td" + i).qrcode("localhost/customer/menus?id=" + restId + "&table=" + qrlist[i]);
        $("#td" + i).qrcode(location.host+"/customer/menus?id=" + restId + "&table=" + qrlist[i]);
        //릴리즈 모드
        // $("#td" + i).qrcode("godoforder-74975.firebaseapp.com/customer/menus?id=" + restId + "&table=" + qrlist[i]);
    }
}

function thMake(val) {
    let tag = "<th>";
    if (val == -1) {
        tag += "포장";
    } else if (val == 0) {
        tag += "매장식사";
    } else {
        tag += "" + val + "번 테이블";
    }
    tag += "</th>";
    return tag;
}

$(document).ready(function () {
    infoLoad();
});

function infoLoad() {
    restId = getParameterByName('id');
    console.log("id",restId);
    db.collection("restaurants").doc(restId).get().then(function (doc) {
        table = doc.data().table;
        takeout = doc.data().takeout;
        if (takeout) {
            qrlist.push(-1);
        }
        if (table!=0){
            for (let i = 0; i < table; i++) {
                qrlist.push(i+1);
            }
        }else{
            qrlist.push(0);
        }
        makeQRtable();
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
