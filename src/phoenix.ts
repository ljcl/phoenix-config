import './helpers/screen';
import './helpers/window';

import {hyper, hyperShift} from './config';

import {frameRatio, moveToFrame} from './helpers/calc';
import {onKey} from './helpers/key';
import log from './helpers/logger';
import {titleModal} from './helpers/modal';

Phoenix.set({
	daemon: true,
	openAtLogin: true,
});

const closeAppsOnBlur = ['com.apple.Preview', 'com.apple.ActivityMonitor', 'com.apple.Console'];
let prevActiveAppClose: App | null = null;
Event.on('appDidActivate', (app, h) => {
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

const composeFrame = (frame: [number, number, number, number]) => ({
	x: frame[0],
	y: frame[1],
	width: frame[2],
	height: frame[3],
});

const namedFrame = {
	h1: composeFrame([0, 0, 1 / 2, 1]),
	h2: composeFrame([1 / 2, 0, 1 / 2, 1]),
	t1: composeFrame([0, 0, 1 / 3, 1]),
	t2: composeFrame([1 / 3, 0, 1 / 3, 1]),
	t3: composeFrame([2 / 3, 0, 1 / 3, 1]),
	tt1: composeFrame([0 / 3, 0, 2 / 3, 1]),
	tt2: composeFrame([1 / 3, 0, 2 / 3, 1]),
};

const createFrame = (frame: Rectangle, namedFrame: Rectangle) => {
	const isPortrait = frame.width / frame.height <= 1;
	const widthModifier = isPortrait ? namedFrame.height : namedFrame.width;
	const heightModifier = isPortrait ? namedFrame.width : namedFrame.height;
	const xModifier = isPortrait ? namedFrame.y : namedFrame.x;
	const yModifier = isPortrait ? namedFrame.x : namedFrame.y;
	return {
		x: frame.x + Math.ceil(frame.width * xModifier),
		y: frame.y + Math.ceil(frame.height * yModifier),
		width: Math.floor(frame.width * widthModifier),
		height: Math.floor(frame.height * heightModifier),
	};
};

onKey('z', hyper, () => {
	const win = Window.focused();
	if (!win) return;

	const visibleFrame = win.screen().flippedVisibleFrame();

	const frame2 = createFrame(visibleFrame, namedFrame.h1);
	const frame3 = createFrame(visibleFrame, namedFrame.h2);
	const frame4 = createFrame(visibleFrame, namedFrame.t1);
	const frame5 = createFrame(visibleFrame, namedFrame.t2);
	const frame6 = createFrame(visibleFrame, namedFrame.t3);

	let frame = frame2;

	// TODO: Make this accept a list of namedFrames instead of making explicit
	if (objEq(win.frame(), frame2)) frame = frame3;
	if (objEq(win.frame(), frame3)) frame = frame4;
	if (objEq(win.frame(), frame4)) frame = frame5;
	if (objEq(win.frame(), frame5)) frame = frame6;

	log({frame, frame2, frame3, frame4, frame5, frame6});

	win.setFrame(frame);
	win.clearUnmaximized();
});

onKey('z', hyperShift, () => {
	const win = Window.focused();
	if (!win) return;

	const visibleFrame = win.screen().flippedVisibleFrame();

	const frame2 = createFrame(visibleFrame, namedFrame.tt1);
	const frame3 = createFrame(visibleFrame, namedFrame.tt2);

	let frame = frame2;

	// TODO: Make this accept a list of namedFrames instead of making explicit
	if (objEq(win.frame(), frame2)) frame = frame3;

	log({frame, frame2, frame3});

	win.setFrame(frame);
	win.clearUnmaximized();
});

onKey('tab', hyper, () => {
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
		newScreen.flippedVisibleFrame(),
	);
	win.setFrame(ratio(win.frame()));
});

onKey('tab', hyperShift, () => {
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
		newScreen.flippedVisibleFrame(),
	);
	win.setFrame(move(win.frame()));
});

onKey('c', hyper, () => {
	const win = Window.focused();
	if (win) {
		win.toggleMaximized();
	}
});

onKey('c', hyperShift, () => {
	const win = Window.focused();
	if (!win) {
		return;
	}

	const {width, height} = win.frame();
	const {
		width: sWidth,
		height: sHeight,
		x,
		y,
	} = win.screen().flippedVisibleFrame();

	win.setFrame({
		height,
		width,
		x: x + sWidth / 2 - width / 2,
		y: y + sHeight / 2 - height / 2,
	});
});

function objEq(a: {[key: string]: any}, b: {[key: string]: any}) {
	const akeys = Object.keys(a);
	if (akeys.length !== Object.keys(b).length) {
		return false;
	}
	return akeys.every(k => a[k] === b[k]);
}

const phoenixApp = App.get('Phoenix');
titleModal('Reloaded!', 2, phoenixApp && phoenixApp.icon());
