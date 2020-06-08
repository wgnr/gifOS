/* VARIABLES QUE EVENTUALMENTE USO - NO TOCAR */
let recorder = undefined; // objeto quien controla la grabación del gif. Se asigna si se usa.
let intervalTimer = undefined; // Cancela el timer. Se asigna si se usa.
let linkDescargaGifs = undefined; // Guardo la URL para descargar del gif subido. Se asigna si se usa.
let linkGiphyGif = undefined; // Guardo la URL a Giphy del gif subido. Se asigna si se usa.
let abortUpload = new AbortController(); //  Usado para cancelar la subida

// Objeto usado para gestionar la subida de los gifs y luego la búsqueda.
const G_crearGuifo = new Giphy();

// lista de constantes para la creacion de gifs
const webcam_constraints = {
    video: {
        width: 384,
        height: 200,
        // resizeMode: "crop-and-scale",
        frameRate: { ideal: 12 },
        facingMode: "user"
    }
};
const GIF_CONSTRAINTS = {
    type: 'gif',
    width: 384, // 320
    height: 200, // 240
    frameRate: 12, // Sets frame rate in frames per second. Def: 200
    quality: 10 // Quality: best max:1 > min:20 worst. Def: 10 (better => slower processing)
};


/*
FUNCIONES !
*/
function cancelarCrearGuifos() {
    // Cancelamos la subida de haberla...
    cancelarSubirGifCrearGuifos(false);

    // Metodo para limpiar el recorder "por las dudas", así no queda grabando o lo que sea.
    if (typeof (recorder) === "object") {
        try {
            recorder.clearRecordedData();
        } catch (error) { console.log(error); }
    };

    // Nos vamos la directorio de arriba
    self.location.href = "../index.html";
}

