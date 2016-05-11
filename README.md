# Server Components Static [![Travis Build Status](https://img.shields.io/travis/pimterry/server-components-static.svg)](https://travis-ci.org/pimterry/server-components-static)
Static content handling plugin for Server Components

## Outline

This is an extension to [Server Components](http://pimterry.github.io/server-components), adding
utilities that are likely to be useful when building components that need to include static content
on the client-side.

It provides a mechanism to derive the URLs to use to reference a file on the client side, and tools
to add `<script>` and `<link>` tags to the document, without duplication, to load page wide assets.

**Server Components is still in its early stages, and all of this is subject to lots of change**

## Basic Usage

**In a component:**

```javascript
var serverComponents = require("server-components");

var serverComponentsStatic = require("./src/index.js"); // TODO
var staticContent = serverComponentsStatic.forComponent("my-component");

var Element = serverComponents.newElement();
Element.createdCallback = function () {
    serverComponentsStatic.includeCSS(this.ownerDocument, staticContent.getUrl("styles.css"));
    serverComponentsStatic.includeScript(this.ownerDocument, staticContent.getUrl("my-script.js"));

    var image = this.ownerDocument.createElement("img");
    image.src = staticContent.getUrl("my-image.png");
    this.appendChild(image);
};

serverComponents.registerElement("my-component", { prototype: Element });
```

`serverComponents.render("<html><body><my-component></my-component></body></html>")` then returns:

```html
<html>
<head>
    <link rel="stylesheet" href="/components/my-component/styles.css">
    <script type="text/javascript" src="/components/my-component/my-script.js"></script>
</head>
<body>
    <my-component>
        <img src="/components/my-component/my-image.png">
    </my-component>
</body>
</html>
```

Note that this code does not ensure that /components URLs actually resolve to the correct path
for your component's static content on your server. Configuration to do that will depend on the
server used at runtime when your component is included.

**When using components:**

When using components that reference static content, you need to ensure your server handles the URLs
they request and routes those requests correctly to the relevant content for that component.

To do this there are a few options:

* If you're using Express, [Server-Components-Express](https://github.com/pimterry/server-components-express)
handles all of this for you. (This should be easy to write for more frameworks too, if you're interested. Get involved!)

* If you're not, you can route these requests by hand. Catch requests to `/components/component-name/file-path`
and use `serverComponentsStatic.getPath(componentName, filePath)` to get the path on disk to your
static content.

* Alternatively, you can manually copy all the static content out of your components into your existing
static content paths, set `serverComponents.baseUrl` to point to that, and ignore the problem of routing
requests into disparate standalone component folders entirely.

## API Documentation

* `serverComponentsStatic.baseUrl`

  The base URL to use for all static content.

  This can be a relative or absolute URL, and is used to calculate
  resource paths for `getUrl()` later on.

  It's set to /components by default, and results in URLs like:
  `/components/component-name/style.css`

* `serverComponentsStatic.getUrl(componentName, filePath)`

  Gets the public facing URL for a file path within the given component. The URL returned may be
  relative or absolute, depending on your `serverComponentsStatic.baseUrl` configuration.

  By default, this will be of the form '/components/component-name/file-path'.

* `serverComponentsStatic.getPath(componentName, filePath)`

  Returns the absolute path on disk to static content that is at `filePath`, relative to the
  definition of the component with name `componentName`.

  Currently this is always `filePath` relative to the component's `static` folder, which is expected
  to be in the same location as the script file that registers the component.

  For example, if `/project-root/node_modules/my-component-a-package/index.js` registers
  'component-a', then `serverComponents.getPath('component-a', 'style.css')` will return
  `/project-root/node_modules/my-package/static/style.css`.

  In future this location will be configurable per-component. If you just call this method though,
  you don't need to care about that.

* `serverComponentsStatic.for(componentName)`

  Convenience method to curry the first argument to getUrl and getPath. This returns an object with
  getUrl and getPath methods method identical to the ones above, but not needing the first argument.

  A useful pattern is:

  ```javascript
  var staticContent = serverComponentsStatic.for("my-custom-element");

  ...

  var imageUrl = staticContent.getUrl("my-image.png");
  var imagePath = staticContent.getPath("my-image.png");
  ```

* `serverComponents.includeScript(document, scriptUrl)`

  Ensures the given document includes a script tag in its head loading the
  given URL. If not already present, the tag will be appended to the head.

  If already present, this is a no-op; exactly matching URLs will not be
  duplicated.

  The current document object can be obtained inside components callbacks as `this.ownerDocument`.

* `serverComponents.includeCSS(document, cssUrl)`

  Ensures the given document includes a link in its head loading CSS from
  the given URL. If not already present, the tag will be appended to the head.

  If already present, this is a no-op; exactly matching URLs will not be
  duplicated.

  The current document object can be obtained inside component callbacks as `this.ownerDocument`.  
