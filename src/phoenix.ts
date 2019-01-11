import "./helpers/screen";
import "./helpers/window";
import { hyper, hyperShift } from "./config";
import { frameRatio, moveToFrame } from "./helpers/calc";
import { onKey } from "./helpers/key";
import log from "./helpers/logger";
import { titleModal } from "./helpers/modal";

/**
 * A collection of named Rectangles
 */
interface namedFrame {
	[key: string]: Rectangle;
}

Phoenix.set({
	daemon: true,
	openAtLogin: true
});

const closeAppsOnBlur = [
	"com.apple.Preview",
	"com.apple.ActivityMonitor",
	"com.apple.Console"
];
let prevActiveAppClose: App | null = null;
Event.on("appDidActivate", (app, h) => {
	// Close certain apps if they have no windows and lose focus.
	const prevClose = prevActiveAppClose;
	prevActiveAppClose = null;

	const id = app.bundleIdentifier();
	if (closeAppsOnBlur.some(v => v === id)) {
		prevActiveAppClose = app;
	}

	if (
		prevClose &&
		!prevClose.isTerminated() &&
		prevClose.windows().length === 0
	) {
		prevClose.terminate();
	}
});

const composeFrame = (frame: [number, number, number, number]): Rectangle => ({
	x: frame[0],
	y: frame[1],
	width: frame[2],
	height: frame[3]
});

const namedFrame: namedFrame = {
	h1: composeFrame([0, 0, 1 / 2, 1]),
	h2: composeFrame([1 / 2, 0, 1 / 2, 1]),
	t1: composeFrame([0, 0, 1 / 3, 1]),
	t2: composeFrame([1 / 3, 0, 1 / 3, 1]),
	t3: composeFrame([2 / 3, 0, 1 / 3, 1]),
	tt1: composeFrame([0 / 3, 0, 2 / 3, 1]),
	tt2: composeFrame([1 / 3, 0, 2 / 3, 1])
};

const createFrame = (frame: Rectangle, namedFrame: Rectangle): Rectangle => {
	const isPortrait = frame.width / frame.height <= 1;
	const widthModifier = isPortrait ? namedFrame.height : namedFrame.width;
	const heightModifier = isPortrait ? namedFrame.width : namedFrame.height;
	const xModifier = isPortrait ? namedFrame.y : namedFrame.x;
	const yModifier = isPortrait ? namedFrame.x : namedFrame.y;
	return {
		x: frame.x + Math.ceil(frame.width * xModifier),
		y: frame.y + Math.ceil(frame.height * yModifier),
		width: Math.floor(frame.width * widthModifier),
		height: Math.floor(frame.height * heightModifier)
	};
};

const loopFrames = (
	visibleFrame: Rectangle,
	namedFrames: Array<string>,
	win: Window
) => {
	const frames = namedFrames.map(nF =>
		createFrame(visibleFrame, namedFrame[nF])
	);
	let frame = frames[0];
	frames.forEach((element, index) => {
		const last = frames.length - 1 === index;
		if (!last && objEq(win.frame(), element)) frame = frames[index + 1];
	});
	return frame;
};

onKey("z", hyper, () => {
	const win = Window.focused();
	if (!win) return;

	const visibleFrame = win.screen().flippedVisibleFrame();

	const frame = loopFrames(visibleFrame, ["h1", "h2", "t1", "t2", "t3"], win);

	win.setFrame(frame);
	win.clearUnmaximized();
});

onKey("z", hyperShift, () => {
	const win = Window.focused();
	if (!win) return;

	const visibleFrame = win.screen().flippedVisibleFrame();

	const frame = loopFrames(visibleFrame, ["tt1", "tt2"], win);

	win.setFrame(frame);
	win.clearUnmaximized();
});

onKey("tab", hyper, () => {
	const win = Window.focused();
	if (!win) {
		return;
	}

	const oldScreen = win.screen();
	const newScreen = oldScreen.next();

	if (oldScreen.isEqual(newScreen)) {
		return;
	}

	const ratio = frameRatio(
		oldScreen.flippedVisibleFrame(),
		newScreen.flippedVisibleFrame()
	);
	win.setFrame(ratio(win.frame()));
});

onKey("tab", hyperShift, () => {
	const win = Window.focused();
	if (!win) {
		return;
	}

	const oldScreen = win.screen();
	const newScreen = oldScreen.next();

	if (oldScreen.isEqual(newScreen)) {
		return;
	}

	const move = moveToFrame(
		oldScreen.flippedVisibleFrame(),
		newScreen.flippedVisibleFrame()
	);
	win.setFrame(move(win.frame()));
});

onKey("c", hyper, () => {
	const win = Window.focused();
	if (win) {
		win.toggleMaximized();
	}
});

onKey("c", hyperShift, () => {
	const win = Window.focused();
	if (!win) {
		return;
	}

	const { width, height } = win.frame();
	const {
		width: sWidth,
		height: sHeight,
		x,
		y
	} = win.screen().flippedVisibleFrame();

	win.setFrame({
		height,
		width,
		x: x + sWidth / 2 - width / 2,
		y: y + sHeight / 2 - height / 2
	});
});

function objEq(a: { [key: string]: any }, b: { [key: string]: any }) {
	const akeys = Object.keys(a);
	if (akeys.length !== Object.keys(b).length) {
		return false;
	}
	return akeys.every(k => a[k] === b[k]);
}

const phoenixApp = App.get("Phoenix");
titleModal("Reloaded!", 2, phoenixApp && phoenixApp.icon());
