import { createContext } from 'react';

// Where the guided tour is in its lifecycle.
export enum TutorialStatus {
	// No tour running; the app is on the real store.
	OFF = 'off',
	// The demo store is being wiped and seeded. Nothing reads it yet.
	STARTING = 'starting',
	// The tour is on screen and every page is reading the demo store.
	RUNNING = 'running',
}

export type TutorialContextValue = {
	// Where the tour is in its lifecycle.
	status: TutorialStatus;
	/**
	 * Whether the app should be reading the demo store.
	 *
	 * Deliberately not tied to being on `/tutorial`: the tour walks through the
	 * real Items, Rooms and Locations pages, and a route-equality check would put
	 * real data back on screen the moment it navigated away.
	 */
	isDemo: boolean;
	// Seed the demo store, then hand the app over to it.
	startTutorial: () => Promise<void>;
	// Hand the app back to the real store and empty the demo one.
	endTutorial: () => Promise<void>;
};

const TutorialStateContext = createContext<TutorialContextValue | null>(null);

export default TutorialStateContext;
