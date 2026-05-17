const assets = {
    placeholderImage: '../product.png',
}

// spell-checker:disable
const defaultConfig = {
    parallelRequestLimit: 3, // I don't wanna upset the Salling servers with this app
    expensiveThreshold: 100, // the price from which stuff is "expensive"
    ignoreThreshold: 200, // the price from which stuff is ignored
    keywordAverageWeight: { // average weight of the products in SI by keyword
        // bread
        "brød": 0.5, // 500 g
        "kohberg": 0.5, // 500 g
        "schulstad": 0.5, // 500 g
        // dairy
        "mælke": 0.1, // 100 g, stuff like mælkesnitte
        "mælk": 1, // 1 l
        "yoghurt": 1, // 1 kg
        "kefir": 1, // 1 kg
        "drikke yoghurt": 0.33, // 330 ml
        "hytteost": 0.3, // 300 g
        // meat
        "ost": 0.15, // 150 g
        "pølser": 0.35, // 350 g
        "mini salami": 0.02, // 20 g
        // brands
        "salling": 0.2, // 200 g, small boost for store brand
        "egelykke": 0.2, // 200 g, small boost for store brand
        "arla": 0.5, // 500 ml, for obscure milk products
        //TODO: add more
    },
    aliases: {
        "NETTO": "TID-2Y7JRG",
        "FØTEX": "TID-F86K6Y",
        "BILKA": "TID-BZ929S"
    },
    leafletBlacklist: ["Nonfood", "Have", "Trend", "Outdoor", "Inspiration", "føtex ud af huset", "Prosonic"],
}
// spell-checker: enable

let config = defaultConfig;