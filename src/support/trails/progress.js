/**
 * Cálculo do progresso de uma trilha, compartilhado entre "Minha trilha" e a
 * tela de acompanhamento do líder.
 *
 * Antes a barra era só `completed_stages_count / stages_count`, então quem
 * tinha metade dos níveis de uma etapa feita ainda via 0% — justamente o
 * colaborador que precisa se ver andando. Aqui cada etapa vale a mesma fatia
 * da trilha e, dentro dela, os níveis dão crédito proporcional ao quórum.
 */

// O quórum (`required_count`) é quantos níveis a etapa exige; pode ser menor
// que o total cadastrado. Sem ele, cai para o total de níveis.
const requiredOf = (stage) => stage.required_count || stage.levels?.length || 0;

// Contar acima do quórum passaria de 100% dentro da etapa.
const doneOf = (stage) => {
  const done = stage.completed_levels_count ?? 0;
  const required = requiredOf(stage);

  return required ? Math.min(done, required) : done;
};

export function stageRatio(stage) {
  if (stage.state === 'completed') return 1;

  const required = requiredOf(stage);

  return required ? doneOf(stage) / required : 0;
}

export function trailRatio(item) {
  const stages = item?.stages ?? [];

  if (!stages.length) return 0;

  return stages.reduce((total, stage) => total + stageRatio(stage), 0) / stages.length;
}

export function trailComplete(item) {
  const stages = item?.stages ?? [];

  return stages.length > 0 && stages.every((stage) => stage.state === 'completed');
}

export function trailPercent(item) {
  const ratio = trailRatio(item);

  if (trailComplete(item)) return 100;

  // Piso, não arredondamento: 99,6% não pode aparecer como "100%" com etapa
  // em aberto. Mas quem já começou também não pode ver 0%.
  return ratio > 0 ? Math.max(1, Math.floor(ratio * 100)) : 0;
}

// Para o texto de apoio do cabeçalho, que explica de onde vem a porcentagem.
export function levelTotals(item) {
  return (item?.stages ?? []).reduce(
    (totals, stage) => ({
      done: totals.done + doneOf(stage),
      required: totals.required + requiredOf(stage),
    }),
    { done: 0, required: 0 }
  );
}
