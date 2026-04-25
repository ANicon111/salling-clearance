/**
 *
 * @param {string} brand
 * @param {*} locations the values gotten from the leaflet hotspots
 * @returns {string} concrete image css
 */
function leafletCropSalling(brand, locations) {
    if (locations == null) return `style="  width: 100%; height: 100%; object-fit: contain;"`;
    let aspectRatio = Math.SQRT2; // assume A4
    switch (brand) {
        case "NETTO": aspectRatio = Math.SQRT2; break;
        case "BILKA": aspectRatio = 8 / 7; break;
        case "FØTEX": aspectRatio = 8 / 7; break;
    }
    if (brand == "NETTO") aspectRatio = Math.SQRT2; //cause why not
    const points = Object.values(locations)[0];
    let x1 = points[0][0];
    let x2 = points[2][0];
    let y1 = points[0][1];
    let y2 = points[2][1];
    const square = Math.max(x2 - x1, y2 - y1);
    x2 = x1 + square;
    y2 = y1 + square;
    if (x1 + square > 1) { x1 = 1 - square; x2 = 1; }
    if (y1 + square > aspectRatio) { y1 = aspectRatio - square; y2 = aspectRatio; }
    const dimension = config.thumbSize / square;
    const width = dimension;
    const height = dimension * aspectRatio;
    const top = y1 * dimension;
    const right = (1 - x2) * dimension;
    const bottom = (aspectRatio - y2) * dimension;
    const left = x1 * dimension;
    return `style="width:${width}px; height:${height}px; margin:-${top}px -${right}px -${bottom}px -${left}px;"`;
}

/**
 *
 * @param {string} brand
 * @param {string} largeImage the url of the image opened on click
 * @param {string} thumbImage the url of the thumbnail
 * @param {string} title product name / short description
 * @param {string} price product promotional price
 * @param {string} originalPrice original product price
 * @param {string} extraInfo any other source-specific info
 * @param {string} startDate start time of promotion / last update
 * @param {string} endDate end time of promotion
 * @param {*} leafletLocationsSalling extra crop info for the Salling leaflet
 * @param {boolean} smallImageZoom the zoom into the thumbnail image, disregarding the large image
 * @returns
 */
function productHTML(brand, largeImage, thumbImage, title, price, originalPrice, extraInfo, dateLine, leafletLocationsSalling = null, smallImageZoom = false) {
    const imageStyle = leafletCropSalling(brand, leafletLocationsSalling);
    return `
        <li class="productItem">
            <div class="productImage" onclick="openProductZoom(${smallImageZoom ? "this.children[0].src" : `'${largeImage || config.placeholderImage}'`});">
                <img src="${thumbImage || config.placeholderImage}"
                    onerror="this.onerror=null; this.src='${config.placeholderImage}';"
                    ${imageStyle}
                    alt="${title}">
            </div>
            <div>
                <strong>${title}</strong><br>
                <span class="priceDiscount">${price} DKK</span>
                ${originalPrice ? `<span class="priceRegular">${originalPrice} DKK</span>` : ''}
                <br>
                ${extraInfo}
                <small>
                    <br>${dateLine}
                </small>
            </div>
        </li>
    `;
}
