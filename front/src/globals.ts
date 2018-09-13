import { Latest } from './api';

export let LATEST: Latest | null = null;

export const setLatest = (latest: Latest) => {
  LATEST = latest;
};
