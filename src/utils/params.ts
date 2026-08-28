/**
 * Parses a comma-separated list of numeric IDs from a query-parameter value.
 * Blank, missing, or malformed entries are dropped, so the result only ever
 * contains positive integers.
 */
export function parseIDList<T extends number>(value: string | null | undefined): T[] {
	if (!value) {
		return [];
	}

	return value
		.split(',')
		.map((part) => Number(part.trim()))
		.filter((id) => Number.isInteger(id) && id > 0) as T[];
}
