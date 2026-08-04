export const PIPELINE_STAGES = [
  "Novo",
  "Qualificando",
  "Negociação",
  "Proposta",
  "Ganho",
  "Perdido"
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const CLOSED_STAGES: readonly PipelineStage[] = [
  "Ganho",
  "Perdido"
];

export const PROPOSAL_STAGES: readonly PipelineStage[] = [
  "Proposta",
  "Negociação"
];

export function isClosedStage(stage: PipelineStage) {
  return CLOSED_STAGES.includes(stage);
}

