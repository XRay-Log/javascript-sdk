const XRayLogger = require('./XRayLogger');

let defaultLogger = null;
let defaultOptions = {
    hostType: XRayLogger.HOST_TYPES.LOCAL
};

function setDefaultOptions(options) {
    defaultOptions = { ...defaultOptions, ...options };
    defaultLogger = null;
}

function xray(level = 'info', payload = null) {
    if (!defaultLogger) {
        defaultLogger = new XRayLogger('default', defaultOptions);
    }
    return defaultLogger.log(level, payload);
}

module.exports = {
    XRayLogger,
    xray,
    setDefaultOptions
};
