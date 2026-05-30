import { createContext } from 'react';

import type { Home, HomeService } from '../services';

export type HomesContextValue = {
	isLoaded: boolean;
	home: Home | null;
	homes: Home[];
	reloadHomes: (service?: HomeService) => Promise<void>;
	addHome: (name: string) => Promise<void>;
	deleteHome: (id: number) => Promise<void>;
};

const HomesStateContext = createContext<HomesContextValue | null>(null);

export default HomesStateContext;