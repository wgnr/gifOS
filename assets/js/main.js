// INICIO
const mis_anteriores_busquedas = ls_init(MIS_ANTERIORES_BUSQUEDAS_NAME, []); // El vector vacío indica dentro de ls_init, inicia por defecto a la variable como un vector vacio.

// Objeto usado para hacer las busquedas de sugerencias y de tendencias
const G_SugYTen = new Giphy();
G_SugYTen.limit = 40;

function btnCruzDeSugerencia(event) {
    // Elimina la sugerencia de la grilla.
    const cuadroImagen = event.target.parentElement;
    const contenedor = cuadroImagen.parentElement;
    contenedor.removeChild(cuadroImagen);

    // Agregamos un nuevo elemento al final
    popularGifsSugerencias(1);
}


async function popularGifsSugerencias(n = 4) {
    const LISTADO_BUSQUEDAS = await busarListaDeTerminosDesdeCategorias(n);
    LISTADO_BUSQUEDAS.forEach(async busqueda => { // Que loco poner el async ahi
        const gif_data = await G_SugYTen.gestionBusquedas(G_SugYTen.translateEndpoint, busqueda);

        // Contenedor a agregar en la grilla
        const contenedor = document.createElement("div");
        contenedor.classList.add("boxGifSugerencia", "windowBackground");
        contenedor.setAttribute("id_gif", gif_data.id);
        contenedor.setAttribute("sugerencia", busqueda);
        contenedor.onclick = gif_agregar_quitar_mis_guifos;


        // Titulo
        const spanTitulo = document.createElement("span");
        spanTitulo.classList.add("gradient", "windowTitle", "srinkText", "titleGifSugerido");
        spanTitulo.innerText = busqueda;
        contenedor.appendChild(spanTitulo);

        // Cruz para quitar la sugerencia
        const imgCruz = document.createElement("img");
        imgCruz.classList.add("btn", "outline");
        imgCruz.src = "./assets/img/button3.svg";
        imgCruz.alt = "Quitar sugerencia";
        imgCruz.title = "Quitar sugerencia";
        imgCruz.onclick = btnCruzDeSugerencia;
        contenedor.appendChild(imgCruz);

        // Gif
        const gif = document.createElement("img");
        gif.classList.add("outline", "gifSug");
        gif.src = gif_data.images[G_SugYTen.SELECTOR_IMAGEN].url;
        gif.alt = gif_data.title.trim();
        gif.title = gif_data.title.trim();
        contenedor.appendChild(gif);

        // Label "Ver mas..."
        const spanVerMas = document.createElement("span");
        spanVerMas.classList.add("etiquetasBusquedasAnteriores", "btn", "btnVerMas", "outline");
        spanVerMas.innerText = "Ver más...";
        spanVerMas.title = "Busca guifs de " + busqueda;
        spanVerMas.onclick = buscarSugerencia;
        contenedor.appendChild(spanVerMas);

        // Agregamos al DOM
        const grilla = document.querySelector(HTML_GRILLA_SUGERENCIAS_CLASSNAME);
        grilla.appendChild(contenedor);
    });
}

async function busarListaDeTerminosDesdeCategorias(n = 10) {
    /* 
    La idea es que de todas las sugerencias tome subcaterías random.
    */
    const info = await G_SugYTen.gestionBusquedas(G_SugYTen.categoriesEndpoint);

    const listado = [];
    let salida_forzada = 0;
    for (let i = 0; i < n; i++) {
        const rdm = Math.floor(info.length * Math.random());

        const ejemplo = info[rdm].subcategories[Math.floor((info[rdm].subcategories.length * Math.random()))].name;

        if (listado.includes(ejemplo)) { // No quiero incluir dos veces el mismo resultado
            i--;
            if (salida_forzada++ === 2) break; // Si por algún motivo dos veces me esta trayendo un resultado ya tomado previamente algo esta pasando... tomatelas... 
        } else {
            listado.push(ejemplo);
        }
    }

    return listado; // Devuelve un array[Strings]
}

async function buscarSugerencia(event) {
    const busqueda = event.target.parentElement.getAttribute("sugerencia")
    document.querySelector("input").value = busqueda;
    forzarBusqueda();
}

async function popularGifsTendencias() {
    const guifos_data = await G_SugYTen.gestionBusquedas(G_SugYTen.trendingEndpoint);
    const nuevoArr = reordenarGifos(guifos_data);
    agregarGuifBuscados(HTML_GRILLA_TENDENCIA_CLASSNAME, nuevoArr, true, G_SugYTen);
}
/* 
BUSCAR GUIFO
*/
const G_buscador = new Giphy(); // Gestiona las busques hechas por el usuario.
G_buscador.limit = 40; // Limitamos cuantos gifs traer

