import { deleteDB } from 'idb';

import {
	closeDB,
	DB_NAME,
	DB_VERSION,
	getDB,
	openDBAtVersion,
	type LighthouseDB,
} from './index';

/**
 * The `.lighthouse` container.
 *
 * ```
 * offset  size  field
 * 0       8     magic "LTHSBAK\x1a"
 * 8       2     container format version (uint16 LE)
 * 10      1     flags — bit 0: the header is deflate-raw compressed
 * 11      3     reserved, zeroed
 * 14      4     header length in bytes (uint32 LE)
 * 18      H     header: UTF-8 JSON, optionally deflated
 * 18+H    …     blob region: every picture's bytes, back to back
 * ```
 *
 * Records live in the header as JSON with blobs lifted out and replaced by
 * `{ "$blob": <index> }` references into a table of `{ offset, length, type }`.
 * Pictures therefore stay byte-exact and are never re-encoded, while the part
 * that actually compresses (the JSON) is deflated. Base64-in-JSON would have
 * cost a third more size and a main-thread encode pass over every photo; a zip
 * would have meant a dependency to store already-compressed JPEGs uncompressed.
 */
const MAGIC = new Uint8Array([0x4c, 0x54, 0x48, 0x53, 0x42, 0x41, 0x4b, 0x1a]);
const HEADER_OFFSET = 18;
const FLAG_DEFLATED = 1;

/** Bumped only for a change that an older reader could not make sense of. */
const FORMAT_VERSION = 1;

export const BACKUP_EXTENSION = '.lighthouse';
export const BACKUP_MIME = 'application/octet-stream';

/** Sentinel keys. `$`-prefixed so they cannot collide with a schema field. */
const BLOB_REF = '$blob';
const DATE_REF = '$date';

type BlobEntry = { offset: number; length: number; type: string };

type StoreDump = {
	/** `null` for an out-of-line-key store, whose records carry their key alongside. */
	keyPath: string | string[] | null;
	autoIncrement: boolean;
	records: unknown[];
	/** Only present when `keyPath` is null, parallel to `records`. */
	keys?: unknown[];
};

type BackupHeader = {
	app: 'lighthouse';
	appVersion: string;
	dbName: string;
	dbVersion: number;
	createdAt: string;
	stores: Record<string, StoreDump>;
	blobs: BlobEntry[];
};

export type BackupSummary = {
	createdAt: Date;
	dbVersion: number;
	appVersion: string;
	// Record count per store, for the confirmation step.
	counts: Record<string, number>;
	pictureCount: number;
};

/** A read-and-validated backup, ready to hand to {@link restoreBackup}. */
export type ParsedBackup = {
	summary: BackupSummary;
	header: BackupHeader;
	payload: Blob;
};

export enum BackupErrorCode {
	// The bytes are not a Lighthouse backup at all.
	NOT_A_BACKUP = 'not-a-backup',
	// A container version, or a compression, this build cannot read.
	UNSUPPORTED_FORMAT = 'unsupported-format',
	// A backup of some other IndexedDB database.
	WRONG_DATABASE = 'wrong-database',
	// Written by a newer schema, so it cannot be migrated backwards.
	TOO_NEW = 'too-new',
	// Recognisably a backup, but truncated or damaged.
	CORRUPT = 'corrupt',
	// Another tab holds the database open, so it cannot be replaced.
	BLOCKED = 'blocked',
}

export class BackupError extends Error {
	readonly code: BackupErrorCode;

	constructor(code: BackupErrorCode, message: string) {
		super(message);
		this.name = 'BackupError';
		this.code = code;
	}
}

/* -------------------------------------------------------------------------- */
/* Encoding                                                                    */
/* -------------------------------------------------------------------------- */

async function deflate(bytes: Uint8Array): Promise<{ bytes: Uint8Array; deflated: boolean }> {
	if (typeof CompressionStream === 'undefined') {
		return { bytes, deflated: false };
	}

	const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'));
	const packed = new Uint8Array(await new Response(stream).arrayBuffer());
	return { bytes: packed, deflated: true };
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof DecompressionStream === 'undefined') {
		throw new BackupError(
			BackupErrorCode.UNSUPPORTED_FORMAT,
			'This browser cannot read compressed backups.',
		);
	}

	const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Walk a record, lifting every Blob into `blobs` and leaving a reference behind.
 * Dates are tagged too, so a future store that holds one still round-trips.
 */
function lift(value: unknown, blobs: Blob[]): unknown {
	if (value instanceof Blob) {
		return { [BLOB_REF]: blobs.push(value) - 1 };
	}

	if (value instanceof Date) {
		return { [DATE_REF]: value.toISOString() };
	}

	if (Array.isArray(value)) {
		return value.map((entry) => lift(entry, blobs));
	}

	// Plain objects only. Anything exotic is left alone for JSON to deal with.
	if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
		return Object.fromEntries(
			Object.entries(value).map(([key, entry]) => [key, lift(entry, blobs)]),
		);
	}

	return value;
}

