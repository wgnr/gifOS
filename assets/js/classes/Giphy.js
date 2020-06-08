class Giphy {
    constructor() {
        this.APIKEY = "e8Sjyo2VgvjQz2uDkHk5XX9iQpZZfXsu"; //This is my API key. Please, consider not using it.

        // Variables para uso interno únicamente
        this.busquedaAnterior = "";

        // Variables que se pueden modificar para mutar la forma de buscar del objeto.
        this.limit = 4;
        this.offset = 0;
        this.rating = "R";
        this.lang = "es";
        this.weirdness = 5;
        this.SELECTOR_IMAGEN = "fixed_height_downsampled"; // Indica que recurso debo tomar para mostrar el gif
    }

    async searchEndpoint(query = "wagner", limit = "", offset = "", rating = "R", lang = "es") {
        /*GIPHY Search gives you instant access to our library of millions of 
        GIFs and Stickers by entering a word or phrase. With our unparalleled 
        search algorithm, users can easily express themselves and animate 
        their conversations.*/
        return this.generalFetch('https://api.giphy.com/v1/gifs/search?' +
            'q=' + encodeURIComponent(query) +
            '&limit=' + limit +
            '&offset=' + offset +
            '&rating=' + rating +
            '&lang=' + lang +
            '&api_key=' + this.APIKEY);
    }

    async trendingEndpoint(limit = "", offset = "", rating = "") {
        /* GIPHY Trending returns a list of the most relevant and engaging content each and every day.
        Our feed of trending content is continuously updated, so you always have the latest and 
        greatest at your fingertips.*/
        const URL = "api.giphy.com/v1/gifs/trending";
        return this.generalFetch('https://' + URL + '?api_key=' + this.APIKEY +
            '&limit=' + limit +
            '&offset=' + offset +
            '&rating=' + rating
        );
    }

    async translateEndpoint(s = "", weirdness = "5") {
        /* https://developers.giphy.com/docs/api/endpoint#translate
        GIPHY Translate converts words and phrases to the perfect GIF or 
        Sticker using GIPHY's special sauce algorithm. This feature is best 
        exhibited in GIPHY's Slack integration.*/
        const URL = "api.giphy.com/v1/gifs/translate";
        return this.generalFetch('https://' + URL + '?api_key=' + this.APIKEY +
            "&s=" + encodeURIComponent(s) +
            "&weirdness=" + weirdness
        );
    }


    async randomEndpoint(tag = "", rating = "") {
        /* GIPHY Random lets you add some weirdness to the conversation by returning a 
        single random GIF or Sticker related to the word or phrase entered. If no tag 
        is specified, the GIF or Sticker returned is completely random.*/
        const URL = "api.giphy.com/v1/gifs/random";
        return this.generalFetch('https://' + URL + '?api_key=' + this.APIKEY +
            "&tag=" + tag +
            "&rating=" + rating
        );
    }

    async randomIDEndpoint(key) {
        /* GIPHY Random ID Endpoint allows GIPHY to generate a unique ID you can assign to each new user in your app.

        To get the most out of Random ID, we recommend sending the random_id param with all compatible endpoints.
        This lets us adjust the API response to your users’ preferences and improve their GIF experience while 
        maintaining their privacy. */
        const URL = "api.giphy.com/v1/randomid";
        return this.generalFetch('https://' + URL + '?api_key=' + this.APIKEY);
    }

    async getGIFbyIDEndpoint(gif_id = "") {
        /* Get GIF by ID returns a GIF’s metadata based on the GIF ID specified. */
        const URL = "api.giphy.com/v1/gifs/" + gif_id;
        return this.generalFetch('https://' + URL + '?api_key=' + this.APIKEY);
    }

    async getGIFsbyIDEndpoint(arrayWithStringsID = [""], ...rest) {
        /* Get GIFs by ID returns metadata of multiple GIFs based on the GIF IDs specified. */
        const URL = 'api.giphy.com/v1/gifs';
        return this.generalFetch('https://' + URL + '?api_key=' + this.APIKEY + '&ids=' + arrayWithStringsID.join());
    }

    uploadEndpoint(formData, abortSignal) {
        /*GIPHY Upload allows you to upload your content programmatically on GIPHY.com. We accept animated GIFs
         or video files up to 100MB.
        Note: If you're using a rate-limited key assigned by the developer portal, you will not be able to
         specify a GIPHY channel username to your request and you will be limited to 10 uploads per day.
         To have these limits removed, you can apply for a production key from your dashboard. Only approved
          apps will be able to include a GIPHY channel username. You can use this endpoint to upload your
           content, attach tags, and other meta tag in a single HTTP or HTTPS POST request.*/
        if (formData.get("file") === null) return console.log("El gif no cuenta con un archivo!");
        if (formData.get("file").type !== "image/gif") return console.log("Sólo son soportados los MIME 'image/gif'");

        formData.append('api_key', this.APIKEY);

        const URL = "https://upload.giphy.com/v1/gifs";

        return fetch(URL,
            {
                method: 'POST',
                body: formData,
                signal: abortSignal // TODO A MEJORAR https://itnext.io/how-you-can-abort-fetch-request-on-a-flight-830a639b9b92
            })
            .then(response => {
                console.log("Response:\n", response)
                if (!response.ok) return undefined;
                return response.json();
            })
            .then(datita => {
                console.log(datita);
                if (datita.meta.msg !== "OK") {
                    console.error('Fail:\n', datita);
                    return undefined;
                }
                return datita;
            })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    console.warn("La subida se ha cancelado!");
                    return;
                }
                console.error('Error:', err);
            });
    }

    async categoriesEndpoint() {
        /* Providers users a list of Gif categories on the GIPHY network. */
        const URL = 'api.giphy.com/v1/gifs/categories';
        return this.generalFetch('https://' + URL + '?api_key=' + this.APIKEY);

        /*
        Trae tag el único gif que trae.
        */
    }


    async autocompleteEndpoint(q = "") {
        return console.log("NO USAR!");
        // /* Providers users a list of valid terms that completes the given tag on the GIPHY network. */
        // const URL = 'api.giphy.com/v1/gifs/search/tags';
        // return this.generalFetch('https://' + URL + '?api_key=' + this.API +
        //     '&q=' + q
        // );
        // /*NO SE PUEDE USAR ESTE ENDPOINT!
        // REQUEST: 
        // https://api.giphy.com/v1/gifs/search/tags?api_key=xazHc555VTVci7oZetOMWpEZFUPmUIdX&q=lov
        // RESPONSE:
        // {"message":"You cannot consume this service"}
        // */
    }

    async searchSuggestionsEndpoint(term = "") {
        return console.log("NO USAR!");
        // /* Providers users a list of tag terms related to the given tag on the GIPHY network. */
        // const URL = 'api.giphy.com/v1/tags/related/' + term;
        // return this.generalFetch('https://' + URL + '?api_key=' + this.API);
        // /*NO SE PUEDE USAR ESTE ENDPOINT!
        // REQUEST: 
        // https://api.giphy.com/v1/tags/related/hi?api_key=xazHc555VTVci7oZetOMWpEZFUPmUIdX
        // RESPONSE:
        // {"message":"You cannot consume this service"}
        // */
    }

    async trendingSearchTermsEndpoint() {
        return console.log("NO USAR!");
        // /* Provides users a list of the most popular trending search terms on the GIPHY network. */
        // const URL = "api.giphy.com/v1/trending/searches";
        // return this.generalFetch('https://' + URL + '?api_key=' + this.API);
        // /*NO SE PUEDE USAR ESTE ENDPOINT!
        // REQUEST:
        // https://api.giphy.com/v1/trending/searches?api_key=xazHc555VTVci7oZetOMWpEZFUPmUIdX
        // RESPONSE:
        // {"data":[],"meta":{"status":403,"msg":"Forbidden","error_code":403,
        // "response_id":"6f519fc262527b7b8ed117374b1af87883f51884"}}
        // */
    }

    async generalFetch(url) {
        // Generic fetch
        try {
            const response = await fetch(url);
            if (!response.ok) return response;
            const json = await response.json();
            return json;
        } catch (error) {
            console.log("Se ha producido un error!!:\n", error);
            return;
        }
    }

    esIgualALaBusquedaAnteior(busqueda) {
        return this.busquedaAnterior === busqueda;
    }

    async gestionBusquedas(metodo, busqueda) {
        // FORMA AUTOGESTIONADA DE PEDIR RECURSOS

        // if (this.busquedaAnterior !== busqueda) {
        if (!this.esIgualALaBusquedaAnteior(busqueda)) {
            // Es una busqueda nueva!
            this.busquedaAnterior = busqueda;
            this.offset = 0;
        }

        let datita;

        switch (metodo) {
            case this.searchEndpoint:
                datita = await this.searchEndpoint(busqueda, this.limit, this.offset, this.rating, this.lang);
                break;
            case this.getGIFsbyIDEndpoint:
                if (!Array.isArray(busqueda)) {
                    console.warn("Se debe ingresar un vectos con IDs", busqueda);
                    return;
                }
                if (busqueda.length === 0) {
                    console.warn("El array está vacío...", busqueda);
                    return;
                }

                datita = await this.getGIFsbyIDEndpoint(busqueda);
                break;
            case this.categoriesEndpoint:
                datita = await this.categoriesEndpoint();
                break;
            case this.trendingEndpoint:
                datita = await this.trendingEndpoint(this.limit, this.offset, this.rating);
                break;
            case this.translateEndpoint:
                datita = await this.translateEndpoint(busqueda, this.weirdness);
                break;
            default:
                console.warn("CUalquiera el método usado...", metodo);
                return;
        }

        if (datita.meta.msg !== "OK") {
            console.error("Ha habido un problema en la respuesta de la búsqueda.", datita)
            return;
        }

        if (typeof (datita.pagination) !== "undefined") {
            this.offset = datita.pagination.offset + datita.pagination.count;
            if (datita.pagination.total_count === this.offset) {
                console.info("Se han traido todos los gifs disponibles!");
            }
        }


        return datita.data; // DEVUELVE UNA PROMESA CON TODAS LOS GIF(S) DENTRO
    }

}