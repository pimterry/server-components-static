var path = require("path");

var _ = require("lodash");
var callsite = require("callsite");
var urlJoin = require("url-join");

var serverComponents = require("server-components");

/**
 * The base URL to use for all static content.
 *
 * This can be a relative or absolute URL, and is used to calculate
 * resource paths for getUrl() later on.
 *
 * It's set to /components by default, and results in URLs like:
 * "/components/component-name/style.css"
 */
exports.baseUrl = "/components";

/**
 * This is a convenient helper method to curry the first component name argument
 * for subsequent calls to getUrl.
 */
exports.forComponent = function (componentName) {
    return {
        getUrl: (filePath) => exports.getUrl(componentName, filePath),
        getPath: (filePath) => exports.getPath(componentName, filePath)
    };
};

/**
 * Gets the public facing URL for a file path within the given component.
 *
 * The URL returned may be relative or absolute, depending on your
 * serverComponentsStatic.baseUrl configuration.
 *
 * By default, this will be of the form '/components/component-name/file-path'.
 */
exports.getUrl = function(componentName, filePath) {
    if (componentName === undefined) throw new Error("Component name required");
    if (filePath === undefined) throw new Error("File path required");

    return urlJoin(exports.baseUrl, componentName, filePath);
};

// Patch registerElement to track component paths
var componentPaths = {};
var originalRegisterElement = serverComponents.registerElement;
serverComponents.registerElement = function (componentName) {
    var result = originalRegisterElement.apply(this, arguments);

    // Ok, so this bit's a little crazy: we're parsing the stack to find the
    // component registration location. Pretty neat though.
    var componentFileName = callsite()[1].getFileName();
    var componentDir = path.dirname(componentFileName);

    componentPaths[componentName] = path.normalize(path.resolve(path.join(componentDir)));

    return result;
};

exports.getPath = function(componentName, relativeFilePath) {
    if (componentPaths[componentName] === undefined) {
        throw new Error("Cannot get static file paths for unregistered elements");
    }

    var componentStaticPath = path.join(componentPaths[componentName], "static");

    var fullFilePath = path.normalize(path.join(componentStaticPath, relativeFilePath));

    if (!fullFilePath.startsWith(componentStaticPath)) {
        throw new Error("Cannot get static file paths outside the component's static folder");
    } else {
        return fullFilePath;
    }
};

function findChild(parent, matchingFunction) {
    return _.find(parent.childNodes, matchingFunction);
}

/**
 * Ensures the given document includes a script tag in its head loading the
 * given URL. If not already present, the tag will be appended to the head.
 *
 * If already present, this is a no-op; exactly matching URLs will not be
 * duplicated.
 */
exports.includeScript = function(document, scriptUrl) {
    var headElement = document.querySelector("head");

    var isScriptElementForUrl = (node) => {
        return node.tagName === "SCRIPT" && node.getAttribute("src") === scriptUrl;
    };

    if (!findChild(headElement, isScriptElementForUrl)) {
        var newScriptElement = document.createElement("script");
        newScriptElement.setAttribute("type", "text/javascript");
        newScriptElement.setAttribute("src", scriptUrl);
        headElement.appendChild(newScriptElement);
    }
};

/**
 * Ensures the given document includes a link in its head loading CSS from
 * the given URL. If not already present, the tag will be appended to the head.
 *
 * If already present, this is a no-op; exactly matching URLs will not be
 * duplicated.
 */
exports.includeCSS = function(document, cssUrl) {
    var headElement = document.querySelector("head");

    var isLinkElementForUrl = (node) => {
        return node.tagName === "LINK" && node.getAttribute("href") === cssUrl;
    };

    if (!findChild(headElement, isLinkElementForUrl)) {
        var newLinkElement = document.createElement("link");
        newLinkElement.setAttribute("rel", "stylesheet");
        newLinkElement.setAttribute("href", cssUrl);
        headElement.appendChild(newLinkElement);
    }
};
