/*
-----------
COMENTARIOS
-----------
Helper es un archivo común para ambas paginas.
Contiene:
- La manipulación del LocalStorage
- El control del theme
- Getión de mis gifs
*/




/* 
LOCALSTORAGE
Forma de gestionar en forma centralizada la interacción con el local storage
*/
function ls_init(localStoreName, defaultValue) {
    const aux = ls_getDatita(localStoreName);

    if (aux !== null) return aux;

    // Iniciamos por primera vez nuestra variable.
    ls_saveDatita(localStoreName, defaultValue);
    return defaultValue;
}

function ls_deleteDatita(k) { //logout
    localStorage.removeItem(k);
}

function ls_saveDatita(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
}

function ls_getDatita(k) {
    const valorLS = localStorage.getItem(k);
    try {
        return JSON.parse(valorLS);
    } catch (e) {
        console.warn("Hubo un error en traer info del localStorage de la llave " + k + "\n", e);
        return null;
    }
}


/* ME ASEGURO QUE EN EL LOCAL STORAGE LA INFO SE GUARDA COMO LA VOY A USAR ...
ASI EVITO QUE SI TIENEN SUCIO EL LS DE TPS ANTERIORES NO ME ARRUINE EL MIO...
*/
[MIS_GIFOS_NAME, MIS_ANTERIORES_BUSQUEDAS_NAME].forEach(arr => {
    try {
        if (!Array.isArray(ls_getDatita(arr))) ls_deleteDatita(arr);
    } catch{
        ls_deleteDatita(arr);
    }
});
try {
    if (typeof (THEME_ATTRIB_NAME) !== "boolean") ls_deleteDatita(THEME_ATTRIB_NAME);
} catch{

    ls_deleteDatita(THEME_ATTRIB_NAME);
}


function agregarAlLocalStorage(termino, arrayTerminos, localStorageName) {
    /*
    LAMENTABLEME TENGO QUE AGREGAR ESTO POR SI YA EL LOCALSTORAGE ESTÁ GUARDANDO COSAS EN EL FILE://
    */
    if (!Array.isArray(arrayTerminos)) arrayTerminos = [];

    // Agregamos al listado localStorage...
    if (arrayTerminos.includes(termino)) {
        console.log("No se ha agregado el término " + termino + " por estar duplicado en la lista " + localStorageName + ".");
        return;
    }

    arrayTerminos.push(termino);
    ls_saveDatita(localStorageName,
        arrayTerminos);
    console.log("Se ha agregado el termino: " + termino + "\nAl localStorage: " + localStorageName);
}

function quitarDelLocalStorage(termino, arrayTerminos, localStorageName) {
    // Agregamos al listado localStorage...
    if (!arrayTerminos.includes(termino)) {
        console.log("No se ha quitado el término " + termino + " por no estar en la lista " + localStorageName + ".");
        return;
    }

    arrayTerminos.splice(arrayTerminos.indexOf(termino), 1);
    ls_saveDatita(localStorageName,
        arrayTerminos);
    console.log("Se ha quitado el termino: " + termino + "\nDel localStorage: " + localStorageName);
}

/*
OTROS METODOS GENERICOS
*/
function reordenarGifos(gifArray, incluirTodoArray = false) {
    /*
    El algoritmo devuelve un array de objetos gif, ordenados de manera tal de no rompen la continuidad de la grilla.
    Devuelve principalmente linas de grilla completas, pudiendo tambien agregar los elementos que quedaron colgados (incluirTodoArray=true)
    */
    const copyOfArray = gifArray.slice(); // Hago una copia sino modifico el vector original.
    copyOfArray.reverse();
    const respuesta = [];
    let aux_control = 0;
    let grupo4 = []; // armo lineas coquetas

    for (let i = 0; i < copyOfArray.length; i++) {
        const gifData = copyOfArray[i];
        const ratio_wh = gifData.images.original.width / gifData.images.original.height;

        let proxVal = 1;
        if (ratio_wh > RATIO_QUIEBRE_IMG_GRANDE_CHICA) { // El valor fue calculado matemáticamente para minizar la pérdida de imagen dado el contenedor...
            proxVal = 2;
        }

        if (aux_control + proxVal <= 4) {
            // El gif entra en el grupo de a 4
            aux_control += proxVal;
            // respuesta.push(gifData);
            grupo4.push(gifData);
            copyOfArray.splice(copyOfArray.findIndex(gd => gd.id === gifData.id), 1);
            i = -1; // el i++ se encarga de llevarlo a cero...
        }
        if (aux_control === 4) {
            grupo4.forEach(g => respuesta.push(g));
            grupo4 = [];
            aux_control = 0
        };
    }
    if (incluirTodoArray) {
        grupo4.forEach(g => respuesta.push(g)); // Agrego los colgados...
        copyOfArray.forEach(gifData => { // Agrego los otros colados...
            respuesta.push(gifData);
        });
    }
    return respuesta;
}

