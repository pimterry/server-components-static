var path = require("path");
var isPathInside = require("path-is-inside");

var _ = require("lodash");
var urlJoin = require("url-join");

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
        getUrl: exports.getUrl.bind(null, componentName),
        getPath: exports.getPath.bind(null, componentName),
        setPath: exports.setPath.bind(null, componentName)
    };
};

/**
 * Gets the public facing URL for a file path within the given component.
 *
 * The URL returned may be relative or absolute, depending on your
 * componentsStatic.baseUrl configuration.
 *
 * By default, this will be of the form '/components/component-name/file-path'.
 */
exports.getUrl = function(componentName, filePath) {
    if (componentName === undefined) throw new Error("Component name required");
    if (filePath === undefined) throw new Error("File path required");

    return urlJoin(exports.baseUrl, componentName, filePath);
};

var componentPaths = {};
exports.setPath = function (componentName, rootStaticFilePath /* , ...more parts */) {
    var pathParts = [].slice.call(arguments, 1);
    componentPaths[componentName] = path.resolve.apply(null, pathParts);
};

exports.getPath = function(componentName, relativeFilePath /* , ...more parts */) {
    if (componentPaths[componentName] === undefined) {
        throw new Error("Cannot get static file paths for unregistered elements");
    }

    var componentRootPath = componentPaths[componentName];
    var pathParts = [componentRootPath].concat([].slice.call(arguments, 1));
    var fullFilePath = path.normalize(path.join.apply(null, pathParts));

    if (!isPathInside(fullFilePath, componentRootPath) || fullFilePath === componentRootPath) {
        throw new Error("Cannot get static file paths outside the component's configured folder");
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
