function loadUserData() {
    url = new URL(window.location.href);
    document.getElementById('storeList').value = base64ToUtf8(url.searchParams.get("store-list")) || getCookie("store-list");
    document.getElementById('productKeywords').value = base64ToUtf8(url.searchParams.get("product-keywords")) || getCookie("product-keywords");
}

function saveUserData() {
    setCookie('store-list', document.getElementById('storeList').value, 365);
    setCookie('product-keywords', document.getElementById('productKeywords').value, 365);
}

function exportUserDataToClipboard() {
    navigator.clipboard.writeText(`${window.location.href}?store-list=${utf8ToBase64(document.getElementById('storeList').value)}&product-keywords=${utf8ToBase64(document.getElementById('productKeywords').value)}`);
    document.getElementById('exportButton').disabled = true
    setTimeout(() => {
        document.getElementById('exportButton').disabled = false
    }, 250);
}

/**
 * 
 * @param {string} src 
 */
function openProductZoom(src) {
    document.getElementById('zoomedImage').src = src;
    document.getElementById('zoomOverlay').classList.add('active');
}

/**
 * 
 * @param {string} brand
 * @returns {string}
 */
function validateBrand(brand) {
    switch (brand.toUpperCase()) {
        case "FOETEX":
        case "FOTEX":
        case "FØTEX": return "FØTEX";
        case "BILKA": return "BILKA";
        case "NETTO": return "NETTO";
        default: return null;
    }
}

/**
 * 
 * @param {string} line 
 * @returns {[string,string]}
 */
function validateStoreLine(line) {
    try {
        const colonSeparated = line.split(':');
        const brand = validateBrand(colonSeparated[0].trim());
        let location = null;
        if (colonSeparated.length > 1) location = colonSeparated[1]
        return [brand, location];
    }
    catch {
        return [null, null];
    }
}

/**
 * 
 * @param {string} url 
 * @param {string | null} headers 
 */
