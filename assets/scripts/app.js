class GifTasticApp {
    constructor(retriever) {
        this.retriever = retriever;
        this.favorites = [];
        this.favoriteCount = 0;
    }

    initialize() {
        this.addButtonsToScreen();
        this.loadFavorites();
    }

    loadFavorites() {
        // TODO - pull favorites from local storage
        // TODO - update favorite count

        if (this.favoriteCount === 0) {
            $("#gif-favorites").hide();
        }
    }

    search(searchTerm) {
        gifRetriever.search(searchTerm, this.addGifsToScreen);
    }

    addFavorite(gif) {
        // todo - add favorite
        // todo toggle fav section
        // append to fav section
        console.log("gif added to favorites section");
        let favIcon = $(gif).children("i");
        favIcon.removeClass("fa-heart").addClass("fa-heart-broken");

        $("#gif-favorites").prepend(gif);
        this.favoriteCount++;

        $("#gif-favorites").show();
    }

    removeFavorite(gif) {
        $(gif).remove();
        this.favoriteCount--;
        this.favoriteCount = Math.max(this.favoriteCount, 0);

        if (this.favoriteCount === 0) {
            $("#gif-favorites").hide();
        }
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
        gifs.forEach(gif => {
            let $gifDiv = $("<div>")
                .addClass("gif")
                .css({ position: "relative" });
            let $gif = $("<img>")
                .attr("src", gif.staticUrl)
                .data("gif-data", gif)
                .prop("state", gif.state)
                .css({ display: "block" });
            let $heart = $("<i>")
                .addClass("fas fa-heart fa-2x heart")
                .css({
                    position: "absolute",
                    top: "0",
                    right: "0"
                });
            $gifDiv.append($gif, $heart);
            $("#gif-content").prepend($gifDiv);
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
        // TODO - mark favorite
        console.log("gif marked favorite.");
    }
}

class GifRetriever {
    buildRequestUrl(searchTerm) {
        let params = DEFAULT_PARAMS;
        let offset = this.getOffset();
        params.push(`offset=${offset}`);
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

    getOffset() {
        return Math.floor(Math.random() * 100);
    }

    search(searchTerm, callback) {
        let requestUrl = this.buildRequestUrl(searchTerm);
        $.ajax({
            url: requestUrl,
            method: "GET"
        }).then(response => {
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
    $("#button-submit").on("click", evt => {
        evt.preventDefault();
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
    $("#gif-container").on("click", "img", function() {
        let $gifElement = $(this);
        let $gif = $($gifElement).data("gif-data");
        $gif.toggleState($gifElement);
    });

    $("#gif-container").on("mouseenter", ".gif", function() {
        $(this)
            .children(".heart")
            .css({ visibility: "visible" });
    });
    $("#gif-container").on("mouseleave", ".gif", function() {
        $(this)
            .children(".heart")
            .css({ visibility: "hidden" });
    });
    $("#gif-container").on("click", ".heart", function() {
        let img = $(this).siblings("img")[0];
        let gif = $(img).data("gif-data");
        let parent = $(this).parent()[0];
        console.log(parent);

        gif.markFavorite();
        gifTasticApp.addFavorite(parent);
    });
    $("#gif-favorites").on("click", ".heart", function() {
        console.log("remove favorite");
        let parent = $(this).parent();
        gifTasticApp.removeFavorite(parent);
    });
});

// Instantiate app objects
var gifRetriever = new GifRetriever();
var gifTasticApp = new GifTasticApp(gifRetriever);
gifTasticApp.initialize();
