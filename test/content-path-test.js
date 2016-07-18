var path = require("path");
var expect = require('chai').expect;

var components = require("server-components");
var componentsStatic = require("../src/index.js");

describe("Server Component Static path lookup", () => {
    describe("when set", () => {
        beforeEach(() => componentsStatic.forComponent("test-component").setPath(__dirname));

        it("should return an absolute path", () => {
            var filepath = componentsStatic.getPath("test-component", "style.css");
            expect(path.isAbsolute(filepath)).to.equal(true);
        });

        it("should return paths relative to the given path", () => {
            var filepath = componentsStatic.getPath("test-component", "style.css");
            expect(filepath).to.equal(path.join(__dirname, "style.css"));
        });

        it("should accept multiple parts pre-concatenated", () => {
            var filepath = componentsStatic.getPath("test-component", "css/style.css");
            expect(filepath).to.equal(path.join(__dirname, "css", "style.css"));
        });

        it("should accept multiple path parts as separate arguments", () => {
            var filepath = componentsStatic.getPath("test-component", "css", "style.css");
            expect(filepath).to.equal(path.join(__dirname, "css", "style.css"));
        });

        it("does not allow you to escape the static root", () => {
            expect(() => {
                componentsStatic.getPath("test-component", "../etc/passwd");
            }).to.throw(/Cannot get static file paths outside the component's configured folder/);
        });

        it("does not allow you to serve the static root", () => {
            expect(() => {
                componentsStatic.getPath("test-component", ".");
            }).to.throw(/Cannot get static file paths outside the component's configured folder/);
        });
    });

    it("does not allow you to find content for unregistered elements", () => {
        expect(() => {
            componentsStatic.getPath("nonexistent-element", "style.css");
        }).to.throw(/Cannot get static file paths for unregistered elements/);
    });

    it("does not allow you to find content for registered elements without a path specified", () => {
        components.registerElement("another-test-component");

        expect(() => {
            componentsStatic.getPath("another-test-component", "style.css");
        }).to.throw(/Cannot get static file paths for unregistered elements/);
    });
});
