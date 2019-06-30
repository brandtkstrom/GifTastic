const API_BASE_URI = "https://api.giphy.com/v1/gifs/search";

const API_KEY = "p8D59yovNeP3PTeEY050e6xzDnfjuMhu";

const GIF_LIMIT = 10;

const DEFAULT_PARAMS = [
    "rating=pg",
    "lang=en",
    `limit=${GIF_LIMIT}`,
    `api_key=${API_KEY}`
];

const FAV_KEY = "gif-favorite";

const GIF_STATE = {
    ANIMATED: "animated",
    STATIC: "static"
};

const TOPICS = [
    "burger",
    "pizza",
    "cheese",
    "beef",
    "salad",
    "bacon",
    "cookie",
    "candy",
    "bread",
    "beer",
    "sushi",
    "ramen",
    "kebab"
];
