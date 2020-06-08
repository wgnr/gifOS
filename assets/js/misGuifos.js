const G = new Giphy();

async function popularMisGuifos() {
    const guifos_data = await G.gestionBusquedas(G.getGIFsbyIDEndpoint, mis_gifs);

    if (!Array.isArray(guifos_data)) { console.log("No se pudo traer los gifos", guifos_data); return; }

    if (guifos_data.length === 0) { console.log("No hay guifos guardados aun...", guifos_data); return; }

    // Limpiamos grilla
    document.querySelector(HTML_GRILLA_MISGUIFOS_CLASSNAME).innerHTML="";

    const nuevoArr = reordenarGifos(guifos_data, true);

    // guifos_data.forEach(single_gif => {
    nuevoArr.forEach(single_gif => {
        insertarImagenGenericaEnGrilla(HTML_GRILLA_MISGUIFOS_CLASSNAME, single_gif, true, G, false);
    });
}

window.onload = () => {
    popularMisGuifos();
};