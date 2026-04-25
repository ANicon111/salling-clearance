/**
 * 
 * @param {*} name 
 * @param {*} value 
 * @param {*} expirationDays 
 */
function setCookie(name, value, expirationDays) {
    const d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

/**
 * 
 * @param {string} name
 * @returns {string}
 */
function getCookie(name) {
    name = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return decodeURIComponent(c.substring(name.length, c.length));
        }
    }
    return "";
}

/**
 * 
 * @param {string} value 
 * @returns {string}
 */
function utf8ToBase64(value) {
    if (value == null) return null;
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const binaryString = String.fromCharCode.apply(null, data);
    return btoa(binaryString);
}

/**
 * 
 * @param {string} value 
 * @returns {string}
 */
function base64ToUtf8(value) {
    if (value == null) return null;
    const binaryString = atob(value);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

/**
 * Parses a Danish date string: "09.37, 25. april 2026"
 * @param {string} dateStr 
 * @returns {Date|null}
 */
function parseDanishDate(dateStr) {
    // 1. Define Danish month mapping (lowercase for safety)
    const months = {
        'januar': 0, 'februar': 1, 'marts': 2, 'april': 3, 'maj': 4, 'juni': 5,
        'juli': 6, 'august': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
    };

    try {
        // 2. Clean and split the string using Regex
        // Matches digits and words, ignoring the comma and periods
        const parts = dateStr.toLowerCase().match(/(\d+)\.(\d+),\s+(\d+)\.\s+(\w+)\s+(\d+)/);

        if (!parts) return null;

        // parts[1] = hours, [2] = minutes, [3] = day, [4] = monthName, [5] = year
        const hours = parseInt(parts[1], 10);
        const minutes = parseInt(parts[2], 10);
        const day = parseInt(parts[3], 10);
        const monthIndex = months[parts[4]];
        const year = parseInt(parts[5], 10);

        // 3. Construct the Date object
        // Note: monthIndex is 0-based in JS
        return new Date(year, monthIndex, day, hours, minutes);

    } catch (e) {
        console.error("Invalid date format", e);
        return null;
    }
}