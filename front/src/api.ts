import axios from 'axios';

import { DataLocation, Field } from './model';

export const fetchData = async (
  runno: number,
  fileno: number,
  hall: string,
  session: string,
  fields: Field[],
) => {
  const fieldStr = fields.map(o => o.value).join(',');
  const params = {
    fields: fieldStr,
    fileno,
    hall,
    runno,
    session,
  };
  const { data } = await axios.get('/realdata', { params });
  return data;
};

export const reportTaggings = (
  hall: string,
  session: string,
  taggedIds: DataLocation[],
) => {
  axios.post('/report_taggings', {
    hall,
    session,
    taggedIds,
  });
};
