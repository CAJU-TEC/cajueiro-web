
const dateFormat = (dateStr) => {
  if(!(dateStr)) return;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
};

const dateTimeFormat = (dateStr) => {
  if(!(dateStr)) return;
  return new Intl.DateTimeFormat('pt-BR', {timeStyle: 'short'}).format(new Date(dateStr));
};

const betweenDates = (d1, d2) => {
  const diffInMs = new Date(d2) - new Date(d1);
  const diffInDays = Math.ceil(diffInMs / (1000*3600*24));
  return diffInDays;
};

export {dateFormat, dateTimeFormat, betweenDates};
