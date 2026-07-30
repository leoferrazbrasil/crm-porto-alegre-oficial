import { PIPELINE_STAGES, type PipelineStage } from "./pipeline";
import type { Lead, LeadSource } from "./types";

export const LEAD_SOURCES = [
  "Prospecção ativa",
  "Inbound",
  "Indicação",
  "Instagram",
  "Evento",
  "Outro"
] as const satisfies readonly LeadSource[];

export interface LeadRow {
  id: string;
  company_name: string;
  contact_name: string;
  segment: string;
  source: string;
  instagram_profile: string | null;
  stage: string;
  owner_id: string;
  estimated_value: number | string;
  recurring_value: number | string | null;
  probability: number;
  next_action: string;
  next_action_at: string;
  loss_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidLeadInput {
  companyName: string;
  contactName: string;
  segment: string;
  source: LeadSource;
  instagramProfile: string | null;
  stage: PipelineStage;
  estimatedValue: number;
  recurringValue: number | null;
  probability: number;
  nextAction: string;
  nextActionAt: string;
  lossReason: string | null;
}

export interface LeadPayload {
  company_name: string;
  contact_name: string;
  segment: string;
  source: LeadSource;
  instagram_profile: string | null;
  stage: PipelineStage;
  owner_id: string;
  estimated_value: number;
  recurring_value: number | null;
  probability: number;
  next_action: string;
  next_action_at: string;
  loss_reason: string | null;
}

export type LeadFormResult =
  | { status: "success"; data: ValidLeadInput }
  | { status: "error"; message: string };

export function mapLeadRow(row: LeadRow): Lead {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.contact_name,
    segment: row.segment,
    source: normalizeLeadSource(row.source),
    instagramProfile: row.instagram_profile ?? undefined,
    stage: normalizePipelineStage(row.stage),
    owner: "Leonardo",
    estimatedValue: Number(row.estimated_value),
    recurringValue:
      row.recurring_value === null ? undefined : Number(row.recurring_value),
    probability: row.probability,
    nextAction: row.next_action,
    nextActionAt: row.next_action_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lossReason: row.loss_reason ?? undefined
  };
}

export function parseLeadForm(formData: FormData): LeadFormResult {
  const companyName = textField(formData, "companyName");
  const contactName = textField(formData, "contactName");
  const segment = textField(formData, "segment");
  const sourceValue = textField(formData, "source");
  const stageValue = textField(formData, "stage");
  const nextAction = textField(formData, "nextAction");
  const nextActionAtValue = textField(formData, "nextActionAt");

  if (
    !companyName ||
    !contactName ||
    !segment ||
    !sourceValue ||
    !stageValue ||
    !nextAction ||
    !nextActionAtValue
  ) {
    return {
      status: "error",
      message:
        "Informe empresa, contato, segmento, origem, etapa, próxima ação e data."
    };
  }

  if (!isLeadSource(sourceValue) || !isPipelineStage(stageValue)) {
    return {
      status: "error",
      message: "Origem ou etapa inválida para o CRM."
    };
  }

  const estimatedValue = numberField(formData, "estimatedValue");
  const recurringValue = optionalNumberField(formData, "recurringValue");
  const probability = numberField(formData, "probability");

  if (probability < 0 || probability > 100) {
    return {
      status: "error",
      message: "A probabilidade precisa estar entre 0 e 100."
    };
  }

  const nextActionAt = normalizeDateTime(nextActionAtValue);

  if (!nextActionAt) {
    return {
      status: "error",
      message: "Informe uma data válida para a próxima ação."
    };
  }

  return {
    status: "success",
    data: {
      companyName,
      contactName,
      segment,
      source: sourceValue,
      instagramProfile: nullableTextField(formData, "instagramProfile"),
      stage: stageValue,
      estimatedValue,
      recurringValue,
      probability,
      nextAction,
      nextActionAt,
      lossReason: nullableTextField(formData, "lossReason")
    }
  };
}

export function buildLeadPayload(
  input: ValidLeadInput,
  ownerId: string
): LeadPayload {
  return {
    company_name: input.companyName,
    contact_name: input.contactName,
    segment: input.segment,
    source: input.source,
    instagram_profile: input.instagramProfile,
    stage: input.stage,
    owner_id: ownerId,
    estimated_value: input.estimatedValue,
    recurring_value: input.recurringValue,
    probability: input.probability,
    next_action: input.nextAction,
    next_action_at: input.nextActionAt,
    loss_reason: input.lossReason
  };
}

function textField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function nullableTextField(formData: FormData, name: string): string | null {
  const value = textField(formData, name);
  return value || null;
}

function numberField(formData: FormData, name: string): number {
  const value = textField(formData, name).replace(",", ".");
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalNumberField(formData: FormData, name: string): number | null {
  const value = textField(formData, name).replace(",", ".");

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDateTime(value: string): string | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeLeadSource(value: string): LeadSource {
  return isLeadSource(value) ? value : "Outro";
}

function normalizePipelineStage(value: string): PipelineStage {
  return isPipelineStage(value) ? value : "Mapeado";
}

function isLeadSource(value: string): value is LeadSource {
  return LEAD_SOURCES.includes(value as LeadSource);
}

function isPipelineStage(value: string): value is PipelineStage {
  return PIPELINE_STAGES.includes(value as PipelineStage);
}
