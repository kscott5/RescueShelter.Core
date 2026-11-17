// @ts-ignore
import assert from "node:assert";
import test from "node:test";

import * as server from "../src/server";

test.before(() => {
});

test.describe("core server", () => {
	test.it("default server options", () => {
		const expect = server.getDefaultOptions();

		assert.equal(expect.server.name, "Rescue Shelter Core Server");
		assert.equal(expect.server.secure, false);
		assert.equal(expect.server.port, 8080);
	});

	test.it("default server middleware", () => {
		const expect = server.getDefaultOptions();
	
		assert.equal(expect.middleWare.length, 0);
	});

	test.it("default server cors host names", () => {
		const expect = server.getDefaultOptions();
		
		assert.equal(expect.corsHostNames.length, 0);
	});
});
