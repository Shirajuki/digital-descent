export const clearFocus = () => {
	if (document.activeElement instanceof HTMLElement) {
		document.activeElement.blur();
	}
};
