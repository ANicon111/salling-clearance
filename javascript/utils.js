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