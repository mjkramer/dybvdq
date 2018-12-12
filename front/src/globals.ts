import { Latest } from './model';

export let LATEST: Latest | null = null;

export const setLatest = (latest: Latest) => {
  LATEST = latest;
};
