import { createContext } from 'react';

export type UpdateCheckResult = 'updated' | 'current' | 'unsupported' | 'error';

export type PWAContextValue = {
	/** A new service worker is waiting; the app should offer to reload. */
	needRefresh: boolean;
	/** Drop the pending-refresh state without reloading. */
	dismissRefresh: () => void;
	/** Ask the server whether a newer build exists, right now. */
	checkForUpdate: () => Promise<UpdateCheckResult>;
	/** Activate the waiting worker; pass true to reload the page afterwards. */
	updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
};

const PWAStateContext = createContext<PWAContextValue | null>(null);

export default PWAStateContext;
