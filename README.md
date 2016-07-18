# Server Components Static [![Travis Build Status](https://img.shields.io/travis/pimterry/server-components-static.svg)](https://travis-ci.org/pimterry/server-components-static)
Static content handling plugin for Server Components

## Outline

This is an extension to [Server Components](http://pimterry.github.io/server-components), adding
utilities that are likely to be useful when building components that need to include static content
on the client-side.

It provides a mechanism to derive the URLs to use to reference a file on the client side, and tools
to add `<script>` and `<link>` tags to the document, without duplication, to load page wide assets.

**Server Components is still in its early stages, and all of this is subject to lots of change**

## Normal Usage

**When writing a component:**

```javascript
var components = require("server-components");
var componentsStatic = require("server-components-static");

// Set the root path for your component's static content
var myContent = componentsStatic.forComponent("my-component");
myContent.setPath(__dirname, 'public');

var Element = components.newElement();
Element.createdCallback = function () {
    // Include your static content, using content.getUrl to obtain URL mappings for it
    componentsStatic.includeCSS(this.ownerDocument, myContent.getUrl("styles.css"));
    componentsStatic.includeScript(this.ownerDocument, myContent.getUrl("my-script.js"));

    var image = this.ownerDocument.createElement("img");
    image.src = myContent.getUrl("my-image.png");
    this.appendChild(image);
};

components.registerElement("my-component", { prototype: Element });
```

`components.render("<html><body><my-component></my-component></body></html>")` then returns:

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

Note that this code doesn't ensure /components/* URLs resolve back to the correct path for your
component's static content on your server. Configuration to do that will depend on the server used
at runtime when your component is included; see 'when using components' below.

**When using components:**

When using components that reference static content, you need to ensure your server handles the URLs
they request and routes those requests correctly to the relevant content for that component.

To do this there are a few options:

* If you're using Express, [Server-Components-Express](https://github.com/pimterry/server-components-express)
handles all of this for you. (This should be easy to write for more frameworks too, if you're interested. Get involved!)

* If you're not, you can route these requests by hand. Catch requests to `/components/component-name/file-path`
and use `componentsStatic.getPath(componentName, filePath)` to get the path on disk to your
static content.

* Alternatively, you can manually copy all the static content out of your components into your existing
static content paths, set `componentsStatic.baseUrl` to point to that, and ignore the problem of routing
requests into disparate standalone component folders entirely.

## API Documentation

* `componentsStatic.baseUrl`

  The base URL to use for all static content.

  This can be a relative or absolute URL, and is used to calculate
  resource paths for `getUrl()` later on.

  It's set to /components by default, and results in URLs like:
  `/components/component-name/style.css`

* `componentsStatic.getUrl(componentName, filePath)`

  Gets the public facing URL for a file path within the given component. The URL returned may be
  relative or absolute, depending on your `componentsStatic.baseUrl` configuration.

  By default, this will be of the form '/components/component-name/file-path'.

* `componentsStatic.setPath(componentName, filePath)`

  Sets the root path for the given component name. Later calls to getPath will be relative to this
  path

* `componentsStatic.getPath(componentName, filePath, [...more path parts])`

  Returns the absolute path on disk to static content that for the concatenated paths specified,
  relative to the definition of the component with name `componentName`.

  For example, if you call `componentsStatic.setPath("my-component", "/path/my-component", "public")`
  then `components.getPath('my-component', 'style.css')` will return
  `/path/my-component/public/style.css`.

  `getPath()` ensures that no paths outside the configured file path for this component are ever returned.

* `componentsStatic.for(componentName)`

  Convenience method to curry the first argument to getUrl and getPath. This returns an object with
  getUrl, setPath and getPath methods method identical to the ones above, but not needing the first argument.

  A useful pattern is:

  ```javascript
  var staticContent = componentsStatic.for("my-custom-element");
  staticContent.setPath(__dirname, "static");

  ...

  var imageUrl = staticContent.getUrl("my-image.png");
  var imagePath = staticContent.getPath("my-image.png");
  ```

* `componentsStatic.includeScript(document, scriptUrl)`

  Ensures the given document includes a script tag in its head loading the
  given URL. If not already present, the tag will be appended to the head.

  If already present, this is a no-op; exactly matching URLs will not be
  duplicated.

  The current document object can be obtained inside components callbacks as `this.ownerDocument`.

* `componentsStatic.includeCSS(document, cssUrl)`

  Ensures the given document includes a link in its head loading CSS from
  the given URL. If not already present, the tag will be appended to the head.

  If already present, this is a no-op; exactly matching URLs will not be
  duplicated.

  The current document object can be obtained inside component callbacks as `this.ownerDocument`.  