let abortFetch = new AbortController(); // Para cancelar la consulta del datamuse
let vamoACalmanoFetch = undefined; // Variable usada para regular el setTimeLapse y no explotar el datamuse de request

function inputControlLenght() {
    // Toggle disable enable según longitud del value input
    const MINIMOS_CARACTERES_INGRESADOS = 0;
    document.querySelector("button").disabled = document.querySelector("input").value.length > MINIMOS_CARACTERES_INGRESADOS ? false : true;
}

function checkKeyInput() {
    // Se ocupa de traerme las palabras sugeridas en funcion de lo que estoy escribiendo.

    inputControlLenght();

    const busqueda = document.querySelector("input").value;
    const lenInput = busqueda.length;

    const html_listado_sugerencias = document.querySelector(NOMBRE_LISTADO_SUGERENCIAS_BUSQUEDA);

    // Ocultemos las sugerencias
    html_listado_sugerencias.classList.add(CLASS_HIDE_NAME);

    if (lenInput > 2) { // Al menos escribite 2 caracteres para que empice a traer sugerencias

        // Si hay un request a la API de datamuse esperando a dispararse, cancelalo!
        if (vamoACalmanoFetch !== undefined) clearTimeout(vamoACalmanoFetch);

        // Demoremos el disparo del request a la API datamuse
        vamoACalmanoFetch = setTimeout(() => {

            buscarSugerencias(busqueda, abortFetch.signal)
                .then(sugerencias => {
                    if (!Array.isArray(sugerencias)) return; // Datamuse por defecto devuelve un array[{word,rank}]

                    // Que no me muestre lo que ya escribí!
                    sugerencias = sugerencias.filter(sug => sug.word !== busqueda);

                    // Limpiamos las sugerencias previas
                    html_listado_sugerencias.innerHTML = "";

                    if (sugerencias.length === 0) return; // No tiene sentido continuar si no hay sugerencias

                    sugerencias.forEach(sug => {
                        // Maquetamos la sugerencia y la insertamos en el HTML
                        const span = document.createElement("span");
                        span.classList.add("busquedaSugerida");
                        span.innerText = sug.word;
                        span.onclick = buscoLabel;

                        html_listado_sugerencias.appendChild(span);
                    });

                    // Mostremos las sugerencias en el HTML !
                    html_listado_sugerencias.classList.remove(CLASS_HIDE_NAME);
                })
                .catch(e => {
                    if (err.name === 'AbortError') {
                        console.warn("La consulta se ha cancelado!");
                        clearTimeout(vamoACalmanoFetch); // Si hay un request esperando a ejecutarse, evitalo!
                    }
                    console.warn(e);
                });
        }, TIEMPO_ESPERA_REQUEST);
    }
}

async function buscarSugerencias(palabra, signal) {
    const URL_API_DATAMUSE = 'https://api.datamuse.com/sug?v=es&max=' + DATAMUSE_MAX_SUGGESTED_WORDS + '&s=';
    const URL_BUSQUEDA = URL_API_DATAMUSE + palabra;

    try {
        return await (await fetch(URL_BUSQUEDA, { signal })).json();
    } catch (e) {
        if (e.name === 'AbortError') {
            console.warn("La consulta DataMuse se ha cancelado!");
        }
        console.log(e);
    }
}

async function presionarEnter(event) {
    if (document.querySelector("button").disabled) return;
    switch (event.keyCode) {
        case 13: // "Enter"
            event.preventDefault();
            forzarBusqueda();
            break;
        case 27: // "Esc"
            event.preventDefault();
            document.querySelector(NOMBRE_LISTADO_SUGERENCIAS_BUSQUEDA).classList.add(CLASS_HIDE_NAME);
            break;
        default:
            return;
    }
}

function forzarBusqueda() { // Forma unificada de disparar la consulta.
    inputControlLenght();
    btnBuscar();
    ponerBusquedaDelanteDeTodo(document.querySelector("input").value);
    popularEtiquetasDeBusquedasRealizadas();
    document.querySelector("input").focus();
}

async function btnBuscar() {
    document.querySelector(NOMBRE_LISTADO_SUGERENCIAS_BUSQUEDA).classList.add(CLASS_HIDE_NAME);
    document.querySelector(NOMBRE_SECCION_SUGERENCIAS_TENDENCIAS).classList.add(CLASS_HIDE_NAME);

    document.querySelector(NOMBRE_SECCION_BUSQUEDAS).classList.remove(CLASS_HIDE_NAME);

    const busqueda = document.querySelector("input").value;
    busco(busqueda);
}


