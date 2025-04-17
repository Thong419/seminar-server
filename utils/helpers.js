export const toLocalDate = (isoDate) => {
  const utcDate = new Date(isoDate);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  };

  const localDate = utcDate.toLocaleString('en-GB', options);
  return localDate;
};
