import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
	NavigationType,
	useLocation,
	useNavigate,
	useNavigationType,
	type NavigateFunction,
} from 'react-router';
import {
	EVENTS,
	LIFECYCLE,
	STATUS,
	useJoyride,
	type EventHandler,
	type Options,
	type PartialDeep,
	type Step,
	type Styles,
} from 'react-joyride';

import { TourTarget, tourSelector } from '../constants';
import { TutorialStatus } from '../context/tutorialContext';
import useHomesContext from '../hooks/useHomesContext';
import useTutorialContext from '../hooks/useTutorialContext';

import './Tutorial.css';

/** How long a step waits for its page to fill in before giving up and showing anyway. */
const SETTLE_TIMEOUT_MS = 2_000;
const SETTLE_POLL_MS = 50;

/**
 * Joyride paints the tooltip arrow as an SVG fill rather than through CSS, so
 * this one colour can't come from a custom property. Keep it in step with
 * `--colour-tutorial-bg` in Tutorial.css.
 */
const ARROW_COLOUR = '#14161c';

const OPTIONS: Partial<Options> = {
	// Keep the tour on rails. The spotlighted control is look-only by default, and
	// neither the backdrop nor Escape advances a step, so a stray tap can't
	// navigate out from under the step describing it. Hands-on steps opt back out
	// of the first of those; see `handsOn`.
	blockTargetInteraction: true,
	overlayClickAction: false,
	dismissKeyAction: false,
	// The tooltip's × ends the tour rather than skipping a step forward.
	closeButtonAction: 'skip',
	skipBeacon: true,
	showProgress: true,
	// Steps navigate before they show, so the target needs longer to turn up than
	// the one second a same-page tour would want.
	targetWaitTimeout: 5_000,
	arrowColor: ARROW_COLOUR,
	overlayColor: '#000000cc',
	spotlightRadius: 0,
	width: 340,
};

const STYLES: PartialDeep<Styles> = {
	tooltip: {
		backgroundColor: 'var(--colour-tutorial-bg)',
		border: '1px solid var(--colour-button-border)',
		borderRadius: 0,
		boxShadow: '0 0 24px 2px var(--colour-drop-shadow)',
		color: 'var(--colour-text)',
		padding: '18px',
	},
	tooltipTitle: {
		color: 'var(--colour-title)',
		fontSize: '24px',
		marginBottom: '10px',
	},
	tooltipContent: {
		fontSize: '17px',
		lineHeight: 1.7,
		padding: 0,
		textAlign: 'left',
	},
	tooltipFooter: {
		marginTop: '16px',
	},
	buttonPrimary: {
		backgroundColor: 'var(--colour-button)',
		border: '1px solid var(--colour-button-border)',
		borderRadius: 0,
		color: 'var(--colour-text)',
		fontSize: '16px',
		padding: '8px 12px',
	},
	buttonBack: {
		color: 'var(--colour-text)',
		fontSize: '16px',
		marginRight: '8px',
	},
	buttonClose: {
		color: 'var(--colour-text)',
	},
	spotlight: {
		fill: 'transparent',
	},
};

/**
 * The first row of one of the list pages.
 *
 * List steps point at a single row rather than the whole list, else
 * they leave the viewport.
 */
function firstRow(target: TourTarget): string {
	return `${tourSelector(target)} > *:first-child`;
}

/**
 * The picture icon in the first row of a list — the middle slot every
 * secondary-list row carries, whether it is showing a photo or the fallback.
 */
function firstRowPicture(target: TourTarget): string {
	return `${firstRow(target)} .secondary-list-icon`;
}

/** What a step carries in `Step.data`. */
type StepData = { awaitPath?: RegExp };

/**
 * A step the user has to complete themselves.
 *
 * The spotlighted control stays live — Joyride drops `pointer-events` on the
 * spotlight when `blockTargetInteraction` is off — and the Next button is taken
 * away, so the only way on is to do the thing the copy asks for. `awaitPath`
 * matches the route that arriving at counts as having done it; see `Tutorial`'s
 * effect. A pattern rather than a string because some of those routes carry an
 * id, and because it keeps `/items` from quietly matching `/items/new`.
 *
 * Worth reserving for the gestures that aren't obvious — an unlabelled icon, a
 * list row that turns out to be tappable, the panel behind a `+`. Making every
 * navigation manual would just be a chore.
 */
