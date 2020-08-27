(function (){
    const $listaAnime = $("#listaAnime");
    const colecaoAnime = db.collection("animes");
    colecaoAnime.orderBy("nome").get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc){
                montarListaDeAnimes(doc.id, doc.data())
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

    function montarListaDeAnimes(idAnime, dadosAnime){
        let itemAnime = `<li><a href="consultarMusicas.html#${idAnime}">${dadosAnime.nome}</a></li>`;
        $listaAnime.append(itemAnime);
    }
})();