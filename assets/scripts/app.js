document.addEventListener('DOMContentLoaded', () => {
    // TODO - attach event handlers
    // TODO - retrieve favorites from localstorage
});

class GifTasticApp {
    constructor(retriever) {
        this.retriever = retriever;
        this.favorites = [];
    }

    loadFavorites() {}

    search() {}
}

class Gif {
    constructor(url, staticUrl) {
        this.url = url;
        this.staticUrl = staticUrl;
        this.state = GIF_STATE.STATIC;
    }

    play() {}

    pause() {}

    markFavorite() {}
}

class GifRetriever {
    constructor() {}

    buildRequestUrl(params) {
        params.push(`api_key=${API_KEY}`);
        let paramString = params.join('&');
        return `${API_BASE_URI}?${paramString}`;
    }

    search(searchTerm) {}
}
