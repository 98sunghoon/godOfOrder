window.onload = function () {



};


function qrcode(){
    if($("#titleBar").data("fid")==""){
        alert("참여중인 모임이 없습니다.")
    }else{
        var popUrl = "/manage/foodcourt/qr?id="+$("#titleBar").data("fid");
        var popOption = "width=600, height=500, resizable=no, scrollbars=no, status=no;";
        window.open(popUrl,"",popOption);
    }

}

function invite(){
    var RID = prompt('초대하려는 점포의 코드를 입력하세요','');
    var data = {
        targetRID:RID,
        myRID:$("#titleBar").data("id")
    };
    postSend(data,"/manage/foodcourt/invite", function(response){
        console.log(response);
    });

}



function expel(id){
    var data = {
        targetRID:id,
        myRID:$("#titleBar").data("id")
    };
    postSend(data,"/manage/foodcourt/quit", function(response){
        console.log(response);
    });
}

function quit(){
    var data = {
        myRID:$("#titleBar").data("id")
    };
    postSend(data,"/manage/foodcourt/quit", function(response){
        console.log(response);
    });

    self.close();
}

function postSend(data,url) {
    $.ajax({
        type: "POST"
        , url: url
        , data: data
        , success: function (res) {
            window.location.reload();
        }
        , error: function (data) {
            alert("error");
        }
    });
}
