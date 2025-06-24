// src/convert.mjs

// Unit conversion helpers
export function msToMph(ms) {
    return ms * 2.23694;
}

export function msToKmh(ms) {
    return ms * 3.6;
}

export function hpaToInHg(hpa) {
    return hpa * 0.02953;
}
