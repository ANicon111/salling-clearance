const assets = {
    placeholderImage: '../product.png',
}

const defaultConfig = {
    parallelRequestLimit: 3, // I don't wanna upset the Salling servers with this app
    expensiveThreshold: 100, // the price from which stuff is "expensive"
    ignoreThreshold: 200, // the price from which stuff is ignored
    aliases: {
        "NETTO": "TID-2Y7JRG",
        "FØTEX": "TID-F86K6Y",
        "BILKA": "TID-BZ929S"
    },
    // spell-checker: disable-next-line
    leafletBlacklist: ["Nonfood", "Have", "Trend", "Outdoor", "Inspiration", "føtex ud af huset", "Prosonic"],
}
let config = defaultConfig;