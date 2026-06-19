// ─── Business Constants ──────────────────────────────

/** Initial coins for new users */
export const INITIAL_COINS = 100;

/** Daily check-in reward */
export const CHECKIN_REWARD = 5;

/** Minimum odds value */
export const MIN_ODDS = 1.3;

/** Maximum odds value */
export const MAX_ODDS = 5.0;

/** Default odds when no bets placed yet */
export const DEFAULT_ODDS = 2.0;

/** Virtual base bet to prevent extreme odds from lopsided pools */
export const BASE_BET = 300;

/** Minimum bet amount */
export const MIN_BET_AMOUNT = 1;

/** JWT token expiration */
export const JWT_EXPIRES_IN = '7d';

/** bcrypt salt rounds */
export const BCRYPT_ROUNDS = 10;

/** Platform commission rate (0% = no commission) */
export const PLATFORM_FEE = 1.0;

/** Default pagination */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
