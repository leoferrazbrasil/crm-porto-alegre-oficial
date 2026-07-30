export const PIPELINE_STAGES = [
  "Mapeado",
  "Contato iniciado",
  "Engajado",
  "Qualificado",
  "Diagnóstico",
  "Solução apresentada",
  "Proposta enviada",
  "Negociação",
  "Fechado ganho",
  "Fechado perdido"
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const CLOSED_STAGES: readonly PipelineStage[] = [
  "Fechado ganho",
  "Fechado perdido"
];

export const PROPOSAL_STAGES: readonly PipelineStage[] = [
  "Proposta enviada",
  "Negociação"
];

export function isClosedStage(stage: PipelineStage) {
  return CLOSED_STAGES.includes(stage);
}

