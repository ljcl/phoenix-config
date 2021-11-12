const fs = require("fs");
const path = require("path");

const source = path.resolve("./node_modules/phoenix-typings/index.d.ts");
const dest = path.resolve("./@types/phoenix.d.ts");

if (fs.realpathSync(source)) {
	fs.copyFileSync(source, dest);
	console.log("Phoenix typings copied to @types");
} else {
	new Error("Couldn't copy the phoenix typings");
}
