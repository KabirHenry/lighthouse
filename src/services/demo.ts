import {
	Stores,
	getDB,
	getHomeService,
	type DBOptions,
	type HomeService,
} from './index';

/**
 * The tutorial's database.
 *
 * Kept separate from the real one so the tour can create, edit and delete
 * freely. The pages, the provider and `HomeService` are all the real thing —
 * only the store underneath them is swapped, so the tour demonstrates the app's
 * actual behaviour rather than a mock of it.
 */
export const DEMO_DB_NAME = 'LighthouseDemoDB';

/** Opening the demo store never seeds "My Home"; {@link seedDemoStore} writes its own. */
const DEMO_DB_OPTIONS: DBOptions = { name: DEMO_DB_NAME, seed: false };

/** The translator the seed names come from, narrowed to what this module uses. */
type Translate = (key: string) => string;

type DemoLocation = { nameKey: string; itemKeys: string[] };
type DemoRoom = { nameKey: string; locations: DemoLocation[] };

const DEMO_HOME_KEY = 'tutorial.demo.home';

/**
 * What the tour walks through. Enough rooms to fill the Rooms page, more than
 * one location under the first of them for the Locations step, and enough items
 * spread across both that searching and filtering have something to bite on.
 */
const DEMO_ROOMS: DemoRoom[] = [
	{
		nameKey: 'tutorial.demo.rooms.kitchen',
		locations: [
			{
				nameKey: 'tutorial.demo.locations.topDrawer',
				itemKeys: [
					'tutorial.demo.items.scissors',
					'tutorial.demo.items.measuringTape',
				],
			},
			{
				nameKey: 'tutorial.demo.locations.pantryShelf',
				itemKeys: [
					'tutorial.demo.items.oliveOil',
					'tutorial.demo.items.coffeeBeans',
				],
			},
		],
	},
	{
		nameKey: 'tutorial.demo.rooms.bedroom',
		locations: [
			{
				nameKey: 'tutorial.demo.locations.nightstand',
				itemKeys: [
					'tutorial.demo.items.readingGlasses',
					'tutorial.demo.items.passport',
				],
			},
			{
				nameKey: 'tutorial.demo.locations.wardrobe',
				itemKeys: ['tutorial.demo.items.winterCoat'],
			},
		],
	},
	{
		nameKey: 'tutorial.demo.rooms.garage',
		locations: [
			{
				nameKey: 'tutorial.demo.locations.toolBox',
				itemKeys: [
					'tutorial.demo.items.screwdriverSet',
					'tutorial.demo.items.sparePhoneCharger',
				],
			},
		],
	},
];

/** A `HomeService` bound to the demo database instead of the real one. */
export function getDemoHomeService(): Promise<HomeService> {
	return getHomeService(DEMO_DB_OPTIONS);
}

/**
 * Empty every store in the demo database.
 *
 * Clearing rather than deleting is deliberate. `deleteDB` blocks for as long as
 * any connection is open and its promise simply stays pending until then, so a
 * second tab would hang the tour on the way in. One transaction across every
 * store cannot block, cannot half-finish, and leaves the schema in place for the
 * next run.
 */
export async function resetDemoStore(): Promise<void> {
	const db = await getDB(DEMO_DB_OPTIONS);
	const names = Object.values(Stores).filter((name) => db.objectStoreNames.contains(name));

	const tx = db.transaction(names, 'readwrite');
	await Promise.all(names.map((name) => tx.objectStore(name).clear()));
	await tx.done;
}

/**
 * Wipe the demo database and refill it with the tour's fake home.
 *
 * Wiping on the way *in* rather than trusting the way out is what makes an
 * abandoned tutorial harmless: a closed tab, a refresh or a force-quit leaves
 * rows behind, and the next run starts from the same clean slate regardless.
 */
export async function seedDemoStore(t: Translate): Promise<void> {
	await resetDemoStore();

	const service = await getDemoHomeService();
	const homeID = await service.addHome(t(DEMO_HOME_KEY));
	await service.setActiveHome(homeID);

	for (const room of DEMO_ROOMS) {
		const roomID = await service.addRoom(homeID, t(room.nameKey));

		for (const location of room.locations) {
			const locationID = await service.addLocation(roomID, t(location.nameKey));

			for (const itemKey of location.itemKeys) {
				await service.addItem(locationID, t(itemKey));
			}
		}
	}
}
