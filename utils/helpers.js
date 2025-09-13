/**
 * Debounces a function to limit the rate at which it gets called.
 * @param {Function} func The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Throttles a function to ensure it's called at most once in a specified period.
 * @param {Function} func The function to throttle.
 * @param {number} limit The throttle period in milliseconds.
 * @returns {Function} The throttled function.
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * A simple utility to log messages with a consistent prefix for better debugging.
 * @param {string} message The message to log.
 * @param {string} level The log level ('info', 'warn', 'error').
 */
function log(message, level = 'info') {
    const prefix = '[QuranRing]';
    switch (level) {
        case 'warn':
            console.warn(`${prefix} ${message}`);
            break;
        case 'error':
            console.error(`${prefix} ${message}`);
            break;
        default:
            console.log(`${prefix} ${message}`);
            break;
    }
}
