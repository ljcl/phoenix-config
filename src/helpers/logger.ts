function log(...args: unknown[]): void {
	args = args.map((arg) => stringify(arg));
	Phoenix.log(...args);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	console.trace(...args);
}

// tslint:disable-next-line:prefer-object-spread
export default Object.assign(log, {
	notify: (...args: unknown[]): void => {
		args = args.map((arg) => stringify(arg));
		Phoenix.log(...args);
		const message = args.join(" ");
		Phoenix.notify(message);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		console.trace(...args);
	},
	noTrace: (...args: unknown[]): void => {
		args = args.map((arg) => stringify(arg));
		Phoenix.log(...args);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		console.log(...args);
	},
});

function stringify(value: unknown) {
	if (value instanceof Error) {
		let stack = "";
		if (value.stack) {
			const s = value.stack.trim().split("\n");
			s[0] += ` (:${value.line}:${value.column})`;
			const indented = s.map((line) => "\t at " + line).join("\n");
			stack = `\n${indented}`;
		}
		return `\n${value.toString()}${stack}`;
	}
	switch (typeof value) {
		case "object":
			return "\n" + JSON.stringify(value, null, 2);
		case "function":
			return value.toString();
		default:
			return value;
	}
}
