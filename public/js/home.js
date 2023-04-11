geral();
function geral(){

    $('#btn-iniciar-sessao').on('click',function(){
        let id = 1;
        // console.log(id);

        let doAjax = $.ajax({
            type:"POST",
            url:"../iniciarSessao",
            data:{id:id},
            dataType: "json",
            success: function (retorno) {
                console.log(retorno);
            },
            error: function (e) {
                console.log(e);
            }
        });
    })
}

$(document).ready(function() {
})