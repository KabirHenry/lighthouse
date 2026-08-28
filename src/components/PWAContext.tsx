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

// iOS standalone PWAs routinely never emit `controllerchange` after the waiting
// worker takes over, so the listener-driven reload never fires. Force a reload
// after this long as a fallback.
const RELOAD_FALLBACK_MS = 3000;

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

			const check = () => {
				if (document.visibilityState === 'visible') {
					void registration.update().catch(() => undefined);
				}
			};

			document.addEventListener('visibilitychange', check);
			setInterval(check, UPDATE_CHECK_INTERVAL);
		},
	});

	const updateServiceWorker = useCallback<PWAContextValue['updateServiceWorker']>(
		async (reloadPage = true) => {
			const registration = registrationRef.current;

			// If nothing is staged yet, give the registration one more nudge —
			// the user may have tapped before the check settled.
			if (registration && !registration.waiting && !registration.installing) {
				await registration.update().catch(() => undefined);
			}

			const waiting = registration?.waiting ?? registration?.installing ?? null;

			if (!waiting) {
				if (reloadPage) {
					window.location.reload();
				}
				return;
			}

			let reloaded = false;
			const reload = () => {
				if (reloaded) {
					return;
				}
				reloaded = true;
				window.location.reload();
			};

			const skip = () => waiting.postMessage({ type: 'SKIP_WAITING' });

			if (reloadPage) {
				navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true });
				// Belt and braces: iOS standalone often never fires `controllerchange`.
				setTimeout(reload, RELOAD_FALLBACK_MS);
			}

			if (waiting.state === 'installed' || waiting.state === 'activated') {
				skip();
			} else {
				waiting.addEventListener('statechange', () => {
					if (waiting.state === 'installed') {
						skip();
					}
				});
			}
		},
		[],
	);

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

	const value: PWAContextValue = {
		needRefresh,
		dismissRefresh: () => setNeedRefresh(false),
		checkForUpdate,
		updateServiceWorker,
	};

	return <PWAStateContext.Provider value={value}>{children}</PWAStateContext.Provider>;
}

export default PWAProvider;