/**
 * A step pointing at whatever modal the step before it opened.
 *
 * The modals are tall — the picture one leaves under 300px beneath it on a phone
 * — so the tooltip is allowed to slide along the cross axis and overlap the
 * modal rather than hang off the bottom of the screen. Joyride shifts on the main
 * axis only by default, which for a bottom placement is the horizontal one.
 *
 * Keep the copy on these steps short: the modal is doing most of the explaining.
 */
function onModal(): Pick<Step, 'target' | 'placement' | 'floatingOptions'> {
	return {
		target: tourSelector(TourTarget.MODAL),
		placement: 'bottom',
		floatingOptions: { shiftOptions: { crossAxis: true } },
	};
}

function handsOn(awaitPath: RegExp): Partial<Step> {
	return {
		blockTargetInteraction: false,
		buttons: ['back', 'close'],
		data: { awaitPath } satisfies StepData,
	};
}

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Navigate, then wait until the step's target actually has something in it.
 *
 * Joyride waits for a *missing* target by itself, but the list pages mount their
 * container empty and fill it a tick later, once IndexedDB answers. The container
 * is present the whole time, so without this the spotlight would measure an empty
 * box and the tooltip would anchor to the wrong place.
 *
 * Steps that only need the route to have changed pass no `filled` target and just
 * yield for a tick.
 */
function goTo(navigate: NavigateFunction, path: string, filled?: TourTarget) {
	return async () => {
		// `replace`, so the tour's own navigations don't stack up. The user's taps on
		// hands-on steps still push; `endTutorial` unwinds those.
		void navigate(path, { replace: true });

		const deadline = Date.now() + SETTLE_TIMEOUT_MS;
		do {
			await wait(SETTLE_POLL_MS);

			if (filled === undefined) {
				return;
			}

			const element = document.querySelector(tourSelector(filled));
			if (element !== null && element.childElementCount > 0) {
				return;
			}
		} while (Date.now() < deadline);
	};
}

/**
 * The guided tour.
 *
 * Rendered once at the app root rather than inside a `/tutorial` page, because
 * it walks through the real Items, Rooms and Locations pages and has to outlive
 * every navigation it makes. `TutorialProvider` has already pointed the app at
 * the demo store by the time this renders.
 */
