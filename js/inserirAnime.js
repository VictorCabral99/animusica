(function (){
    $("#uploadImage").on("change", uploadImagem);
    function uploadImagem(event) {
        var $image = $("#thumbImage");
        var input = event.target;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $image.attr('src', e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $("#quantidadeTemporadas").on("keyup", criarCaixaTemporadas);
    function criarCaixaTemporadas(event){
        let input = event.target;
        let quantidadeTemporadas = Number(input.value);
        const caixas = $("#caixasTemporadas");
        caixas.html("");
        if(quantidadeTemporadas){
            let tempCaixa = "";
            for(let i = 0; i < quantidadeTemporadas; i++){
                tempCaixa += montarCaixasTemporadas(i+1);
            }
            caixas.append(tempCaixa);
        }
    }
    function montarCaixasTemporadas(indice){

        let caixaHtml = "";

        caixaHtml = 
            `<div class="row caixa" id="temporada${indice}">
                <h4>Temporada ${indice}</h4> 
                <div class="col-12 linha"></div>`;

        const tiposMusica = ["Opening","Ending","OST"];
        
        for(let tipo of tiposMusica){
            caixaHtml += 
            `<div class="col-12 col-md-4">
                <p><strong>${tipo}</strong></p>
                <div class="form-group">
                    <label>Nome da música:</label>
                    <input type="text" id="nome${tipo}${indice}" class="form-control">
                </div>
                <div class="form-group">
                    <label>Arquivo da música:</label>
                    <input type="file" id="arquivo${tipo}${indice}" class="d-block"/>
                </div>
                <div class="col-12 linha d-block d-md-none"></div>
            </div>`;
        }
        caixaHtml += "</div>";

        return caixaHtml;
    }

    $("#btnSalvarAnime").on("click", salvarAnime);
    function salvarAnime(ev){
        ev.preventDefault();
        salvarAnimeNoFirebase().then(id => salvarImagemNoFirebase(id).then(function(id){
            salvarMusicas(id);
        }));
    }

    function salvarAnimeNoFirebase(){
        return new Promise(function(resolve, reject){
            let nomeAnime = $("#txtNomeAnime").val();
            let quantidadeTemporadas = Number($("#quantidadeTemporadas").val());
    
            if(nomeAnime && quantidadeTemporadas){
                db.collection("animes").add({
                    nome: nomeAnime,
                    quantidadeTemporadas: quantidadeTemporadas
                })
                .then((docRef) => resolve(docRef.id))
                .catch((error) => reject(error));
            }
        });
    }

    function salvarImagemNoFirebase(id){
        return new Promise(function(resolve, reject){
            var storageRef = firebase.storage().ref();
            var imagemRef = storageRef.child("imagens/"+id+".jpg");
            var imagem = $("#uploadImage")[0].files[0];

            imagemRef.put(imagem).then(function(snapshot) {
                imagemRef.getDownloadURL().then(function(url) {
                    db.collection("animes").doc(id).set({
                        urlImagem: url
                    },{ merge: true }).then(success => resolve(id))
                });
            }).catch(error => reject("Erro"));
        });
    }

    function salvarMusicas(idAnime){
        let quantidadeTemporadas = Number($("#quantidadeTemporadas").val());
        let dadosMusicas = [];
        for(let i = 0; i < quantidadeTemporadas; i++){
            dadosMusicas.push(pegarDadosMusicas(i + 1, idAnime));
        }
    }

    function pegarDadosMusicas(temporada, idAnime){
        let nomeOP = $(`#nomeOpening${temporada}`).val();
        let nomeED = $(`#nomeEnding${temporada}`).val();
        let nomeOST = $(`#nomeOST${temporada}`).val();

        let arquivoOP = $(`#arquivoOpening${temporada}`)[0].files[0];
        let arquivoED = $(`#arquivoEnding${temporada}`)[0].files[0];
        let arquivoOST = $(`#arquivoOST${temporada}`)[0].files[0];

        const tipoMusica = ["OP","ED","OST"]

        if(nomeOP && arquivoOP){
            adicionarMusicaNoFirebase(nomeOP, idAnime,tipoMusica[0]).then((idMusica) => uploadMusicaNoFirebase(idAnime, idMusica, arquivoOP));
        }

        if(nomeED && arquivoED){
            adicionarMusicaNoFirebase(nomeED, idAnime, tipoMusica[1]).then((idMusica) => uploadMusicaNoFirebase(idAnime, idMusica, arquivoED));
        }

        if(nomeOST && arquivoOST){
            adicionarMusicaNoFirebase(nomeOST, idAnime, tipoMusica[2]).then((idMusica) => uploadMusicaNoFirebase(idAnime, idMusica, arquivoOST));
        }
    }

    function adicionarMusicaNoFirebase(nomeMusica, idAnime, tipoMusica){
        return new Promise(function (resolve, reject){
            db.collection(`animes/${idAnime}/musicas`).add({
                nomeMusica: nomeMusica,
                tipoMusica: tipoMusica
            })
            .then((docRef) => resolve(docRef.id))
            .catch((error) => reject(error));
        });
    }

    function uploadMusicaNoFirebase(idAnime, idMusica, arquivo){
        return new Promise(function(resolve, reject){
            var storageRef = firebase.storage().ref();
            var musicaRef = storageRef.child(`musicas/${idAnime}/${idMusica}.mp3`);

            musicaRef.put(arquivo).then(function(snapshot) {
                musicaRef.getDownloadURL().then(function(url) {
                    db.collection(`animes/${idAnime}/musicas`).doc(idMusica).set({
                        urlMusica: url
                    },{ merge: true }).then(success => resolve(idMusica))
                });
            }).catch(error => reject("Erro"));
        });
    }
})();

let objetoAnime = {
    nomeAnime: "",
    quantidadeTemporadas: 0,
    urlImagem: "",
    musicas: [{
        nomeMusica: "",
        tipoMusica: "",
        urlMusica: "",
        temporada: 0
    }]
};