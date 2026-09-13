/**
 * Separator placed between related names shown together in a single line,
 * e.g. "Top Drawer · Kitchen" or "Kitchen · My Home".
 */
export const SEPARATOR = ' · ';

// The running app version, injected at build time from package.json.
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';

/**
 * The elements the guided tour points at.
 *
 * Pages tag themselves with `data-tour={TourTarget.X}` and the tour selects on
 * it, so renaming a class or reordering a list can't silently break a step.
 */
export enum TourTarget {
	HOME_HOMES = 'home-homes',
	HOME_ITEMS = 'home-items',
	HOME_ROOMS = 'home-rooms',
	HOME_BACKUP = 'home-backup',
	HOME_TUTORIAL = 'home-tutorial',
	ITEMS_LIST = 'items-list',
	ITEMS_FILTER = 'items-filter',
	ITEMS_ADD = 'items-add',
	HOMES_LIST = 'homes-list',
	/** Any open modal. Tagged once on the shared `Modal` wrapper, so every modal has it. */
	MODAL = 'modal',
	ROOMS_LIST = 'rooms-list',
	LOCATIONS_LIST = 'locations-list',
}

/** The CSS selector matching a tour target's element. */
export function tourSelector(target: TourTarget): string {
	return `[data-tour="${target}"]`;
}

export const REPO_URL = 'https://github.com/KabirHenry/lighthouse';