async function buscoLabel(event) {
    const busqueda = event.target.innerText;
    document.querySelector("input").value = busqueda;
    forzarBusqueda();
}

function ponerBusquedaDelanteDeTodo(busqueda) {
    if (mis_anteriores_busquedas.length < 2) { // No tiene sentido hacer esto si tenemos un sólo elemento...
        return;
    }
    const elementosRemovido = mis_anteriores_busquedas.splice(mis_anteriores_busquedas.indexOf(busqueda), 1);
    mis_anteriores_busquedas.unshift(elementosRemovido[0]);
    ls_saveDatita(MIS_ANTERIORES_BUSQUEDAS_NAME, mis_anteriores_busquedas);
}


function popularEtiquetasDeBusquedasRealizadas() {
    const contenedor = document.querySelector(GRILLA_BUSQUEDAS_PREVIAS_CLASSNAME + " ul");
    contenedor.innerHTML = "";// Limpio el contenido de etiquetas.

    mis_anteriores_busquedas.forEach(b => {
        agregarBusquedaAlListadoHTML(b, true);
    });
}
async function busco(busqueda) {
    if (typeof (busqueda) !== "string") {
        console.warn("Se debe ingresar un Strings...");
        return;
    }

    if (!G_buscador.esIgualALaBusquedaAnteior(busqueda)) {
        // Es una busqueda nueva y tengo que limpiar mi grilla.
        document.querySelector(NOMBRE_GRILLA_BUSCADOR).innerHTML = "";
    }

    if (abortFetch !== undefined) { // De haber algun request a la API de datamuse, la cancelo.
        abortFetch.abort();
        abortFetch = new AbortController(); // Debo instanciar un nuevo abort.
    }
    if (vamoACalmanoFetch !== undefined) clearTimeout(vamoACalmanoFetch); // Evita salte algun cartel

    document.querySelector(NOMBRE_LISTADO_SUGERENCIAS_BUSQUEDA).classList.add(CLASS_HIDE_NAME);

    const guifos_data = await G_buscador.gestionBusquedas(G_buscador.searchEndpoint, busqueda);
    const nuevoArr = reordenarGifos(guifos_data.reverse());

    agregarGuifBuscados(NOMBRE_GRILLA_BUSCADOR, nuevoArr, true, G_buscador);

    document.querySelector(NOMBRE_H2_RESULTADO).innerText = busqueda + " (resultados)...";

    if (mis_anteriores_busquedas.includes(busqueda)) {
        console.log("En el listado de busquedas no se pueden repetir las busquedas...");
        return;
    }
    agregarAlLocalStorage(busqueda, mis_anteriores_busquedas, MIS_ANTERIORES_BUSQUEDAS_NAME);
    agregarBusquedaAlListadoHTML(busqueda, false);
}

function agregarGuifBuscados(classNameGrilla, array_gifsdata, agregarAlFinal, objetoGiphy) {
    /* Mostramos los gifs en la grilla
    Podemos tener un solo gif o un arrego de ellos */
    if (Array.isArray(array_gifsdata)) {
        // Muchos gifs para agregar
        array_gifsdata.forEach(single_gif => {
            insertarImagenGenericaEnGrilla(classNameGrilla, single_gif, agregarAlFinal, objetoGiphy, true);
        });
    } else {
        // Un sólo gif por agregar
        insertarImagenGenericaEnGrilla(classNameGrilla, array_gifsdata, agregarAlFinal, objetoGiphy, true);
    }
}

function agregarBusquedaAlListadoHTML(busqueda, agregarAlFinal) {
    // Maquetado de etiquetas de busquedas realizadas
    const labelSpan = document.createElement("span");
    labelSpan.classList.add("etiquetasBusquedasAnteriores", "btn");
    labelSpan.innerText = busqueda.trim().toLowerCase();
    labelSpan.onclick = buscoLabel;

    const li = document.createElement("li");
    li.appendChild(labelSpan);

    const contenedor = document.querySelector(GRILLA_BUSQUEDAS_PREVIAS_CLASSNAME + " ul");

    agregarAlFinal ?
        contenedor.insertAdjacentElement('beforeend', li) :
        contenedor.insertAdjacentElement('afterbegin', li);
}



window.onload = () => {
    console.log('Todo ready... Ahora a popular la página...');
    popularEtiquetasDeBusquedasRealizadas();
    popularGifsSugerencias();
    popularGifsTendencias();
};