async function genericGet(url, headers) {
    const response = await fetch(url, {
        method: "GET",
        headers: headers
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

/**
 * 
 * @param {string} url 
 */
async function apiGet(url) {
    return genericGet(url,
        {
            "Accept-Encoding": "text/json",
        }
    );
}

/**
 * 
 * @param {string} url 
 * @param {string} tenantAlias 
 */
async function tenantApiGet(url, tenantAlias) {
    return genericGet(url,
        {
            "Accept-Encoding": "text/json",
            "X-tenantAlias": tenantAlias,
        }
    );
}

function resetMessages() {

}

/**
 * 
 * @param {string} message 
 */
function addMessage(message) {
    document.getElementById('resultMessages').innerHTML += `<p class="message">${message}</p>`;
}

/**
 * 
 * @param {string} warning 
 */
function addWarning(warning) {
    document.getElementById('resultMessages').innerHTML += `<p class="warning">${lang.warningPrefix}: ${warning}</p>`;
}

/**
 * 
 * @param {string} error 
 */
function addError(error) {
    document.getElementById('resultMessages').innerHTML += `<p class="error">${lang.errorPrefix}: ${error}</p>`;
}

let brandAllStoreList = {};
/**
 * 
 * @param {string} brand 
 * @param {string} location
 * @returns {Array}
 */
function getStores(brand, location) {
    location = location.toLowerCase().trim();
    return brandAllStoreList[brand].filter(
        store => (store.address?.city || '').toLowerCase().includes(location)
            || (store.name || '').toLowerCase().includes(location)
    ).slice(0, 3);
}

/**
 * 
 * @param {SubmitEvent} event 
 */
async function search(event) {
    event.preventDefault();
    const storeListLines = document.getElementById('storeList').value.split('\n');
    const searchButton = document.getElementById('searchButton');
    const productKeywords = document.getElementById('productKeywords').value;
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = "";
    document.getElementById('resultMessages').innerHTML = "";
    searchButton.disabled = true;
    searchButton.textContent = lang.searching;
    const brandStoreList = {};

    // get matched stores
    for (let i = 0; i < storeListLines.length; i++) {
        const line = storeListLines[i];
        const [brand, location] = validateStoreLine(line);

        if (brand == null) {
            addError(lang.errors.invalidBrand(line, i + 1));
            continue;
        }

        if (brandAllStoreList[brand] == null) {
            brandAllStoreList[brand] = await tenantApiGet("https://p-club.dsgapps.dk/api/cp/stores", config.aliases[brand]);
        }

        if (brandStoreList[brand] == null) {
            brandStoreList[brand] = {};
        }


        if (location != null) {
            const stores = getStores(brand, location);
            if (stores.length == 0) {
                addWarning(lang.warnings.noStoreMatches(line, i + 1));
            }
            for (let j = 0; j < stores.length; j++) {
                const store = stores[j];
                brandStoreList[brand][store.id] = store;
            }
        }
    }

    const brandList = Object.keys(brandStoreList)
    let totalProducts = 0;
    let totalStores = 0;
    for (let i = 0; i < brandList.length; i++) {
        const brand = brandList[i];

        const productList = [];

        // get leaflet promotions
        try {
            const leafletsOrder = await tenantApiGet('https://p-club.dsgapps.dk/api/cp/leafletsOrder', config.aliases[brand]);

            const leaflet = leafletsOrder.leafletIds[brand == "BILKA" ? 1 : 0];

            const leafletPages = await apiGet(`https://squid-api.tjek.com/v2/catalogs/${leaflet}/pages`);


            const promotions = await apiGet(`https://squid-api.tjek.com/v2/catalogs/${leaflet}/hotspots`);

            const filteredProducts = promotions.filter(product =>
                product.offer.heading && (
                    productKeywords.trim() == ""
                    || productKeywords.toLowerCase().split(',')
                        .map(keyword => keyword.trim())
                        .some(keyword => product.offer.heading.toLowerCase().includes(keyword))
                )
            );

            if (filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    productList.push(productHTML(
                        brand,
                        leafletPages[Object.keys(product.locations)[0] - 1]?.view || 'product.png',
                        leafletPages[Object.keys(product.locations)[0] - 1]?.thumb || 'product.png',
                        product.offer.heading,
                        product.offer.pricing.price,
                        product.offer.pricing.pre_price,
                        `${product.offer.quantity.size.from} ${product.offer.quantity.unit.symbol}, ${(product.offer.pricing.price / product.offer.quantity.size.from / product.offer.quantity.unit.si.factor).toFixed(2)} DKK/${product.offer.quantity.unit.si.symbol}`,
                        product.offer.run_from,
                        product.offer.run_till,
                        product.locations
                    ))
                });
            }
        } catch (e) {
            addError(lang.errors.failedLeaflet(brand));
            throw e
        }

        //get local prices
        storeList = Object.values(brandStoreList[brand]);
        totalStores += storeList.length;
        for (let j = 0; j < storeList.length; j++) {
            const store = storeList[j];

            try {
                const storeData = await tenantApiGet(`https://p-club.dsgapps.dk/api/cp/lpr/clearanceItems?id=${store.id}`, config.aliases[brand]);

                const items = storeData.clearanceItems || [];

                const filteredProducts = items.filter(product =>
                    product.titleTxt && (!productKeywords || productKeywords.split(',').some(keyword => product.titleTxt.toLowerCase().includes(keyword.trim())))
                );

                if (filteredProducts.length > 0) {
                    filteredProducts.forEach(product => {
                        productList.push(productHTML(
                            brand,
                            product.imageUrl || 'product.png',
                            product.imageUrl || 'product.png',
                            product.titleTxt,
                            product.discountedPrice,
                            product.regularPrice,
                            lang.availableProducts(product.availabilityRangeTxt.split(' ')[0], product.rangeColorHex, storeData.storeNameTxt || store.name, store.address.city),
                            product.lastUpdateTxt,
                            null,
                            null,
                            true
                        ))
                    });
                }
            } catch (e) {
                addError(lang.errors.failedLocal(store.name, store.address.city));
                throw e;
            }
        }

        if (productList.length > 0) {
            totalProducts += productList.length;
            resultContent.innerHTML += `<div class="store-header">${brand}</div>`;
            resultContent.innerHTML += productList.join('');
        } else {
            addWarning(lang.warnings.noPromotions(brand, productKeywords));
        }
    }

    if (totalProducts > 0) {
        addMessage(lang.messages.foundPromotions(totalProducts, brandList.length, totalStores));
    } else {
        addMessage(lang.messages.noPromotions)
    }

    searchButton.disabled = false;
    searchButton.textContent = lang.search;
}

/**
 * 
 * @param {string} language
 */
function pageInit() {
    setCookie("preferred-language", document.documentElement.lang, 365);
    loadUserData();
    window.history.replaceState(null, '', window.location.pathname);
    document.getElementById('searchForm').addEventListener('submit', async (event) => { await search(event) });
}