function comenzarCrearGuifos() {
    if (typeof (RecordRTC) !== "function") {
        // No esta la librería
        console.error(
            'ASEGURESE QUE ESTA INCLUIDA LA LIBRERIA https://recordrtc.org/\n', '<script src="https://www.WebRTC-Experiment.com/RecordRTC.js"></script>');
        return;
    }

    // Tomamos el recurso de la camara y lo asginamos 
    navigator.mediaDevices.getUserMedia(webcam_constraints)
        .then(mediaStream => {
            // Instnciamos nuestro grabador de Gifs
            recorder = new GifRecorder(mediaStream, GIF_CONSTRAINTS);

            // Stream live cam in video tag
            document.getElementsByTagName("video")[0].srcObject = mediaStream;

            // Mostramos otras ventanas
            document.querySelector(HTML_CREARGUIFOS_SECCION_INTRO_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
            document.querySelector(HTML_CREARGUIFOS_SECCION_RECORDING_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
            document.querySelector(HTML_CREARGUIFOS_SECTION_MISGUIFOS_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
        })
        .catch(e => {
            console.error("No se pudo inicar la camara!\n", e);
        });
}

function capturarCrearGuifos() {
    if (recorder === "undefined") return;

    try {
        recorder.record(); // Para la clase GifRecorder
    } catch (e) {
        console.error("Hubo un error en record()", e);
    }
    const timer = document.querySelector(HTML_CREARGUIFOS_SPAN_TIMER_CLASSNAME);
    timer.classList.toggle(CLASS_HIDE_NAME);

    const horaInicio = new Date();
    intervalTimer = setInterval(() => {
        const timeDif = new Date() - horaInicio;
        if (timeDif > CREARGUIFO_MAX_LENGHT_RECORDING) { // Mas de 12 segundos no puede durar el gif...
            detenerCapturaCrearGuifos();
        }
        timer.innerText = stringTimeDif(timeDif);
    }, 27);

    document.querySelector(HTML_CREARGUIFOS_BUTTON_CAPTURAR_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
    document.querySelector(HTML_CREARGUIFOS_BUTTON_TERMINAR_CAPTURAR_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
}

function stringTimeDif(timeDif) {
    const hours = ("00" +
        Math.trunc(timeDif / 3600000)
    ).slice(-2);
    timeDif = timeDif % 3600000;

    const mins = ("00" +
        Math.trunc(timeDif / 60000)
    ).slice(-2);
    timeDif = timeDif % 60000;

    const segs = ("00" +
        Math.trunc(timeDif / 1000)
    ).slice(-2);
    timeDif = timeDif % 1000;

    const millis =
        ("000" +
            timeDif % 1000
        ).slice(-3)

    return hours + ":" + mins + ":" + segs + ":" + millis;
}

function detenerCapturaCrearGuifos() {
    if (recorder === "undefined") return;

    clearInterval(intervalTimer); // Detiene el timer

    try {
        recorder.stop(function (blob) {
            // El gif fue grabado
            document.querySelector(HTML_CREARGUIFOS_IMG_GIF_GRABADO_CLASSNAME).src = URL.createObjectURL(blob);
        });
    } catch (e) {
        alert("LEER CONSOLA!");
        console.error("Hubo un error en stopRecording", e);
    }

    document.querySelector(HTML_CREARGUIFOS_BUTTON_TERMINAR_CAPTURAR_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
    document.querySelector(HTML_CREARGUIFOS_DIV_REPETIR_SUBIR_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
}

function repetirCapturaCrearGuifos() {
    window.location.reload();
}

function subirGifCrearGuifos() {
    document.querySelector(HTML_CREARGUIFOS_DIV_REPETIR_SUBIR_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
    document.querySelector(HTML_CREARGUIFOS_SPAN_TIMER_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
    document.querySelector(HTML_CREARGUIFOS_DIV_SUBIENDO_GIF_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
    document.querySelector(HTML_CREARGUIFOS_BUTTON_CANCELARSUBIDA_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
    document.querySelector(HTML_CREARGUIFOS_IMG_GIF_GRABADO_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
    document.getElementsByTagName("video")[0].classList.toggle(CLASS_HIDE_NAME);

    const detenerProgressBarr = popularProgressbarDelInfierno(); // Para luego usar en un clearInterval

    console.info("Subiendo el gif... Puede demorar un momento...");

    const form = new FormData();
    form.append('file', recorder.blob, 'acamica-gifos-' + Date.now() + '.gif');

    // Para poder cancelar la subida...
    const signal = abortUpload.signal;

    const promesa = G_crearGuifo.uploadEndpoint(form, signal);

    promesa
        .then(respuestaSubidaGiphy => {
            if (typeof (respuestaSubidaGiphy) === "undefined") {
                console.error("No se há podido enviar la datita al servidor!!", respuestaSubidaGiphy); return;
            }

            clearInterval(detenerProgressBarr); // Detengo la animación
            popularAlPaloProgressbarDelInfierno(); // Muestro la barra al "100%"

            G_crearGuifo.getGIFbyIDEndpoint(respuestaSubidaGiphy.data.id)
                .then(gif => {
                    if (gif.meta.msg !== "OK") {
                        console.error("No se ha podido enconrar el Gif buscado", gif);
                    }
                    // Agregar a mi lista de GIF guardados...
                    agregarAlLocalStorage(respuestaSubidaGiphy.data.id, mis_gifs, MIS_GIFOS_NAME)

                    // Ponemos el gif en la parte descargada...
                    document.querySelector(HTML_CREARGUIFOS_IMG_GIF_RESULTADO_CLASSNAME).src = gif.data.images[G_crearGuifo.SELECTOR_IMAGEN].url;

                    linkGiphyGif = gif.data.url;

                    linkDescargaGifs = gif.data.images.original.url;

                    document.querySelector(HTML_CREARGUIFOS_SECCION_RECORDING_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
                    document.querySelector(HTML_CREARGUIFOS_SECCION_RESULT_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);
                    document.querySelector(HTML_CREARGUIFOS_SECTION_MISGUIFOS_CLASSNAME).classList.toggle(CLASS_HIDE_NAME);

                    // Que me vuelva a mostrar mis gifos...
                    popularMisGuifos();
                })
                .catch(error => {
                    console.error("No se ha podido descargar el gif subido...", error);
                });
        }
        )
        .catch(e => console.error("HUBO UN ERROR SUBIENDO EL ARCHIVO!\n", e));
}


function cancelarSubirGifCrearGuifos(recargar = true) {
    if (abortUpload === undefined) { return }
    abortUpload.abort();
    abortUpload = new AbortController(); // Instanciamos un nuevo objeto... 

    if (recargar) window.location.reload();
}


function copiarEnlaceGifSubidoCrearGuifos() {
    //https://techoverflow.net/2018/03/30/copying-strings-to-the-clipboard-using-pure-javascript/
    const el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = linkGiphyGif;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'fixed', opacity: 0, };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
}

function descargarGifSubidoCrearGuifos() {
    // enlatado de alguna aprte...
    // FIXME: NO SE DESCARGA EL ARCHIVO SOLO ME ABRE la pagina de giphy
    const a = document.createElement('a');
    a.href = linkDescargaGifs;
    a.target = "_blank";
    a.download = "GIF.gif";
    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    a.click();
    a.remove();  //afterwards we remove the element again      
}

function listoCrearGuifos() {
    // Que se yo... Me parece práctico
    window.location.reload();
}


function popularProgressbarDelInfierno() {
    /*
    CONSTRUIMOS EL PROGRESS
    */
    const nBloques = 23; // Cantidad de bloques a meter en el "progress bar caserola"
    const progress = document.querySelector(HTML_CREARGUIFOS_PROGRESS_CLASSNAME);

    //Limpiamos lo que haya 
    progress.innerHTML = "";

    for (let n = 0; n < nBloques; n++) {
        const bloquecito = document.createElement("div");
        bloquecito.classList.add("pogressFlasherismo");
        progress.appendChild(bloquecito);
    }

    // Hago una animación de muy bajo presupuesto.
    let parameDespues = setInterval(() => {
        const bloqueActivo = "progressactivo";
        const bloques = document.querySelectorAll(".pogressFlasherismo");

        // EL ultimo elemento recibio la jodita?
        if (!bloques[bloques.length - 1].classList.contains(bloqueActivo)) {

            // Buscamos al ultimo que se lo dimos...
            for (let i = 0; i < bloques.length; i++) {
                const bloque = bloques[i];
                if (!bloque.classList.contains(bloqueActivo)) {
                    bloque.classList.add(bloqueActivo);
                    break;
                }
            }
        } else {
            for (let i = 0; i < bloques.length; i++) {
                const bloque = bloques[i];
                if (bloque.classList.contains(bloqueActivo)) {
                    bloque.classList.remove(bloqueActivo);
                    break;
                }
            }
        }
    }, VELOCIDAD_PROGRESSBAR);
    return parameDespues;
}

function popularAlPaloProgressbarDelInfierno() {
    // Colorear todos los bloques!
    const bloques = document.querySelectorAll(".pogressFlasherismo");
    bloques.forEach(b => b.classList.add("progressactivo"));
}