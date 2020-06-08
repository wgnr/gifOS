/*
Varibales útiles
*/
const RATIO_QUIEBRE_IMG_GRANDE_CHICA = 1.54098; // Ratio con el cual decide si un Gif debe mostrarse cuadrado o rectangular. 1.54098 minimizaría la perdida de gif en el caso que se "cropearan".
const TIEMPO_ESPERA_REQUEST = 400; // Tiempo de espera para realizar el request GET a la API datamuse.
const DATAMUSE_MAX_SUGGESTED_WORDS = 4; // Cantidad de palabras maximas que me puede traer la API.
const CREARGUIFO_MAX_LENGHT_RECORDING = 12000; // 12 segundos maximo permito grabar.
const VELOCIDAD_PROGRESSBAR = 200; // Cada 0.2 segundos se colorea un nuevo bloquecito...

/*
Nombre para localStorage
*/
const MIS_GIFOS_NAME = "mis_guifos"; // Guardo gifs creados y ctrl+clickeados
const THEME_ATTRIB_NAME = "theme"; // Guardo el estado del tema | true=light ; false=dark
const MIS_ANTERIORES_BUSQUEDAS_NAME = "mis_busquedas"; // Guardo todas las busquedas hechas

/*
DOM class names: selector de clases para luego usar el QuerySelector
*/
const HTML_BOTONES_LIGHT_DARK = ".menuBtnThemes"; // Div que contiene los botones para cambiar el contenido.
const GRILLA_BUSQUEDAS_PREVIAS_CLASSNAME = ".busquedasPrevias"; // Donde colocar los labels de las busquedas anteriores.
const HTML_GRILLA_SUGERENCIAS_CLASSNAME = ".grillaSugerencia"; // Donde colocar los gifs sugerencias.
const HTML_GRILLA_TENDENCIA_CLASSNAME = ".grillaTendencias"; // Donde colocar los gifs tendencias.
const NOMBRE_GRILLA_BUSCADOR = ".grillaBusqueda"; // Donde colocar los gifs que el usuario ha buscado.
const HTML_GRILLA_MISGUIFOS_CLASSNAME = ".grillaMisGuifos"; // Donde colocar mis gifs guardados.

const NOMBRE_LISTADO_SUGERENCIAS_BUSQUEDA = ".listadoBusquedasSugeridas"; // Dialogo de palabras sugeridas
const NOMBRE_SECCION_SUGERENCIAS_TENDENCIAS = ".guifsSugeridoYTendencia"; // Seccion de Tendencias.
const NOMBRE_SECCION_BUSQUEDAS = ".misBusquedas"; // Seccion de Busquedas.
const NOMBRE_H2_RESULTADO = NOMBRE_SECCION_BUSQUEDAS + ">h2"; // Elemento H2 donde se sobreescribre el texto de la búsqueda hecha.

const HTML_CREARGUIFOS_SECCION_INTRO_CLASSNAME = ".sectionIntro"; // Dialog intro
const HTML_CREARGUIFOS_SECCION_RECORDING_CLASSNAME = ".sectionRecording"; // Dialog para capturar el gif
const HTML_CREARGUIFOS_BUTTON_CAPTURAR_CLASSNAME = ".btnCrearGuifoCapturar"; // Btn "Capturar" -> Para comenzar la captura del gif
const HTML_CREARGUIFOS_BUTTON_TERMINAR_CAPTURAR_CLASSNAME = ".btnCrearGuifoListo"; // Btn "Listo" -> Para finalizar la captura del gif
const HTML_CREARGUIFOS_SPAN_TIMER_CLASSNAME = ".gifTimer"; // Timer
const HTML_CREARGUIFOS_DIV_REPETIR_SUBIR_CLASSNAME = ".btnsRepetirSubir"; // Btn "Repetir Captura"
const HTML_CREARGUIFOS_IMG_GIF_GRABADO_CLASSNAME = ".gifGrabado"; // Img donde muestro el gif capturado
const HTML_CREARGUIFOS_IMG_GIF_RESULTADO_CLASSNAME = ".gifResultado"; // Img donde muestro el gif ya subido a la API
const HTML_CREARGUIFOS_DIV_SUBIENDO_GIF_CLASSNAME = ".subiendoGuifo"; // Seccion que muestra el proceso de subida del gif ... incluye el progress
const HTML_CREARGUIFOS_PROGRESS_CLASSNAME = ".progress"; // "progress bar"
const HTML_CREARGUIFOS_BUTTON_CANCELARSUBIDA_CLASSNAME = ".btnCrearGuifoRepetirCancelar"; // Btn para cancelar la subida
const HTML_CREARGUIFOS_SECCION_RESULT_CLASSNAME = ".sectionResult"; // Dialogo que muestra el resumen del gif subido
const HTML_CREARGUIFOS_SECTION_MISGUIFOS_CLASSNAME = ".misGuifos"; // Sección donde muestra todos los gifs guardados.

const CLASS_HIDE_NAME = "hide"; // Clase usada para ocultar DOM