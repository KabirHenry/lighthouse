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

export type Home = {
	id: number;
	name: string;
};

export class HomeService {
	private db: IDBPDatabase;

	constructor(db: IDBPDatabase) {
		this.db = db;
	}

	async homes(): Promise<{ homes: Home[]; currentHomeID: number | undefined }> {
		const homeStore = this.db.transaction(Stores.HOMES, 'readonly').objectStore(Stores.HOMES);
		const homes = await homeStore.getAll();

		const localStore = this.db.transaction(Stores.LOCAL, 'readonly').objectStore(Stores.LOCAL);
		const lastHomeIDResult = await localStore.get('lastHomeID');
		const lastHomeID = lastHomeIDResult?.value;

		return { homes, currentHomeID: lastHomeID };
	}

	async currentHome(): Promise<Home | null> {
		const localStore = this.db.transaction(Stores.LOCAL, 'readonly').objectStore(Stores.LOCAL);
		const lastHomeIDResult = await localStore.get('lastHomeID');
		const lastHomeID = lastHomeIDResult?.value;

		if (lastHomeID === undefined) {
			return null;
		}

		const homeStore = this.db.transaction(Stores.HOMES, 'readonly').objectStore(Stores.HOMES);
		const home = await homeStore.get(lastHomeID);
		return home || null;
	}

	async addHome(name: string): Promise<Home> {
		const homeStore = this.db.transaction(Stores.HOMES, 'readwrite').objectStore(Stores.HOMES);
		const newHomeID = await homeStore.add({ name });
		return { id: newHomeID as number, name };
	}
}

async function initDB() {
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db, _oldVersion, _newVersion, transaction) {
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
