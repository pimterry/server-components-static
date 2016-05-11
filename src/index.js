var urlJoin = require("url-join");
var serverComponents = require("server-components");

/**
 * The base path to use for all static content.
 *
 * This can be a relative or absolute URL, and is used to calculate
 * resource paths for getUrl() later on.
 *
 * It's set to /components by default, and results in paths like:
 * "/components/component-name/style.css"
 */
exports.contentBase = "/components";

/**
 * This is a convenient helper method to curry the first component name argument
 * for subsequent calls to getUrl.
 */
exports.forComponent = function (componentName) {
    return {
        getUrl: (filePath) => exports.getUrl(componentName, filePath)
    };
};

/**
 * Gets the public facing URL for a file path within the given component.
 *
 * The URL returned may be relative or absolute, depending on your
 * serverComponentsStatic.contentBase configuration.
 *
 * By default, this will be of the form '/components/component-name/file-path'.
 */
exports.getUrl = function(componentName, filePath) {
    if (componentName === undefined) throw new Error("Component name required");
    if (filePath === undefined) throw new Error("File path required");

    return urlJoin(exports.contentBase, componentName, filePath);
};
