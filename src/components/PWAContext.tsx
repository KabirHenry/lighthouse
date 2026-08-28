import type React from 'react';
import { useCallback, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import PWAStateContext, { type PWAContextValue } from '../context/pwaContext';

// A fallback only: iOS freezes background timers, so the foreground
// `visibilitychange` check below is what actually keeps installed apps current.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

// How long to wait after `registration.update()` for `updatefound` to fire
// before deciding nothing new turned up.
const UPDATE_SETTLE_MS = 800;

// Set just before we force a reload to apply an update, cleared once the app
// boots without a worker still stuck waiting. iOS standalone PWAs routinely
// fail the waiting -> active handoff, leaving `registration.waiting` populated
// on the next load so the prompt reappears forever; this flag caps us at one
// forced reload per session so a genuinely stuck device can't loop.
const RELOAD_GUARD = 'pwa:updating';

function readGuard() {
	try {
		return sessionStorage.getItem(RELOAD_GUARD) === '1';
	} catch {
		return false;
	}
}

function writeGuard(value: boolean) {
	try {
		if (value) {
			sessionStorage.setItem(RELOAD_GUARD, '1');
		} else {
			sessionStorage.removeItem(RELOAD_GUARD);
		}
	} catch {
		// Storage unavailable (private mode, etc.) — the guard just won't persist.
	}
}

function PWAProvider({ children }: { children: React.ReactNode }) {
	const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

	const {
		needRefresh: [needRefresh, setNeedRefresh],
	} = useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			if (!registration) {
				return;
			}

			registrationRef.current = registration;

			// We booted cleanly (or with a fresh worker installing) — the last
			// forced reload did its job, so let the next one through if needed.
			if (!registration.waiting) {
				writeGuard(false);
			}

			const check = () => {
				if (document.visibilityState === 'visible') {
					void registration.update().catch(() => undefined);
				}
			};

			document.addEventListener('visibilitychange', check);
			setInterval(check, UPDATE_CHECK_INTERVAL);
		},
	});

	const checkForUpdate = useCallback<PWAContextValue['checkForUpdate']>(async () => {
		const registration = registrationRef.current;
		if (!registration) {
			return 'unsupported';
		}

		try {
			let found = Boolean(registration.installing || registration.waiting);
			const onUpdateFound = () => {
				found = true;
			};

			registration.addEventListener('updatefound', onUpdateFound);
			await registration.update();
			await new Promise((resolve) => setTimeout(resolve, UPDATE_SETTLE_MS));
			registration.removeEventListener('updatefound', onUpdateFound);

			return found || registration.waiting ? 'updated' : 'current';
		} catch {
			return 'error';
		}
	}, []);

	const updateServiceWorker = useCallback<PWAContextValue['updateServiceWorker']>(
		async (reloadPage = true) => {
			const registration = registrationRef.current;

			// Nudge the waiting worker along for browsers that honour the normal
			// handoff; harmless where they don't.
			registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });

			if (!reloadPage) {
				return;
			}

			// The reliable cross-platform path — notably for iOS standalone, where
			// messaging the waiting worker often never transfers control *and*
			// `location.reload()` itself hangs the WebView: tear everything down and
			// hard-navigate instead. Unregister the worker, drop the caches, then
			// load a fresh URL so the WebView makes a real navigation to the network
			// for the latest build, registering a new worker from scratch that
			// activates immediately with nothing left waiting.
			if (!readGuard()) {
				writeGuard(true);
				try {
					await registration?.unregister();
					if ('caches' in window) {
						const keys = await caches.keys();
						await Promise.all(keys.map((key) => caches.delete(key)));
					}
				} catch {
					// Fall through to the navigation regardless.
				}
			}

			const url = new URL(window.location.href);
			url.searchParams.set('_cb', Date.now().toString());
			window.location.replace(url.toString());
		},
		[],
	);

	const value: PWAContextValue = {
		needRefresh,
		dismissRefresh: () => setNeedRefresh(false),
		checkForUpdate,
		updateServiceWorker,
	};

	return <PWAStateContext.Provider value={value}>{children}</PWAStateContext.Provider>;
}

export default PWAProvider;
