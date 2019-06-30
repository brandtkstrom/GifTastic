class GifTasticApp {
    constructor(retriever) {
        this.retriever = retriever;
        this.favorites = [];
    }

    initialize() {
        this.addButtonsToScreen();
        this.loadFavorites();
    }

    loadFavorites() {
        // TODO - pull favorites from local storage
    }

    search(searchTerm) {
        retriever.search(searchTerm, this.addGifsToScreen);
    }

    addButtonsToScreen() {
        $("#food-buttons").empty();
        TOPICS.forEach(topic => {
            let $button = $("<button>")
                .addClass("food-button")
                .prop("food", topic)
                .text(topic);
            $("#food-buttons").append($button);
        });
    }

    addGifsToScreen(gifs) {
        // TODO
        $("#gif-content").empty();
        gifs.forEach(gif => {
            let $gif = $("<img>").attr("src", gif.staticUrl);
            $("#gif-content").append($gif);
        });
    }
}

class Gif {
    constructor(url, staticUrl) {
        this.url = url;
        this.staticUrl = staticUrl;
        this.state = GIF_STATE.STATIC;
    }

    play() {
        if (this.state === GIF_STATE.ANIMATED) {
            // Already playing...
            return;
        }
        // TODO
    }

    pause() {
        if (this.state === GIF_STATE.STATIC) {
            // Already paused...
            return;
        }
        // TODO
    }

    markFavorite() {}
}

class GifRetriever {
    constructor() {}

    buildRequestUrl(searchTerm) {
        let params = DEFAULT_PARAMS;
        params.push(`q=${searchTerm}`);

        let paramString = params.join("&");

        return `${API_BASE_URI}?${paramString}`;
    }

    buildGifObjects(data) {
        let gifs = [];
        data.forEach(obj => {
            let animated = obj.images.fixed_height.url;
            let still = obj.images.fixed_height_still.url;
            let gif = new Gif(animated, still);
            gifs.push(gif);
        });
        return gifs;
    }

    search(searchTerm, callback) {
        let requestUrl = this.buildRequestUrl(searchTerm);
        $.ajax({
            url: requestUrl,
            method: "GET"
        }).then(response => {
            console.log(response.data);
            let gifs = this.buildGifObjects(response.data);
            callback(gifs);
        });
    }
}

// Attach event listeners when DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Attach event listeners
    $("#food-buttons").on("click", ".food-button", function() {
        let food = $(this).prop("food");
        gifTasticApp.search(food);
    });

    $("#button-submit").on("click", () => {
        let newFood = $("#input-food")
            .val()
            .trim();
        if (newFood === "") {
            return;
        }

        let $newFoodButton = $("<button>")
            .addClass("food-button")
            .prop("food", newFood)
            .text(newFood);
        $("#food-buttons").append($newFoodButton);
    });
});

// Instantiate app objects
var retriever = new GifRetriever();
var gifTasticApp = new GifTasticApp(retriever);
gifTasticApp.initialize();
