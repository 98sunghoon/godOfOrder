
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function () {
    init();
});

function init(){
    var fid = getParameterByName('id');
    $("#qrPanel").qrcode(location.host+"/customer/Fmenus?id=" + fid);
}
