import ucmp from './ucmp/index.js';
import amp from './amp/index.js';
import omp from './omp/index.js';

const sheets = [ucmp, amp, omp];
export const getSheet = key => sheets.find(sheet => sheet.key === key);
