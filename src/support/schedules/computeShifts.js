const toMinutes = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
};

const toHHmm = (minutes) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Divide o tempo total da escala (manhã + tarde, sem o almoço) igualmente entre
 * os colaboradores, na ordem em que foram adicionados. Quem cai no meio do
 * almoço fica com dois segmentos (mesmo colaborador, dois horários), em vez de
 * um só cruzando a pausa.
 */
const computeShifts = (schedule, collaborators) => {
  const start = toMinutes(schedule.start_time);
  const lunchStart = toMinutes(schedule.lunch_start_time);
  const lunchEnd = lunchStart + Number(schedule.lunch_duration_minutes);
  const end = toMinutes(schedule.end_time);

  const totalMinutes = (lunchStart - start) + (end - lunchEnd);
  const count = collaborators.length;

  if (!count || totalMinutes <= 0) return [];

  const perPerson = totalMinutes / count;
  let cursor = start;

  return collaborators.map((collaborator) => {
    let remaining = perPerson;
    const segments = [];

    while (remaining > 1e-6) {
      if (cursor === lunchStart) cursor = lunchEnd;

      const availableBeforeLunch = cursor < lunchStart ? lunchStart - cursor : Infinity;
      const take = Math.min(remaining, availableBeforeLunch);
      const segmentEnd = cursor + take;

      segments.push({ start: Math.round(cursor), end: Math.round(segmentEnd) });

      cursor = segmentEnd;
      remaining -= take;
    }

    return { collaborator, segments, durationMinutes: perPerson };
  });
};

/**
 * Achata os segmentos calculados em linhas de exibição (Horário | Responsável).
 * O fim de cada linha aparece 1 minuto antes do início da próxima, exceto nas
 * fronteiras "de verdade" (início do almoço e fim da escala), pra não repetir o
 * mesmo horário em duas linhas seguidas.
 */
const buildRows = (schedule, shifts) => {
  const end = toMinutes(schedule.end_time);
  const lunchStart = toMinutes(schedule.lunch_start_time);

  return shifts.flatMap((shift) => shift.segments.map((segment) => {
    const isHardBoundary = segment.end === lunchStart || segment.end === end;
    const displayEnd = isHardBoundary ? segment.end : segment.end - 1;

    return {
      collaborator: shift.collaborator,
      start: segment.start,
      end: segment.end,
      label: `${toHHmm(segment.start)} - ${toHHmm(displayEnd)}`,
    };
  }));
};

export { computeShifts, buildRows, toMinutes, toHHmm };
