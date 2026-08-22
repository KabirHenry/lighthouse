import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'LightHouseDB';
const DB_VERSION = 4;

enum Stores {
	HOMES = 'homes',
	ROOMS = 'rooms',
	LOCATIONS = 'locations',
	ITEMS = 'items',
	PICTURES = 'pictures',
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
	pictureID?: PictureID;
};

export type Location = {
	id: LocationID;
	roomID: RoomID;
	name: string;
	description?: string;
	pictureID?: PictureID;
};

export type Item = {
	id: ItemID;
	locationID: LocationID;
	name: string;
	description?: string;
	pictureID?: PictureID;
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

	async rooms(homeID: HomeID): Promise<Room[]> {
		const roomStore = this.db.transaction(Stores.ROOMS, 'readonly').objectStore(Stores.ROOMS);
		return roomStore.index('homeID').getAll(homeID);
	}

	async addRoom(homeID: HomeID, name: string, description?: string, pictureID?: PictureID): Promise<RoomID> {
		const roomStore = this.db.transaction(Stores.ROOMS, 'readwrite').objectStore(Stores.ROOMS);
		const id = await roomStore.add({ homeID, name, description, pictureID });
		return id as RoomID;
	}

	async updateRoom(id: RoomID, updates: Partial<Omit<Room, 'id'>>): Promise<void> {
		const roomStore = this.db.transaction(Stores.ROOMS, 'readwrite').objectStore(Stores.ROOMS);
		const room = await roomStore.get(id);
		if (!room) {
			return;
		}

		await roomStore.put({ ...room, ...updates });
	}

	async deleteRoom(id: RoomID): Promise<void> {
		const tx = this.db.transaction([Stores.ROOMS, Stores.LOCATIONS, Stores.ITEMS, Stores.PICTURES], 'readwrite');

		const room = await tx.objectStore(Stores.ROOMS).get(id);
		const locations = await tx.objectStore(Stores.LOCATIONS).index('roomID').getAll(id);

		for (const location of locations) {
			const items = await tx.objectStore(Stores.ITEMS).index('locationID').getAll(location.id);
			for (const item of items) {
				if (item.pictureID) {
					await tx.objectStore(Stores.PICTURES).delete(item.pictureID);
				}
				await tx.objectStore(Stores.ITEMS).delete(item.id);
			}

			if (location.pictureID) {
				await tx.objectStore(Stores.PICTURES).delete(location.pictureID);
			}
			await tx.objectStore(Stores.LOCATIONS).delete(location.id);
		}

		if (room?.pictureID) {
			await tx.objectStore(Stores.PICTURES).delete(room.pictureID);
		}
		await tx.objectStore(Stores.ROOMS).delete(id);

		await tx.done;
	}

	async locations(roomID: RoomID): Promise<Location[]> {
		const locationStore = this.db.transaction(Stores.LOCATIONS, 'readonly').objectStore(Stores.LOCATIONS);
		return locationStore.index('roomID').getAll(roomID);
	}

	async addLocation(
		roomID: RoomID,
		name: string,
		description?: string,
		pictureID?: PictureID,
	): Promise<LocationID> {
		const locationStore = this.db.transaction(Stores.LOCATIONS, 'readwrite').objectStore(Stores.LOCATIONS);
		const id = await locationStore.add({ roomID, name, description, pictureID });
		return id as LocationID;
	}

	async updateLocation(id: LocationID, updates: Partial<Omit<Location, 'id'>>): Promise<void> {
		const locationStore = this.db.transaction(Stores.LOCATIONS, 'readwrite').objectStore(Stores.LOCATIONS);
		const location = await locationStore.get(id);
		if (!location) {
			return;
		}

		await locationStore.put({ ...location, ...updates });
	}

	async deleteLocation(id: LocationID): Promise<void> {
		const tx = this.db.transaction([Stores.LOCATIONS, Stores.ITEMS, Stores.PICTURES], 'readwrite');

		const location = await tx.objectStore(Stores.LOCATIONS).get(id);
		const items = await tx.objectStore(Stores.ITEMS).index('locationID').getAll(id);

		for (const item of items) {
			if (item.pictureID) {
				await tx.objectStore(Stores.PICTURES).delete(item.pictureID);
			}
			await tx.objectStore(Stores.ITEMS).delete(item.id);
		}

		if (location?.pictureID) {
			await tx.objectStore(Stores.PICTURES).delete(location.pictureID);
		}
		await tx.objectStore(Stores.LOCATIONS).delete(id);

		await tx.done;
	}

	async items(locationID: LocationID): Promise<Item[]> {
		const itemStore = this.db.transaction(Stores.ITEMS, 'readonly').objectStore(Stores.ITEMS);
		return itemStore.index('locationID').getAll(locationID);
	}

	async addItem(locationID: LocationID, name: string, description?: string, pictureID?: PictureID): Promise<ItemID> {
		const itemStore = this.db.transaction(Stores.ITEMS, 'readwrite').objectStore(Stores.ITEMS);
		const id = await itemStore.add({ locationID, name, description, pictureID });
		return id as ItemID;
	}

	async updateItem(id: ItemID, updates: Partial<Omit<Item, 'id'>>): Promise<void> {
		const itemStore = this.db.transaction(Stores.ITEMS, 'readwrite').objectStore(Stores.ITEMS);
		const item = await itemStore.get(id);
		if (!item) {
			return;
		}

		await itemStore.put({ ...item, ...updates });
	}

	async updateItemLocation(id: ItemID, locationID: LocationID): Promise<void> {
		await this.updateItem(id, { locationID });
	}

	async deleteItem(id: ItemID): Promise<void> {
		const tx = this.db.transaction([Stores.ITEMS, Stores.PICTURES], 'readwrite');

		const item = await tx.objectStore(Stores.ITEMS).get(id);
		if (item?.pictureID) {
			await tx.objectStore(Stores.PICTURES).delete(item.pictureID);
		}
		await tx.objectStore(Stores.ITEMS).delete(id);

		await tx.done;
	}

	async getPicture(id: PictureID): Promise<Picture | undefined> {
		const pictureStore = this.db.transaction(Stores.PICTURES, 'readonly').objectStore(Stores.PICTURES);
		return pictureStore.get(id);
	}

	async addPicture(mimeType: string, data: Blob): Promise<PictureID> {
		const pictureStore = this.db.transaction(Stores.PICTURES, 'readwrite').objectStore(Stores.PICTURES);
		const id = await pictureStore.add({ mimeType, data });
		return id as PictureID;
	}

	async deletePicture(id: PictureID): Promise<void> {
		const pictureStore = this.db.transaction(Stores.PICTURES, 'readwrite').objectStore(Stores.PICTURES);
		await pictureStore.delete(id);
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
			roomStore.createIndex('pictureID', 'pictureID', { unique: false });

			const locationStore = db.createObjectStore(Stores.LOCATIONS, { keyPath: 'id', autoIncrement: true });
			locationStore.createIndex('roomID', 'roomID', { unique: false });
			locationStore.createIndex('pictureID', 'pictureID', { unique: false });

			const itemStore = db.createObjectStore(Stores.ITEMS, { keyPath: 'id', autoIncrement: true });
			itemStore.createIndex('locationID', 'locationID', { unique: false });
			itemStore.createIndex('pictureID', 'pictureID', { unique: false });

			db.createObjectStore(Stores.PICTURES, { keyPath: 'id', autoIncrement: true });

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
