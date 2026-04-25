translation["da"] = {
    title: "Salling Tilbudsjæger",
    errorPrefix: "FEJL",
    search: "Søg",
    searching: "Søger...",
    availableProducts(count, countColor, store, location) {
        return `<span style="color: ${countColor}; font-weight: bold;">${count}</span> tilgængelig i <strong>${store}${location != null ? ` (${location})` : ''}</strong>.`;
    },
    errors: {
        failedLocal(store, location) {
            return `Kunne ikke hente lokale priser for ${store}${location != null ? ` (${location})` : ''}.`;
        },
        failedLeaflet(brand) {
            return `Kunne ikke hente tilbudsaviser for ${brand}.`;
        },
        invalidBrand(lineText, lineNumber) {
            return `Ugyldigt brand på linje "${lineText}" (nummer ${lineNumber}).`;
        },
    },
    warningPrefix: "Advarsel",
    warnings: {
        noPromotions(brand, keywords) {
            return `Kunne ikke finde nogen tilbud for ${brand}, der matcher ${keywords}.`;
        },
        noStoreMatches(lineText, lineNumber) {
            return `Kunne ikke finde nogen lokale butikker, der matcher "${lineText}" på linje ${lineNumber}.`;
        },
    },
    messages: {
        foundPromotions(promotionCount, brandCount, storeCount) {
            return `Fandt ${promotionCount} tilbud for ${brandCount} brands` + (storeCount > 0 ? ` i ${storeCount} butikker.` : '.');
        },
        noPromotions: "Kunne ikke finde nogen tilbud.",
    }
}

lang = translation["da"];