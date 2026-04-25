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

function cleanLocalStorage() {
    const deleteList = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = JSON.parse(localStorage.getItem(key));
        if (new Date(value.expiry) < new Date()) {
            deleteList.push(key);
        }
    }
    for (let i = 0; i < deleteList.length; i++) {
        localStorage.removeItem(deleteList[i]);
    }
}

/**
 * 
 * @param {string} url 
 * @param {*} headers 
 * @param {number} [validForSeconds=0] 
 */
async function genericGet(url, headers, validForSeconds = 5) {
    const time = new Date();
    const cacheID = `get-${url}-${Object.keys(headers).join('_')}-${Object.values(headers).join('_')}`;
    const getCache = JSON.parse(localStorage.getItem(cacheID));
    if (getCache != null) {
        return getCache.value;
    }
    const response = await fetch(url, {
        method: "GET",
        headers: headers
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    result = await response.json()
    if (validForSeconds > 0) {
        localStorage.setItem(cacheID, JSON.stringify({
            value: result,
            expiry: new Date(time.getTime() + validForSeconds * 1000),
        }));
    }
    return result;
}

/**
 * 
 * @param {string} url 
 * @param {number} [validForSeconds=0] 
 */
async function apiGet(url, validForSeconds = 5) {
    return genericGet(
        url,
        {
            "Accept-Encoding": "text/json",
        },
        validForSeconds
    );
}

/**
 * 
 * @param {string} url 
 * @param {string} tenantAlias 
 * @param {number} [validForSeconds=0] 
 */
async function tenantApiGet(url, tenantAlias, validForSeconds = 5) {
    return genericGet(
        url,
        {
            "Accept-Encoding": "text/json",
            "X-tenantAlias": tenantAlias,
        },
        validForSeconds
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

const brandAllStoreList = {};
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
    event?.preventDefault();
    const storeListLines = document.getElementById('storeList').value.split('\n');
    const searchButton = document.getElementById('searchButton');
    const productKeywords = document.getElementById('productKeywords').value;
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = "";
    document.getElementById('resultMessages').innerHTML = "";
    searchButton.disabled = true;
    searchButton.textContent = lang.searching;
    const brandStoreList = {};

    cleanLocalStorage();

    // get matched stores
    for (let i = 0; i < storeListLines.length; i++) {
        const line = storeListLines[i];
        const [brand, location] = validateStoreLine(line);

        if (brand == null) {
            addError(lang.errors.invalidBrand(line, i + 1));
            continue;
        }


        brandAllStoreList[brand] = await tenantApiGet("https://p-club.dsgapps.dk/api/cp/stores", config.aliases[brand], 3600);


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

            const leafletPages = await apiGet(`https://squid-api.tjek.com/v2/catalogs/${leaflet}/pages`, 3600);


            const promotions = await apiGet(`https://squid-api.tjek.com/v2/catalogs/${leaflet}/hotspots`, 3600);

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
                    const pricePerUnit = product.offer.pricing.price / product.offer.quantity.size.from / product.offer.quantity.unit.si.factor;
                    productList.push({
                        html: productHTML(
                            brand,
                            leafletPages[Object.keys(product.locations)[0] - 1]?.view || 'product.png',
                            leafletPages[Object.keys(product.locations)[0] - 1]?.thumb || 'product.png',
                            product.offer.heading,
                            product.offer.pricing.price.toPrecision(3),
                            product.offer.pricing.pre_price?.toPrecision(3),
                            `${product.offer.quantity.size.from} ${product.offer.quantity.unit.symbol}, ${(pricePerUnit).toFixed(2)} DKK/${product.offer.quantity.unit.si.symbol}`,
                            lang.availableBetween(
                                product.offer.run_from.split('T')[0],
                                product.offer.run_till.split('T')[0]
                            ),
                            product.locations
                        ),
                        pricePerKilo: ["kg", "l"].includes(product.offer.quantity.unit.si.symbol)
                            ? (pricePerUnit).toFixed(2) : config.priceThreshold,
                        price: product.discountedPrice,
                        amountAvailable: 6,
                    })
                });
            }
        } catch (e) {
            addError(lang.errors.failedLeaflet(brand));
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
                        const availability = product.availabilityRangeTxt.split(' ');
                        productList.push({
                            html: productHTML(
                                brand,
                                product.imageUrl || 'product.png',
                                product.imageUrl || 'product.png',
                                product.titleTxt,
                                product.discountedPrice.toPrecision(2),
                                product.regularPrice.toPrecision(2),
                                lang.availableProducts(availability.slice(0, availability.length - 1).join(' '), product.rangeColorHex, storeData.storeNameTxt || store.name, store.address.city),
                                `${lang.lastUpdate}: ${parseDanishDate(product.lastUpdateTxt.split(':')[1].trim()).toISOString().replace('T', ' ').split(':').slice(0, 2).join(':')}`,
                                null,
                                true
                            ),
                            pricePerKilo: config.priceThreshold,
                            price: product.discountedPrice,
                            amountAvailable: availability.slice(availability.length - 2, availability.length - 1)[0].split('-')[0],
                        })
                    });
                }
            } catch (e) {
                addError(lang.errors.failedLocal(store.name, store.address.city));
            }
        }

        productList.sort((a, b) => {
            if (a.amountAvailable != b.amountAvailable) return b.amountAvailable - a.amountAvailable;
            if (a.pricePerKilo != b.pricePerKilo) return a.pricePerKilo - b.pricePerKilo;
            if (a.price != b.price) return a.price - b.price;
            return 0
        })
        if (productList.length > 0) {
            totalProducts += productList.length;
            resultContent.innerHTML += `<div class="storeHeader"><h3>${brand}</h3></div>`;
            resultContent.innerHTML += productList.map(e => e.html).join('');
        } else {
            addWarning(lang.warnings.noPromotions(brand, productKeywords));
        }
    }

    if (totalProducts > 0) {
        addMessage(lang.messages.foundPromotions(totalProducts, brandList.length, totalStores));
        window.scroll({
            top: resultContent.getBoundingClientRect().top + window.scrollY,
            behavior: "smooth",
        })
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
    if (document.getElementById('storeList').value) {
        search(null);
        saveUserData();
    }
    window.history.replaceState(null, '', window.location.pathname);
    document.getElementById('searchForm').addEventListener('submit', async (event) => { await search(event) });
}