var path = require("path");
var expect = require('chai').expect;

var components = require("server-components");
var componentsStatic = require("../src/index.js");

// Register 'this-test-file' here, ensuring that this folder is considered the
// root for that component
components.registerElement("this-test-file");
const ABSOLUTE_COMPONENT_PATH = __dirname;

describe("Server Component Static paths", () => {
    it("should return an absolute path", () => {
        var filepath = componentsStatic.getPath("this-test-file", "style.css");
        expect(path.isAbsolute(filepath)).to.equal(true);
    });

    it("should return paths relative to the registering file", () => {
        var filepath = componentsStatic.getPath("this-test-file", "style.css");
        expect(filepath).to.equal(path.join(ABSOLUTE_COMPONENT_PATH, "static", "style.css"));
    });

    it("does not allow you to escape the static root", () => {
        expect(() => {
            componentsStatic.getPath("this-test-file", "../../../etc/passwd");
        }).to.throw(/Cannot get static file paths outside the component's static folder/);
    });

    it("does not allow you to find content for unregistered elements", () => {
        expect(() => {
            componentsStatic.getPath("nonexistent-element", "style.css");
        }).to.throw(/Cannot get static file paths for unregistered elements/);
    });
});
