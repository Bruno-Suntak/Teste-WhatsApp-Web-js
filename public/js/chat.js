$(document).ready(function(){  
    var socket = io("http://localhost:3010");

	$("#textarea").keypress(function(e){
        if(e.which == 13) {
        	var text = $("#textarea").val();
        	$("#textarea").val('');
        	var time = new Date();
            $(".chat").append('<li class="self"><div class="msg"><span>' + "Eu" + ':</span><p>' + text + '</p><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            
            let contadoSelecionado = $('[selected=selected]').val();

            socket.emit("reqSendMessage", text, contadoSelecionado);

            // automatically scroll down
            document.getElementById('bottom').scrollIntoView();
        }
    });

    socket.on("searchMessage", function(chat, contatoNome, isMedia, mediaType) {

        var time = new Date();

        if(isMedia == true && mediaType == "video/mp4"){

            if(chat.fromMe == true){
                $(".chat").append('<li class="self" style="padding-left:350px;"><div class="msg" style="padding-right:-350px"><span>' + "Eu" + ':</span><video controls><source src=data:'+mediaType+';base64,'+chat+'></video><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }else{
                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><video controls><source type='+mediaType+' src=data:'+mediaType+';base64,'+chat+'></video><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }
        }else if(isMedia == true && (mediaType == "image/jpeg" || mediaType == "image/png" || mediaType == "image/webp") ){
            if(chat.fromMe == true){
                $(".chat").append('<li class="self" style="padding-left:350px;"><div class="msg" style="padding-right:-350px"><span>' + "Eu" + ':</span><img type='+mediaType+' src=data:'+mediaType+';base64,'+chat+' /><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }else{
                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><img type='+mediaType+' src=data:'+mediaType+';base64,'+chat+' /><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }
        }else if(isMedia == true && mediaType == "audio/ogg; codecs=opus"){
            if(chat.fromMe == true){
                $(".chat").append('<li class="self" style="padding-left:350px;"><div class="msg" style="padding-right:-350px"><span>' + "Eu" + ':</span><audio controls type=audio/ogg src=data:audio/ogg;base64,'+chat+' /><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }else{
                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><audio controls><source type=audio/ogg src=data:audio/ogg;base64,'+chat+'></audio><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }
        }else{

            if(chat.fromMe == true){
                $(".chat").append('<li class="self" style="padding-left:350px;"><div class="msg" style="padding-right:-350px"><span>' + "Eu" + ':</span><p>' + chat.body + '</p><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }else{
                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><p>' + chat.body + '</p><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
            }

        }

        
            

    });

    socket.on("recivedMessage", function(msg, contato, contatoNome, mediaType, isMedia) {
        var time = new Date();

        let contadoSelecionado = $('[selected=selected]').val();

        if(contadoSelecionado == contato){

            if(isMedia == true && mediaType == "video/mp4"){

                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><video controls><source type='+mediaType+' src=data:'+mediaType+';base64,'+msg+'></video><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');

            }else if(isMedia == true && (mediaType == "image/jpeg" || mediaType == "image/png" || mediaType == "image/webp") ){

                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><img type='+mediaType+' src=data:'+mediaType+';base64,'+msg+' /><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
                
            }else if(isMedia == true && mediaType == "audio/ogg; codecs=opus"){

                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><audio controls><source type=audio/ogg src=data:audio/ogg;base64,'+msg+'></audio><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
                
            }else{
    
                $(".chat").append('<li class="field" style="padding-left:350px;"><div class="msg"><span>' + contatoNome + ':</span><p>' + msg + '</p><time>' + time.getHours() + ':' + time.getMinutes() + '</time></div></li>');
                
            }
        }else{

        }

    });

    socket.on("resQr", function(qr){
        $('#imgQrCode').attr("src", qr);
        $('#loadingQrCode').hide();
    });

    socket.on("resClientIniciado", function(){
        $('#divImgQrCode').hide();
        $('#geral').show();
    });

});

function gerarChatPorContato(btn){
    var socket = io("http://localhost:3010");

    let numeroContato = $(btn).val();

    $(".btn-contato").removeAttr("selected");
    $(btn).attr("selected","selected");

    $(".chat").empty("li");

    socket.emit("reqContact", numeroContato);
}

