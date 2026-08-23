import { createContext } from 'react';

import type { Home, HomeID } from '../services';

export type HomesContextValue = {
	isLoaded: boolean;
	home: Home | null;
	homes: Home[];
	addHome: (name: string, description?: string) => Promise<HomeID | undefined>;
	updateHome: (id: HomeID, name: string, description?: string) => Promise<void>;
	deleteHome: (id: HomeID) => Promise<void>;
	setActiveHome: (id: HomeID) => Promise<void>;
};

const HomesStateContext = createContext<HomesContextValue | null>(null);

export default HomesStateContext;