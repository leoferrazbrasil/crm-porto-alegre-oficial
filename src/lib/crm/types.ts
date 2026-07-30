import type { PipelineStage } from "./pipeline";

export type LeadSource =
  | "Prospecção ativa"
  | "Inbound"
  | "Indicação"
  | "Instagram"
  | "Evento"
  | "Outro";

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  segment: string;
  source: LeadSource;
  instagramProfile?: string;
  stage: PipelineStage;
  owner: "Leonardo";
  estimatedValue: number;
  recurringValue?: number;
  probability: number;
  nextAction: string;
  nextActionAt: string;
  createdAt: string;
  updatedAt: string;
  lossReason?: string;
}

export interface CommercialTask {
  id: string;
  leadId?: string;
  title: string;
  dueAt: string;
  priority: "Alta" | "Média" | "Baixa";
  completed: boolean;
}

export interface CrmSummary {
  totalLeads: number;
  activeOpportunities: number;
  wonDeals: number;
  lostDeals: number;
  proposalsOpen: number;
  pipelineValue: number;
  weightedForecast: number;
  overdueNextActions: number;
  conversionRate: number;
}

export interface PipelineGroup {
  stage: PipelineStage;
  leads: Lead[];
  totalValue: number;
}

