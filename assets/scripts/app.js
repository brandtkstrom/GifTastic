class GifTasticApp {
    constructor(retriever) {
        this.retriever = retriever;
        this.topics = [...TOPICS];
        this.savedFavorites = new Map();
        this.favoriteCount = 0;
        this.gifs = new Map();
    }

    initialize() {
        this.addButtonsToScreen();
        this.loadFavorites();
    }

    loadFavorites() {
        let saved = localStorage.getItem("favorite-gifs");
        let favArray = [];
        let newId = 0;
        if (saved != "{}") {
            let favorites = new Map(JSON.parse(saved));
            if (favorites && favorites.entries) {
                for (let [guid, gif] of favorites.entries()) {
                    console.log(`Loaded gif ${guid} from localStorage.`);
                    // Reset gif id, then add to gifs map
                    let tempGif = new Gif(
                        newId,
                        gif.guid,
                        gif.url,
                        gif.staticUrl,
                        gif.rating
                    );
                    this.gifs.set(newId, tempGif);
                    newId++;
                    // Create new gif div element
                    let gifDiv = this.createGifDiv(tempGif, true);
                    favArray.push(gifDiv);
                }
            }
        }

        if (favArray.length > 0) {
            this.showFavorites();
            favArray.forEach(fav => this.addFavorite(fav, true));
            this.retriever.gifId = newId += 1;
        } else {
            this.hideFavorites();
        }
    }

    async search(searchTerm) {
        let gifs = await gifRetriever.search(searchTerm);
        if (gifs) {
            console.log("Gifs found:");
            console.log(gifs);
            this.addGifsToScreen(gifs);
        }
    }

    showFavorites() {
        if (document.querySelector("#gif-favorites")) {
            return;
        }

        let favorites = document.createElement("section");
        favorites.setAttribute("id", "gif-favorites");

        let favClearBtn = document.createElement("i");
        favClearBtn.setAttribute("id", "clear-favorites");
        favClearBtn.className = "fas fa-window-close fa-2x";
        favClearBtn.addEventListener("click", () => {
            this.clearFavorites();
        });
        favorites.append(favClearBtn);
        document.querySelector("#gif-container").prepend(favorites);
    }

    hideFavorites() {
        let favorites = document.querySelector("#gif-favorites");
        if (favorites) {
            favorites.remove();
        }
    }

    addFavorite(gif) {
        this.favoriteCount++;

        this.showFavorites();
        let favorites = document.querySelector("#gif-favorites");
        favorites.prepend(gif);

        let gifId = parseInt(gif.firstChild.getAttribute("id"));
        let gifObj = this.gifs.get(gifId);
        if (gifObj && !this.savedFavorites.get(gifObj.guid)) {
            this.savedFavorites.set(gifObj.guid, gifObj);
            localStorage.setItem(
                "favorite-gifs",
                JSON.stringify(Array.from(this.savedFavorites))
            );
        }
    }

    removeFavorite(gif) {
        let gifId = parseInt(gif.firstChild.getAttribute("id"));
        gif.remove();

        this.favoriteCount--;
        this.favoriteCount = Math.max(this.favoriteCount, 0);

        let gifObj = this.gifs.get(gifId);
        if (gifObj) {
            console.log(`Removed gif ${gifObj.guid} from localStorage.`);
            this.savedFavorites.delete(gifObj.guid);
            localStorage.setItem(
                "favorite-gifs",
                JSON.stringify(Array.from(this.savedFavorites))
            );
        }

        if (this.favoriteCount === 0) {
            this.hideFavorites();
        }
    }

    clearFavorites() {
        let favGifs = document.querySelectorAll(".favorite");
        favGifs.forEach(favorite => favorite.remove());

        this.hideFavorites();
        localStorage.removeItem("favorite-gifs");
        this.favoriteCount = 0;
    }

    clearGifs() {
        let gifs = document.querySelectorAll("#gif-content .gif");
        gifs.forEach(gif => gif.remove());
    }

    addNewTopic(newTopic) {
        if (!newTopic || newTopic === "") {
            return;
        }

        let buttonContainer = document.querySelector("#topic-buttons");

        let button = document.createElement("button");
        button.className = "topic-button";
        button.setAttribute("topic", newTopic);
        button.innerText = newTopic;

        buttonContainer.append(button);

        document.querySelector("#add-input").value = "";
    }

    addButtonsToScreen() {
        let buttonContainer = document.querySelector("#topic-buttons");
        buttonContainer.innerHTML = "";

        TOPICS.forEach(topic => this.addNewTopic(topic));
    }

    addGifsToScreen(gifs) {
        let gifContainer = document.querySelector("#gif-content");
        gifs.forEach(gif => {
            this.gifs.set(gif.id, gif);

            let gifDiv = this.createGifDiv(gif);
            gifContainer.prepend(gifDiv);
        });
    }

    createGifDiv(gif, favorite = false) {
        let gifDiv = document.createElement("div");
        gifDiv.className = "gif";

        let img = document.createElement("img");
        img.setAttribute("id", gif.id);
        img.setAttribute("src", gif.staticUrl);
        img.setAttribute("state", gif.state);
        img.className = "gif-image";

        let heart = document.createElement("i");
        heart.className = "fas fa-heart fa-2x heart";
        heart.style.position = "absolute";
        heart.style.top = 0;
        heart.style.right = 0;

        // If this is a favorite gif
        if (favorite) {
            heart.classList.remove("fa-heart");
            heart.classList.add("fa-heart-broken");
            heart.classList.add("favorite");
        }

        let rating = document.createElement("p");
        rating.classList.add("rating");
        rating.innerText = gif.rating;

        gifDiv.append(img, heart, rating);

        gifDiv.addEventListener("mouseenter", evt => {
            let heart = evt.target.childNodes[1];
            heart.style.visibility = "visible";
        });
        gifDiv.addEventListener("mouseleave", evt => {
            let heart = evt.target.childNodes[1];
            heart.style.visibility = "hidden";
        });

        return gifDiv;
    }

    toggleGifState(gifId) {
        let gif = this.gifs.get(gifId);
        if (!gif) {
            return;
        }

        gif.toggleState(gifId);
    }
}

