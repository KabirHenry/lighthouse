import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'LightHouseDB';
const DB_VERSION = 3;

enum Stores {
	HOMES = 'homes',
	ROOMS = 'rooms',
	LOCATIONS = 'locations',
	ITEMS = 'items',
	LOCAL = 'local',
}

export async function getHomeService() {
	const db = await initDB();
	return new HomeService(db);
}

export type HomeID = number & { readonly __brand: 'HomeID' };
export type PictureID = number & { readonly __brand: 'PictureID' };
export type RoomID = number & { readonly __brand: 'RoomID' };
export type LocationID = number & { readonly __brand: 'LocationID' };
export type ItemID = number & { readonly __brand: 'ItemID' };

export type Home = {
	id: HomeID;
	description?: string;
	name: string;
};

export type Picture = {
	id: PictureID;
	mimeType: string;
	data: Blob;
}

export type Room = {
	id: RoomID;
	homeID: HomeID;
	name: string;
	description?: string;
	picture?: PictureID;
};

export type Location = {
	id: LocationID;
	roomID: RoomID;
	name: string;
	description?: string;
	picture?: PictureID;
};

export type Item = {
	id: ItemID;
	locationID: LocationID;
	name: string;
	description?: string;
	picture?: PictureID;
};

export class HomeService {
	private db: IDBPDatabase;

	constructor(db: IDBPDatabase) {
		this.db = db;
	}

	async homes(): Promise<{ homes: Home[]; currentHome: Home }> {
		const homeStore = this.db.transaction(Stores.HOMES, 'readonly').objectStore(Stores.HOMES);
		const homes = await homeStore.getAll();

		const localStore = this.db.transaction(Stores.LOCAL, 'readonly').objectStore(Stores.LOCAL);
		const lastHomeIDResult = await localStore.get('lastHomeID');
		const lastHomeID = lastHomeIDResult?.value;

		const currentHome = homes.find((home) => home.id === lastHomeID) || homes[0];
		return { homes, currentHome };
	}

	async addHome(name: string): Promise<void> {
		const homeStore = this.db.transaction(Stores.HOMES, 'readwrite').objectStore(Stores.HOMES);
		await homeStore.add({ name });
	}

	async deleteHome(id: number): Promise<void> {
		// Skip deletion if this is the only home
		const homeStore = this.db.transaction(Stores.HOMES, 'readonly').objectStore(Stores.HOMES);
		const homes = await homeStore.getAll();
		if (homes.length <= 1) {
			return;
		}

		const homeStoreRW = this.db.transaction(Stores.HOMES, 'readwrite').objectStore(Stores.HOMES);
		await homeStoreRW.delete(id);

		const localStore = this.db.transaction(Stores.LOCAL, 'readwrite').objectStore(Stores.LOCAL);
		const lastHomeIDResult = await localStore.get('lastHomeID');
		const lastHomeID = lastHomeIDResult?.value;

		if (lastHomeID === id) {
			await localStore.put({ key: 'lastHomeID', value: undefined });
		}
	}
}

async function initDB() {
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db, _oldVersion, _newVersion, transaction) {
			// TODO: Add migration logic here if needed in the future.
			// Right now we're still building the app.
			for (const storeName of Array.from(db.objectStoreNames)) {
				db.deleteObjectStore(storeName);
			}

			const homeStore = db.createObjectStore(Stores.HOMES, { keyPath: 'id', autoIncrement: true });

			const roomStore = db.createObjectStore(Stores.ROOMS, { keyPath: 'id', autoIncrement: true });
			roomStore.createIndex('homeID', 'homeID', { unique: false });
		
			const locationStore = db.createObjectStore(Stores.LOCATIONS, { keyPath: 'id', autoIncrement: true });
			locationStore.createIndex('roomID', 'roomID', { unique: false });
		
			const itemStore = db.createObjectStore(Stores.ITEMS, { keyPath: 'id', autoIncrement: true });
			itemStore.createIndex('locationID', 'locationID', { unique: false });
		
			db.createObjectStore(Stores.LOCAL, { keyPath: 'key' });

			homeStore.getAll().then((homes) => {
				if (homes.length === 0) {
					homeStore.add({ name: 'My Home' });
				}
			});

			const localStore = transaction.objectStore(Stores.LOCAL);
			localStore.get('lastHomeID').then((result) => {
				if (result === undefined) {
					localStore.add({ key: 'lastHomeID', value: 1 });
				}
			});
		},
	});
}
