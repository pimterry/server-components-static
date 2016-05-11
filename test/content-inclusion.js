var expect = require('chai').expect;

var serverComponents = require("server-components");
var serverComponentsStatic = require("../src/index.js");

function body(content) {
    return "<html><head></head><body>" + content + "</body></html>";
}

function createElement(elementName, onCreated) {
    var Element = serverComponents.newElement();
    Element.createdCallback = onCreated;
    serverComponents.registerElement(elementName, { prototype: Element });
}

describe("Server Component Static inclusion", () => {
    it("can include a CSS file", () => {
        createElement("my-element", function () {
            serverComponentsStatic.includeCSS(this.ownerDocument, "/styles.css");
        });

        return serverComponents.render(
            body("<my-element></my-element>")
        ).then((output) => {
            expect(output).to.contain('<head><link rel="stylesheet" href="/styles.css"></head>');
        });
    });

    it("can include a JS file", () => {
        createElement("my-element", function () {
            serverComponentsStatic.includeScript(this.ownerDocument, "/script.js");
        });

        return serverComponents.render(
            body("<my-element></my-element>")
        ).then((output) => {
            expect(output).to.contain('<head><script type="text/javascript" src="/script.js"></script></head>');
        });
    });

    it("doesn't duplicate CSS dependencies", () => {
        createElement("my-element", function () {
            serverComponentsStatic.includeCSS(this.ownerDocument, "/styles.css");
        });

        return serverComponents.render(
            body("<my-element></my-element><my-element></my-element")
        ).then((output) => {
            expect(output).to.contain('<head><link rel="stylesheet" href="/styles.css"></head>');
        });
    });

    it("doesn't duplicate JS dependencies", () => {
        createElement("my-element", function () {
            serverComponentsStatic.includeScript(this.ownerDocument, "/script.js");
        });

        return serverComponents.render(
            body("<my-element></my-element><my-element></my-element")
        ).then((output) => {
            expect(output).to.contain('<head><script type="text/javascript" src="/script.js"></script></head>');
        });
    });
});
