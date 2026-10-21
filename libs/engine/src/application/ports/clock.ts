/** Lets tests control "now" instead of mocking Date globally. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};
