import { createContext } from 'react';

import type { Home } from '../services';

export type HomesContextValue = {
	isLoaded: boolean;
	home: Home | null;
	homes: Home[];
	addHome: (name: string) => Promise<void>;
	deleteHome: (id: number) => Promise<void>;
};

const HomesStateContext = createContext<HomesContextValue | null>(null);

export default HomesStateContext;