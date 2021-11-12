/* eslint-disable */
const { config } = require("@swc/core/spack");

module.exports = config({
	entry: {
		phoenix: __dirname + "/src/phoenix.ts",
	},
	output: {
		path: __dirname + "/lib",
	},
});