/** Inverse of {@link lift}: put the blobs back where their references are. */
function lower(value: unknown, blobs: Blob[]): unknown {
	if (Array.isArray(value)) {
		return value.map((entry) => lower(entry, blobs));
	}

	if (value === null || typeof value !== 'object') {
		return value;
	}

	const record = value as Record<string, unknown>;

	if (typeof record[BLOB_REF] === 'number') {
		const blob = blobs[record[BLOB_REF]];
		if (!blob) {
			throw new BackupError(BackupErrorCode.CORRUPT, 'The backup references a picture it does not contain.');
		}

		return blob;
	}

	if (typeof record[DATE_REF] === 'string') {
		return new Date(record[DATE_REF]);
	}

	return Object.fromEntries(
		Object.entries(record).map(([key, entry]) => [key, lower(entry, blobs)]),
	);
}

/**
 * Read every store in the live database and pack it into a `.lighthouse` blob.
 *
 * Stores are discovered from the connection rather than a hardcoded list, so a
 * store added in a later schema is captured without touching this file.
 */
export async function createBackup(appVersion: string): Promise<Blob> {
	// The app's own connection — reading doesn't need a new one, and opening
	// a second would leave it to be closed before any later restore could delete.
	const db = await getDB();
	const storeNames = [...db.objectStoreNames];
	const blobs: Blob[] = [];
	const stores: Record<string, StoreDump> = {};

	for (const name of storeNames) {
		const tx = db.transaction(name, 'readonly');
		const store = tx.objectStore(name);
		const records = await store.getAll();
		const inlineKey = store.keyPath !== null;
		const keys = inlineKey ? undefined : await store.getAllKeys();
		await tx.done;

		stores[name] = {
			keyPath: store.keyPath,
			autoIncrement: store.autoIncrement,
			records: records.map((record) => lift(record, blobs)),
			...(keys ? { keys: keys as unknown[] } : {}),
		};
	}

	// Lay the blob region out first so the header can carry real offsets.
	const blobTable: BlobEntry[] = [];
	let offset = 0;
	for (const blob of blobs) {
		blobTable.push({ offset, length: blob.size, type: blob.type });
		offset += blob.size;
	}

	const header: BackupHeader = {
		app: 'lighthouse',
		appVersion,
		dbName: DB_NAME,
		dbVersion: DB_VERSION,
		createdAt: new Date().toISOString(),
		stores,
		blobs: blobTable,
	};

	const headerJSON = new TextEncoder().encode(JSON.stringify(header));
	const { bytes: headerBytes, deflated } = await deflate(headerJSON);

	const prefix = new Uint8Array(HEADER_OFFSET);
	prefix.set(MAGIC, 0);
	const view = new DataView(prefix.buffer);
	view.setUint16(8, FORMAT_VERSION, true);
	view.setUint8(10, deflated ? FLAG_DEFLATED : 0);
	view.setUint32(14, headerBytes.length, true);

	return new Blob([prefix as BlobPart, headerBytes as BlobPart, ...blobs], { type: BACKUP_MIME });
}

/** `lighthouse-backup-<timestamp>.lighthouse`, timestamp in local time. */
export function backupFilename(at: Date = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	const stamp =
		`${at.getFullYear()}${pad(at.getMonth() + 1)}${pad(at.getDate())}` +
		`-${pad(at.getHours())}${pad(at.getMinutes())}${pad(at.getSeconds())}`;

	return `lighthouse-backup-${stamp}${BACKUP_EXTENSION}`;
}

/* -------------------------------------------------------------------------- */
/* Decoding                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Validate a file and pull its header out, without touching the database. The
 * blob region stays an unread `Blob` slice, so opening a large backup costs no
 * more memory than the metadata.
 */
