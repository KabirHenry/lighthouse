/**
 * Whether the app is running as an installed PWA (its own window / home-screen
 * launch) rather than inside a normal browser tab. In a tab, a plain page
 * refresh is all it takes to get the latest build, so update affordances only
 * make sense here.
 */
export function isStandalone(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	return (
		window.matchMedia?.('(display-mode: standalone)').matches ||
		// iOS Safari doesn't support the display-mode media query.
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}
