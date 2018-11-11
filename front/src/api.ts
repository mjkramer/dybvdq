import axios from 'axios';

import { AppState, DataLocation, FileData, Hall } from './model';

let cachedData: FileData | null = null;

export type FetchDataParams = Pick<
  AppState,
  'runno' | 'fileno' | 'hall' | 'session' | 'fields'
> & {
  pageShift?: number;
};

export const fetchData = async (
  params: FetchDataParams,
  { saveToCache } = { saveToCache: false },
): Promise<FileData> => {
  if (cachedData) {
    const d = cachedData;
    cachedData = null;
    return d;
  }

  const fieldStr = params.fields.map(o => o.value).join(',');
  const reqParams = { ...params, fields: fieldStr };
  const { data } = await axios.get('/realdata', { params: reqParams });

  if (saveToCache) {
    cachedData = data;
  }

  return data;
};

type Bounds = {
  minRun: number;
  minFile: number;
  maxRun: number;
  maxFile: number;
};

export const reportTaggings = (
  hall: Hall,
  session: string,
  bounds: Bounds,
  taggings: Array<[number, number]>,
  comments: string[],
) => {
  axios.post('/report_taggings', {
    bounds,
    comments,
    hall,
    session,
    taggings,
  });
};

export type Latest = { [hall in Hall]: DataLocation };

export const latest = async (): Promise<Latest> => (await axios.get('/latest')).data;
