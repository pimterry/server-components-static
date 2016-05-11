var expect = require('chai').expect;

var serverComponents = require("server-components");
var serverComponentsStatic = require("../src/index.js");

describe("Server Component Static urls", () => {
    it("set an initial base content path when first used", () => {
        expect(serverComponentsStatic.contentBase).to.equal("/components");
    });

    it("lets components look up their own content URL", () => {
        var content = serverComponentsStatic.forComponent("my-component");
        var url = content.getUrl("style.css");

        expect(url).to.equal("/components/my-component/style.css");
    });

    it("allows changes to the component URL base", () => {
        serverComponentsStatic.contentBase = "/custom-path";
        var content = serverComponentsStatic.forComponent("my-component");
        var url = content.getUrl("style.css");

        expect(url).to.equal("/custom-path/my-component/style.css");
    });

    it("correctly uses remote base component URLs", () => {
        serverComponentsStatic.contentBase = "http://my-cdn.example.com/components/";
        var content = serverComponentsStatic.forComponent("my-component");
        var url = content.getUrl("script.js");

        expect(url).to.equal("http://my-cdn.example.com/components/my-component/script.js");
    });
});