export async function readBackup(file: Blob): Promise<ParsedBackup> {
	if (file.size < HEADER_OFFSET) {
		throw new BackupError(BackupErrorCode.NOT_A_BACKUP, 'That file is not a Lighthouse backup.');
	}

	const prefix = new Uint8Array(await file.slice(0, HEADER_OFFSET).arrayBuffer());
	if (MAGIC.some((byte, index) => prefix[index] !== byte)) {
		throw new BackupError(BackupErrorCode.NOT_A_BACKUP, 'That file is not a Lighthouse backup.');
	}

	const view = new DataView(prefix.buffer);
	const formatVersion = view.getUint16(8, true);
	if (formatVersion > FORMAT_VERSION) {
		throw new BackupError(
			BackupErrorCode.UNSUPPORTED_FORMAT,
			'That backup was written by a newer version of Lighthouse.',
		);
	}

	const deflated = (view.getUint8(10) & FLAG_DEFLATED) !== 0;
	const headerLength = view.getUint32(14, true);
	const blobsStart = HEADER_OFFSET + headerLength;
	if (blobsStart > file.size) {
		throw new BackupError(BackupErrorCode.CORRUPT, 'The backup file is incomplete.');
	}

	const rawHeader = new Uint8Array(await file.slice(HEADER_OFFSET, blobsStart).arrayBuffer());
	const headerBytes = deflated ? await inflate(rawHeader) : rawHeader;

	let header: BackupHeader;
	try {
		header = JSON.parse(new TextDecoder().decode(headerBytes)) as BackupHeader;
	} catch {
		throw new BackupError(BackupErrorCode.CORRUPT, 'The backup file is damaged.');
	}

	if (header.app !== 'lighthouse' || !header.stores) {
		throw new BackupError(BackupErrorCode.NOT_A_BACKUP, 'That file is not a Lighthouse backup.');
	}

	if (header.dbName !== DB_NAME) {
		throw new BackupError(BackupErrorCode.WRONG_DATABASE, 'That backup belongs to a different database.');
	}

	// A backup from a newer schema can't be migrated backwards.
	if (header.dbVersion > DB_VERSION) {
		throw new BackupError(
			BackupErrorCode.TOO_NEW,
			'That backup was made by a newer version of Lighthouse. Update the app first.',
		);
	}

	const payload = file.slice(blobsStart);
	const expected = header.blobs.reduce((total, entry) => total + entry.length, 0);
	if (payload.size < expected) {
		throw new BackupError(BackupErrorCode.CORRUPT, 'The backup file is incomplete.');
	}

	const counts = Object.fromEntries(
		Object.entries(header.stores).map(([name, dump]) => [name, dump.records.length]),
	);

	return {
		header,
		payload,
		summary: {
			createdAt: new Date(header.createdAt),
			dbVersion: header.dbVersion,
			appVersion: header.appVersion,
			counts,
			pictureCount: header.blobs.length,
		},
	};
}

/** How long a blocked delete is given before the restore gives up on it. */
const BLOCKED_TIMEOUT_MS = 10_000;

/**
 * Delete the database, failing loudly rather than hanging if another tab is
 * holding it open.
 *
 * `blocked` is dispatched as a plain event listener, so throwing from it would
 * be swallowed and leave the delete pending forever. Other Lighthouse tabs close
 * their connection on `versionchange` (see `openDBAtVersion`), so reaching the
 * timeout means something outside this build — an old tab, or devtools — has the
 * database open.
 */
async function deleteDatabase(): Promise<void> {
	let isBlocked = false;

	const deletion = deleteDB(DB_NAME, {
		blocked() {
			isBlocked = true;
		},
	});

	const timeout = new Promise<never>((_resolve, reject) => {
		setTimeout(() => {
			if (isBlocked) {
				reject(new BackupError(
					BackupErrorCode.BLOCKED,
					'Lighthouse is open somewhere else. Close its other tabs and try again.',
				));
			}
		}, BLOCKED_TIMEOUT_MS);
	});

	await Promise.race([deletion, timeout]);
}

/**
 * Replace the database with the contents of a backup.
 *
 * The sequence matters. The file's records were written for the schema at
 * `header.dbVersion`, so they are loaded into a database opened *at that
 * version* — the ladder replays only the steps up to it. Reopening at
 * `DB_VERSION` afterwards then runs precisely the steps in between, against the
 * restored rows, which is the same path a live database of that age would take
 * on an app update. No migration is special-cased for restore.
 *
 * This is destructive and not reversible: call it only behind a confirmation.
 */
export async function restoreBackup({ header, payload }: ParsedBackup): Promise<void> {
	// Materialise each picture as a slice of the payload — no copy, no decode.
	const blobs = header.blobs.map((entry) =>
		payload.slice(entry.offset, entry.offset + entry.length, entry.type),
	);

	await closeDB();
	await deleteDatabase();

	// 1. Rebuild the schema as it stood when the backup was taken.
	const old = await openDBAtVersion(header.dbVersion, { seed: false });

	try {
		for (const [name, dump] of Object.entries(header.stores)) {
			if (!old.objectStoreNames.contains(name as never)) {
				// A store the backup has but this schema version does not. Nothing
				// sensible to do with it; the ladder never removes stores.
				continue;
			}

			const tx = old.transaction(name as never, 'readwrite');
			const store = tx.objectStore(name as never);

			for (const [index, record] of dump.records.entries()) {
				const value = lower(record, blobs);
				// In-line keys travel inside the record; out-of-line keys ride alongside.
				// `put` with an explicit key also advances the store's key generator past
				// it, so ids handed out after a restore never collide with restored ones.
				if (dump.keyPath === null) {
					await store.put(value as never, dump.keys?.[index] as never);
				} else {
					await store.put(value as never);
				}
			}

			await tx.done;
		}
	} finally {
		old.close();
	}

	// 2. Walk it forward to today's schema through the ordinary migration path.
	const migrated: LighthouseDB = await openDBAtVersion(DB_VERSION);
	migrated.close();
}
