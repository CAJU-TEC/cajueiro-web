
const dateFormat = (dateStr) => {
  if(!(dateStr)) return;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
};

const dateOnlyFormat = (dateStr) => {
  if(!(dateStr)) return;
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
};

const dateTimeFormat = (dateStr) => {
  if(!(dateStr)) return;
  return new Intl.DateTimeFormat('pt-BR', {timeStyle: 'short'}).format(new Date(dateStr));
};

const betweenDates = (d1, d2) => {
  const diffInMs = new Date(d2) - new Date(d1);
  const diffInDays = Math.ceil(diffInMs / (1000*3600*24));
  return Math.abs(diffInDays);
};

export {dateFormat, dateOnlyFormat, dateTimeFormat, betweenDates};