function Tutorial() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const navigationType = useNavigationType();
	const { status, endTutorial } = useTutorialContext();
	const { isLoaded, home, homes, rooms, locations, allItems } = useHomesContext();

	const isRunning = status === TutorialStatus.RUNNING;
	// The demo store has to be open and its rooms loaded before any step can point
	// at one of them.
	const isReady = isRunning && isLoaded && rooms.length > 0;

	// Names and ids the copy and the routes are built from. Each fills in as the
	// tour reaches the page that loads it, which re-runs the steps memo; Joyride
	// takes replacement steps without disturbing the index it is on.
	const activeHomeName = home?.name ?? '';
	const otherHomeName = homes.find((entry) => entry.id !== home?.id)?.name ?? '';
	const firstItemName = allItems[0]?.item.name ?? '';
	const firstRoomID = rooms[0]?.room.id;
	const firstRoomName = rooms[0]?.room.name ?? '';
	const firstLocationID = locations[0]?.location.id;
	const firstLocationName = locations[0]?.location.name ?? '';

	const steps: Step[] = useMemo(() => [
		{
			target: 'body',
			placement: 'center',
			title: t('tutorial.steps.welcome.title'),
			content: t('tutorial.steps.welcome.content'),
			before: goTo(navigate, '/'),
		},
		{
			target: tourSelector(TourTarget.HOME_HOMES),
			title: t('tutorial.steps.homes.title'),
			content: t('tutorial.steps.homes.content'),
			before: goTo(navigate, '/'),
			...handsOn(/^\/homes$/),
		},
		{
			// The whole list, unlike the other list steps: it is only ever a couple of
			// rows tall, and the copy is about choosing between them, so spotlighting
			// just the first would hide the alternative behind the tooltip.
			target: tourSelector(TourTarget.HOMES_LIST),
			placement: 'bottom',
			title: t('tutorial.steps.homesList.title'),
			content: t('tutorial.steps.homesList.content', { current: activeHomeName, other: otherHomeName }),
			before: goTo(navigate, '/homes', TourTarget.HOMES_LIST),
			// Switching home navigates to the home page on its own; the next step
			// brings the user straight back to see what the switch did.
			...handsOn(/^\/$/),
		},
		{
			target: tourSelector(TourTarget.HOMES_LIST),
			placement: 'bottom',
			title: t('tutorial.steps.homesSwitched.title'),
			content: t('tutorial.steps.homesSwitched.content', { name: activeHomeName }),
			before: goTo(navigate, '/homes', TourTarget.HOMES_LIST),
		},
		{
			target: tourSelector(TourTarget.HOME_ITEMS),
			title: t('tutorial.steps.items.title'),
			content: t('tutorial.steps.items.content'),
			before: goTo(navigate, '/'),
		},
		{
			target: firstRow(TourTarget.ITEMS_LIST),
			placement: 'bottom',
			title: t('tutorial.steps.itemsList.title'),
			content: t('tutorial.steps.itemsList.content'),
			before: goTo(navigate, '/items', TourTarget.ITEMS_LIST),
		},
		{
			target: firstRowPicture(TourTarget.ITEMS_LIST),
			title: t('tutorial.steps.itemPicture.title'),
			content: t('tutorial.steps.itemPicture.content', { name: firstItemName }),
			before: goTo(navigate, '/items', TourTarget.ITEMS_LIST),
			...handsOn(/^\/items\/\d+\/upload$/),
		},
		{
			...onModal(),
			title: t('tutorial.steps.pictureModal.title'),
			content: t('tutorial.steps.pictureModal.content'),
		},
		{
			target: tourSelector(TourTarget.ITEMS_FILTER),
			title: t('tutorial.steps.itemsFilter.title'),
			content: t('tutorial.steps.itemsFilter.content'),
			// Leaving /items closes whichever modal the previous step opened.
			before: goTo(navigate, '/items', TourTarget.ITEMS_LIST),
			...handsOn(/^\/items\/filter$/),
		},
		{
			...onModal(),
			title: t('tutorial.steps.filterModal.title'),
			content: t('tutorial.steps.filterModal.content'),
		},
		{
			target: tourSelector(TourTarget.ITEMS_ADD),
			title: t('tutorial.steps.itemsAdd.title'),
			content: t('tutorial.steps.itemsAdd.content'),
			before: goTo(navigate, '/items', TourTarget.ITEMS_LIST),
			...handsOn(/^\/items\/new$/),
		},
		{
			...onModal(),
			title: t('tutorial.steps.addModal.title'),
			content: t('tutorial.steps.addModal.content'),
		},
		{
			target: tourSelector(TourTarget.HOME_ROOMS),
			title: t('tutorial.steps.rooms.title'),
			content: t('tutorial.steps.rooms.content'),
			before: goTo(navigate, '/'),
		},
		{
			target: firstRow(TourTarget.ROOMS_LIST),
			placement: 'bottom',
			title: t('tutorial.steps.roomsList.title'),
			content: t('tutorial.steps.roomsList.content', { name: firstRoomName }),
			before: goTo(navigate, '/rooms', TourTarget.ROOMS_LIST),
			...handsOn(/^\/locations$/),
		},
		{
			target: firstRow(TourTarget.LOCATIONS_LIST),
			placement: 'bottom',
			title: t('tutorial.steps.locationsList.title'),
			content: t('tutorial.steps.locationsList.content', { name: firstLocationName }),
			before: goTo(navigate, `/locations?room=${firstRoomID}`, TourTarget.LOCATIONS_LIST),
			...handsOn(/^\/items$/),
		},
		{
			target: firstRow(TourTarget.ITEMS_LIST),
			placement: 'bottom',
			title: t('tutorial.steps.locationItems.title'),
			content: t('tutorial.steps.locationItems.content', { name: firstLocationName }),
			before: goTo(navigate, `/items?via=locations&location=${firstLocationID}&room=${firstRoomID}`, TourTarget.ITEMS_LIST),
		},
		{
			target: tourSelector(TourTarget.HOME_BACKUP),
			title: t('tutorial.steps.backup.title'),
			content: t('tutorial.steps.backup.content'),
			before: goTo(navigate, '/'),
		},
		{
			target: 'body',
			placement: 'center',
			title: t('tutorial.steps.finish.title'),
			content: t('tutorial.steps.finish.content'),
			before: goTo(navigate, '/'),
		},
	], [
		t,
		navigate,
		activeHomeName,
		otherHomeName,
		firstItemName,
		firstRoomID,
		firstRoomName,
		firstLocationID,
		firstLocationName,
	]);

	const locale = useMemo(() => ({
		back: t('tutorial.buttons.back'),
		next: t('tutorial.buttons.next'),
		nextWithProgress: t('tutorial.buttons.nextWithProgress'),
		last: t('tutorial.buttons.last'),
		close: t('tutorial.buttons.close'),
		skip: t('tutorial.buttons.skip'),
		open: t('tutorial.buttons.open'),
	}), [t]);

	const handleEvent: EventHandler = useCallback((data) => {
		// `TOUR_END` is the one that matters: it fires once the status settles on
		// finished or skipped, however the tour got there. `TOUR_STATUS`, despite
		// the name, only fires on stop and reset.
		//
		// A step whose target never turns up needs nothing here — Joyride advances
		// past it by itself, and were every step to fail that way the index would
		// run off the end, finish the tour, and arrive back at this handler.
		if (data.type === EVENTS.TOUR_END) {
			void endTutorial();
		}
	}, [endTutorial]);

	// The hook runs on every render, so `run` does the gating that an early return
	// would otherwise have done.
	const { controls, state, Tour } = useJoyride({
		continuous: true,
		run: isReady,
		steps,
		onEvent: handleEvent,
		locale,
		options: OPTIONS,
		styles: STYLES,
	});

	// Advance past a hands-on step once the user has actually done the thing.
	//
	// Gated on the tooltip being up, so that a step arrived back at with Back —
	// whose own `before` returns to the page the action starts from — can't count
	// the route it is leaving as the action and bounce straight forward again.
	useEffect(() => {
		if (state.status !== STATUS.RUNNING || state.lifecycle !== LIFECYCLE.TOOLTIP) {
			return;
		}

		const { awaitPath } = (steps[state.index]?.data ?? {}) as StepData;
		if (awaitPath !== undefined && awaitPath.test(location.pathname)) {
			controls.next();
		}
	}, [controls, location.pathname, state.index, state.lifecycle, state.status, steps]);

	// End the tour on a Back or Forward it didn't make itself.
	//
	// Every step assumes the page its `before` put there. A browser Back pulls
	// that page out from under the step on screen: Joyride either strands the
	// tooltip over a page it doesn't describe, with the overlay still swallowing
	// every tap, or hides it and leaves the user on demo data with nothing to
	// dismiss. Ending is the only coherent state, and it lands them home, which
	// is roughly where Back was taking them anyway.
	//
	// Keyed on the location actually changing, not on the navigation type alone:
	// the type is sticky, and loading `/tutorial` directly leaves it at POP until
	// the next navigation, which would end the tour the moment it began.
	// `endTutorial`'s own rewind is a POP as well, but the tour has stopped by then.
	const lastLocationKeyRef = useRef(location.key);
	useEffect(() => {
		const isNewLocation = location.key !== lastLocationKeyRef.current;
		lastLocationKeyRef.current = location.key;

		if (isRunning && isNewLocation && navigationType === NavigationType.Pop) {
			void endTutorial();
		}
	}, [endTutorial, isRunning, location.key, navigationType]);

	return isReady ? Tour : null;
}

export default Tutorial;