class Gif {
    constructor(id, guid, url, staticUrl, rating) {
        this.id = id;
        this.guid = guid;
        this.url = url;
        this.staticUrl = staticUrl;
        this.rating = rating;
        this.state = GIF_STATE.STATIC;
    }

    toggleState(id) {
        let img = document.getElementById(id);
        if (!img) {
            return;
        }

        if (this.state === GIF_STATE.ANIMATED) {
            this.pause(img);
        } else if (this.state === GIF_STATE.STATIC) {
            this.play(img);
        }
    }

    play(img) {
        this.state = GIF_STATE.ANIMATED;
        img.setAttribute("state", this.state);
        img.setAttribute("src", this.url);
    }

    pause(img) {
        this.state = GIF_STATE.STATIC;
        img.setAttribute("state", this.state);
        img.setAttribute("src", this.staticUrl);
    }
}

class GifRetriever {
    constructor() {
        this.gifId = 0;
    }

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
            let rating = obj.rating.toUpperCase();
            let gif = new Gif(this.gifId++, obj.id, animated, still, rating);
            gifs.push(gif);
        });
        return gifs;
    }

    getOffset() {
        return Math.floor(Math.random() * 100);
    }

    async search(searchTerm) {
        let requestUrl = this.buildRequestUrl(searchTerm);

        try {
            let response = await fetch(requestUrl);
            let json = await response.json();
            return this.buildGifObjects(json.data);
        } catch (error) {
            console.log(error);
        }
    }
}

// Attach event listeners when DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Perform search for topic associated with button that is clicked
    document.querySelector("#topic-buttons").addEventListener("click", evt => {
        if (!evt.target.classList.contains("topic-button")) {
            return;
        }

        let topic = evt.target.getAttribute("topic");
        gifTasticApp.search(topic);
    });

    // Handle adding new button with user-specified value
    function addTopicButton(evt) {
        evt.preventDefault();
        let addInput = document.querySelector("#add-input");
        let newTopic = addInput.value.trim();
        gifTasticApp.addNewTopic(newTopic);
        addInput.value = "";
    }

    document
        .querySelector("#add-button")
        .addEventListener("click", addTopicButton);

    document
        .querySelector("#add-form")
        .addEventListener("submit", addTopicButton);

    document.querySelector("#gif-container").addEventListener("click", evt => {
        if (evt.target.classList.contains("gif-image")) {
            // Clicking on gifs toggles between animated/static
            let gifId = parseInt(evt.target.getAttribute("id"));
            gifTasticApp.toggleGifState(gifId);
        } else if (evt.target.classList.contains("favorite")) {
            // Handle removing favorite gif
            let heart = evt.target;
            let gifDiv = heart.parentNode;
            gifTasticApp.removeFavorite(gifDiv);
        } else if (evt.target.classList.contains("heart")) {
            // Click on gif heart adds it to favorites section
            let heart = evt.target;
            heart.classList.remove("fa-heart");
            heart.classList.add("fa-heart-broken");
            heart.classList.add("favorite");

            let gifDiv = heart.parentNode;
            gifTasticApp.addFavorite(gifDiv);
        }
    });

    document.querySelector("#clear-gifs").addEventListener("click", () => {
        gifTasticApp.clearGifs();
    });
});

// Instantiate app objects
var gifRetriever = new GifRetriever();
var gifTasticApp = new GifTasticApp(gifRetriever);
gifTasticApp.initialize();