function insertarImagenGenericaEnGrilla(classNameGrilla, gif_data_object, agregarAlFinal, objetoGiphy, mostrarLabel = true) {
    /*
    Forma generica y unificada de agregar gif al proyecto. Abarca todos los posibles casos.
    */
    const img = document.createElement("img");
    img.src = gif_data_object.images[objetoGiphy.SELECTOR_IMAGEN].url;
    img.classList.add("gif");
    img.alt = gif_data_object.title.trim();

    const ratio_wh = gif_data_object.images.original.width / gif_data_object.images.original.height;
    if (ratio_wh > RATIO_QUIEBRE_IMG_GRANDE_CHICA) { // El valor fue calculado matemáticamente para minizar la pérdida de imagen dado el contenedor...
        img.classList.add("gif_largo");
    } else {
        img.classList.add("gif_corto");
    }

    const elementoContenedor = document.createElement("div");
    elementoContenedor.classList.add("windowGif");
    elementoContenedor.appendChild(img);
    elementoContenedor.setAttribute("id_gif", gif_data_object.id);
    elementoContenedor.onclick = gif_agregar_quitar_mis_guifos;
    elementoContenedor.title = img.alt;

    const labelDiv = document.createElement("div");
    labelDiv.classList.add("gifOutline");
    if (mostrarLabel) {
        const labelSpan = document.createElement("span");
        labelSpan.classList.add("gradient", "windowTitle", "srinkText", "gifOutlineText");

        const labelText = gif_data_object.title.trim().split(" ").filter(e => e.toUpperCase() !== "GIF");
        labelSpan.innerText = ( // Belleza... Agrega los #palabra1 #palabra2
            labelText.length === 1 && labelText[0] === "" ?
                objetoGiphy.busquedaAnterior.trim().split(" ").filter(e => e.toUpperCase() !== "GIF") :
                labelText
        ).map(e => "#" + e).join(" ").trim();

        labelDiv.appendChild(labelSpan);
    }
    elementoContenedor.appendChild(labelDiv);

    const grilla = document.querySelector(classNameGrilla);
    agregarAlFinal ?
        grilla.insertAdjacentElement('beforeend', elementoContenedor) :
        grilla.insertAdjacentElement('afterbegin', elementoContenedor);
}

/*
THEME CONTROL
*/
// Default theme, light : true || dark : false
ls_init(THEME_ATTRIB_NAME, true) ? setOnlyThemeTo(true) : setOnlyThemeTo(false);

function setOnlyThemeTo(isLight) {
    ls_saveDatita(THEME_ATTRIB_NAME, isLight);
    document.documentElement.setAttribute(THEME_ATTRIB_NAME, isLight ? "light" : "dark");
}

function setThemeTo(isLight) {
    setOnlyThemeTo(isLight);
    toggleHideInThemeList();
};

function toggleHideInThemeList() {
    document.querySelector(HTML_BOTONES_LIGHT_DARK).classList.toggle(CLASS_HIDE_NAME);
}



/*
Gestion de mis gifs
*/
const mis_gifs = ls_init(MIS_GIFOS_NAME, []);

function gif_agregar_quitar_mis_guifos(event) {
    // Ctrl + Click : Agrego un gif a mis gifs
    if (event.ctrlKey && !event.shiftKey && !event.altKey) agregarAlLocalStorage(this.getAttribute("id_gif"), mis_gifs, MIS_GIFOS_NAME);
    // Alt + Click : Quito un gif a mis gifs
    if (!event.ctrlKey && !event.shiftKey && event.altKey) quitarDelLocalStorage(this.getAttribute("id_gif"), mis_gifs, MIS_GIFOS_NAME);

}