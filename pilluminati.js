var dimensions = new Array();
var initImage;

function isUrlValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

function initCropper(){
    var $image = $('#image');
    $image.cropper({
        aspectRatio: 1 / 1,
        checkCrossOrigin: false,
        rotatable: false,
        scalable: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        movable: false,
        zoomable: false,
        viewMode: 1,
        crop: function(event) {
            dimensions = [event.detail.y, event.detail.x, event.detail.width];
        },
        ready: function() {
            initImage = setTimeout(function(){
                imgDada = $image.cropper('getImageData');
                w = imgDada.width;
                h = imgDada.height;
                if(w > h){
                    shortestSide = h
                    leftCenter = w/2 - h/2;
                    topCenter = 0
                } else {
                    shortestSide = w
                    leftCenter = 0;
                    topCenter = h/2 - w/2;
                }
                $image.cropper('setCropBoxData', {
                    top: topCenter,
                    left: leftCenter,
                    width: shortestSide,
                    height: shortestSide
                });
            }, 200);
        }
    });
    $('.actions').show();
    $('#submit').click(function(){
        $(this).prop('disable', true).addClass('disabled').text('Searching...');
        $.post('.', {
            i: $image.attr('src'),
            top: dimensions[0],
            left: dimensions[1],
            size: dimensions[2]
        }).done(function(data){
            $('.actions').html('<button id="new">Find from another image</button>');
            $('.cropper').html('<img id="result" src="data:image/jpeg;base64,' + data + '" />');
            $('#new').click(function(){
                location.reload();
            });
        });
    });
}

function retrieveImageFromClipboardAsBase64(pasteEvent, callback, imageFormat){
    if(pasteEvent.clipboardData == false){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };
    var items = pasteEvent.clipboardData.items;
    if(items == undefined){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") == -1) continue;
        var blob = items[i].getAsFile();
        var mycanvas = document.createElement("canvas");
        var ctx = mycanvas.getContext('2d');
        var img = new Image();
        img.onload = function(){
            mycanvas.width = this.width;
            mycanvas.height = this.height;
            ctx.drawImage(img, 0, 0);
            if(typeof(callback) == "function"){
                callback(mycanvas.toDataURL(
                    (imageFormat || "image/png")
                ));
            }
        };
        var URLObj = window.URL || window.webkitURL;
        img.src = URLObj.createObjectURL(blob);
    }
}

window.addEventListener("paste", function(e){
    retrieveImageFromClipboardAsBase64(e, function(imageDataBase64){
        if(imageDataBase64){
            $('.cropper').html('<img id="image" src="'+imageDataBase64+'"/>');
            initCropper();
        }
    });
}, false);

$(document).ready(function(){
    $('#imgUrl').change(function(){
        var url = $(this).val();
        if(isUrlValid(url)){
            $('.cropper').html('<img id="image" src="'+url+'"/>');
            initCropper();
        }
    });
});
