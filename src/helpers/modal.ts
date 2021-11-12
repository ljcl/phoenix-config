/* eslint-disable @typescript-eslint/ban-ts-comment */

export { titleModal };

function titleModal(text: string, duration = 1, icon?: Phoenix.Icon) {
	const m = new Modal();
	m.text = text;
	m.duration = duration;
	if (icon) {
		m.icon = icon;
	}

	m.showTitleOn(Screen.main());
}

Modal.prototype.showTitleOn = function _showTitleOn(screen: Screen) {
	showAt(this, screen, 2, 1 + 1 / 3);
};

Modal.prototype.showCenterOn = function _showCenterOn(screen: Screen) {
	showAt(this, screen, 2, 2);
};

function showAt(
	modal: Modal,
	screen: Screen,
	widthDiv: number,
	heightDiv: number
) {
	const { height, width } = modal.frame();
	const sf = screen.visibleFrame();
	modal.origin = {
		x: sf.x + (sf.width / widthDiv - width / 2),
		y: sf.y + (sf.height / heightDiv - height / 2),
	};
	modal.show();
}
