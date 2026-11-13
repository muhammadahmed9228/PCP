export const pick = (obj, ...paths) => {
  for (const path of paths) {
    const value = path.split('.').reduce((item, key) => item?.[key], obj);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
};

export const toNum = value => {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean') return '';
  const number = Number(value);
  return Number.isFinite(number) ? number : '';
};

export const sum = (...values) => {
  const numbers = values.map(toNum).filter(value => value !== '');
  return numbers.length ? numbers.reduce((total, value) => total + value, 0) : '';
};

export const yesNoUrdu = value => value === true ? 'ہاں' : value === false ? 'نہیں' : '';
export const firstRecord = value => Array.isArray(value) ? value[0] : value;
