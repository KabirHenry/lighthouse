import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, type NavigateFunction } from 'react-router';
import { EVENTS, Joyride, type EventHandler, type Step } from 'react-joyride';

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

/**
 * The first row of one of the list pages.
 *
 * List steps point at a single row rather than the whole list, else
 * they leave the viewport.
 */
function firstRow(target: TourTarget): string {
	return `${tourSelector(target)} > *:first-child`;
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
		void navigate(path);

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
	const { status, endTutorial } = useTutorialContext();
	const { isLoaded, rooms } = useHomesContext();

	const isRunning = status === TutorialStatus.RUNNING;
	// The demo store has to be open and its rooms loaded before any step can point
	// at one of them.
	const isReady = isRunning && isLoaded && rooms.length > 0;
	const firstRoomID = rooms[0]?.room.id;

	const steps: Step[] = useMemo(() => [
		{
			target: 'body',
			placement: 'center',
			title: t('tutorial.steps.welcome.title'),
			content: t('tutorial.steps.welcome.content'),
			before: goTo(navigate, '/'),
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
			target: tourSelector(TourTarget.ITEMS_FILTER),
			title: t('tutorial.steps.itemsFilter.title'),
			content: t('tutorial.steps.itemsFilter.content'),
			before: goTo(navigate, '/items', TourTarget.ITEMS_LIST),
		},
		{
			target: tourSelector(TourTarget.ITEMS_ADD),
			title: t('tutorial.steps.itemsAdd.title'),
			content: t('tutorial.steps.itemsAdd.content'),
			before: goTo(navigate, '/items', TourTarget.ITEMS_LIST),
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
			content: t('tutorial.steps.roomsList.content'),
			before: goTo(navigate, '/rooms', TourTarget.ROOMS_LIST),
		},
		{
			target: firstRow(TourTarget.LOCATIONS_LIST),
			placement: 'bottom',
			title: t('tutorial.steps.locationsList.title'),
			content: t('tutorial.steps.locationsList.content'),
			before: goTo(navigate, `/locations?room=${firstRoomID}`, TourTarget.LOCATIONS_LIST),
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
	], [t, navigate, firstRoomID]);

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

	if (!isReady) {
		return null;
	}

	return <Joyride
		continuous
		run
		steps={steps}
		onEvent={handleEvent}
		locale={{
			back: t('tutorial.buttons.back'),
			next: t('tutorial.buttons.next'),
			nextWithProgress: t('tutorial.buttons.nextWithProgress'),
			last: t('tutorial.buttons.last'),
			close: t('tutorial.buttons.close'),
			skip: t('tutorial.buttons.skip'),
			open: t('tutorial.buttons.open'),
		}}
		options={{
			// Keep the tour on rails. The spotlighted control stays look-only, and
			// neither the backdrop nor Escape advances a step, so a stray tap can't
			// navigate out from under the step describing it.
			blockTargetInteraction: true,
			overlayClickAction: false,
			dismissKeyAction: false,
			// The tooltip's × ends the tour rather than skipping a step forward.
			closeButtonAction: 'skip',
			skipBeacon: true,
			showProgress: true,
			// Steps navigate before they show, so the target needs longer to turn up
			// than the one second a same-page tour would want.
			targetWaitTimeout: 5_000,
			arrowColor: ARROW_COLOUR,
			overlayColor: '#000000cc',
			spotlightRadius: 0,
			width: 320,
		}}
		styles={{
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
				fontSize: '18px',
				marginBottom: '10px',
			},
			tooltipContent: {
				fontSize: '13px',
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
				fontSize: '12px',
				padding: '8px 12px',
			},
			buttonBack: {
				color: 'var(--colour-text)',
				fontSize: '12px',
				marginRight: '8px',
			},
			buttonClose: {
				color: 'var(--colour-text)',
			},
			spotlight: {
				fill: 'transparent',
			},
		}}
	/>;
}

export default Tutorial;
