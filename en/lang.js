translation["en"] = {
    title: "Salling Deal Hunter",
    errorPrefix: "ERROR",
    search: "Search",
    searching: "Searching...",
    lastUpdate: "Last update",
    availableBetween(from, to) {
        return `Available between ${from} and ${to}`;
    },
    availableProducts(count, countColor, store, location) {
        return `<span style="color: ${countColor}; font-weight: bold;">${count}</span> available in <strong>${store}${location != null ? ` (${location})` : ''}</strong>.`
    },
    errors: {
        failedLocal(store, location) {
            return `Failed to get local prices for ${store}${location != null ? ` (${location})` : ''}.`
        },
        failedLeaflet(brand) {
            return `Failed to get leaflet promotions for ${brand}.`
        },
        invalidBrand(lineText, lineNumber) {
            return `Invalid brand on line "${lineText}" (number ${lineNumber}).`
        },
    },
    warningPrefix: "Warning",
    warnings: {
        noPromotions(brand, keywords) {
            return `Couldn't find any promotions for ${brand} matching ${keywords}.`
        },
        noStoreMatches(lineText, lineNumber) {
            return `Couldn't find any local store matches for "${lineText}" on line ${lineNumber}.`
        },
    },
    messages: {
        foundPromotions(promotionCount, brandCount, storeCount) {
            return `Found ${promotionCount} promotions for ${brandCount} brands` + (storeCount > 0 ? ` in ${storeCount} stores.` : '.');
        },
        noPromotions: "Couldn't find any promotions.",
    }
}

var lang = translation["en"];