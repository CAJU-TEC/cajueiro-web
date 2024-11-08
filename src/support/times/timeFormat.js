const formatTimeDescription = (hours) => {
  const minutes = Math.round(hours * 60); // Converte horas para minutos com arredondamento exato

  if (minutes < 60) {
    return `${minutes} minutos`; // Exibe minutos para valores menores que 1 hora
  } else if (minutes === 60) {
    return '1 hora'; // Caso especial para 1 hora exata
  } else {
    const remainingMinutes = minutes % 60;
    const fullHours = Math.floor(minutes / 60); // Horas completas

    // Retorna string diferenciando entre "X horas" e "X horas e Y minutos"
    return remainingMinutes > 0
      ? `${fullHours} hora(s) e ${remainingMinutes} minutos`
      : `${fullHours} horas`;
  }
};

export {formatTimeDescription};
