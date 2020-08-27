(function(){
    if(location.hash.length > 2){
        const idAnime = location.hash.replace("#","");
        consultarAnime(idAnime);
    } else {
        location.href = "consultarAnime.html";
    }

    function consultarAnime(idAnime){
        const colecaoAnime = db.collection("animes");
        colecaoAnime.doc(idAnime).get()
            .then(function(doc) {
                $("#tituto").text("Animusica - " +doc.data().nome);
                consultarMusicas(idAnime)
            }).catch(function(error) {
                console.log("Error getting cached document:", error);
            });
    }

    function consultarMusicas(idAnime){
        const colecaoMusicas = db.collection(`animes/${idAnime}/musicas`);

        colecaoMusicas.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc){
                montarListaMusicas(doc.id, doc.data())
            });
        })
    }

    function montarListaMusicas(id, musicas){
        $("#listaMusicas").append(`<li><a id="${id}" data-url="${musicas.urlMusica}" href="#">${musicas.nomeMusica} - ${musicas.tipoMusica}</a></li>`)
        $(`#${id}`).on("click", tocarMusica)
    }

    function tocarMusica(event){
        event.preventDefault();
        let url = $(event.target).data("url");
        var a = new Audio(url);
        a.play();
    }
})();