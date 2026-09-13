/**
 * Separator placed between related names shown together in a single line,
 * e.g. "Top Drawer · Kitchen" or "Kitchen · My Home".
 */
export const SEPARATOR = ' · ';

// The running app version, injected at build time from package.json.
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';
