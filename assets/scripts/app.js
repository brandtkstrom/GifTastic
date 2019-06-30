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
        gifRetriever.search(searchTerm, this.addGifsToScreen);
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
        $("#gif-content").empty();
        gifs.forEach(gif => {
            let $gif = $("<img>")
                .attr("src", gif.staticUrl)
                .addClass("gif")
                .data("gif-data", gif)
                .prop("state", gif.state);
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

    toggleState(element) {
        if (this.state === GIF_STATE.ANIMATED) {
            this.pause(element);
        } else if (this.state === GIF_STATE.STATIC) {
            this.play(element);
        }
    }

    play(element) {
        this.state = GIF_STATE.ANIMATED;
        element.attr("src", this.url).data("gif-data", this);
    }

    pause(element) {
        this.state = GIF_STATE.STATIC;
        element.attr("src", this.staticUrl).data("gif-data", this);
    }

    markFavorite() {
        // TODO
    }
}

class GifRetriever {
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
    // Perform search for food associated with button that is clicked
    $("#food-buttons").on("click", ".food-button", function() {
        let food = $(this).prop("food");
        gifTasticApp.search(food);
    });

    // Handle adding new button with user-specified value
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

        $("#input-food").val("");
    });

    // Toggle between animated/static states when gifs are clicked
    $("#gif-content").on("click", ".gif", function() {
        let $gifElement = $(this);
        let $gif = $($gifElement).data("gif-data");
        $gif.toggleState($gifElement);
    });
});

// Instantiate app objects
var gifRetriever = new GifRetriever();
var gifTasticApp = new GifTasticApp(gifRetriever);
gifTasticApp.initialize();
