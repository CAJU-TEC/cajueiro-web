
const dateFormat = (dateStr) => {
  if(!(dateStr)) return;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
};

const betweenDates = (d1, d2) => {
  const diffInMs = new Date(d2) - new Date(d1);
  console.log(diffInMs);
  // const diffInDays = diffInMs / (1000*60*60*24);
};

export {dateFormat, betweenDates};
