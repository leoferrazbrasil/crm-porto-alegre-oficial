"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialAuthFormState } from "@/lib/auth/form-state";
import { LEAD_SOURCES } from "@/lib/crm/leads";
import { PIPELINE_STAGES } from "@/lib/crm/pipeline";
import type { Lead } from "@/lib/crm/types";
import {
  createLeadAction,
  deleteLeadAction,
  updateLeadAction
} from "./actions";

interface LeadFormProps {
  lead?: Lead;
  mode: "create" | "edit";
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="authButton" disabled={pending} type="submit">
      {pending ? "Salvando..." : label}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button className="dangerButton" disabled={pending} type="submit">
      {pending ? "Removendo..." : "Excluir lead"}
    </button>
  );
}

export function LeadForm({ lead, mode }: LeadFormProps) {
  const action = mode === "create" ? createLeadAction : updateLeadAction;
  const [state, formAction] = useActionState(action, initialAuthFormState);
  const [deleteState, deleteFormAction] = useActionState(
    deleteLeadAction,
    initialAuthFormState
  );

  return (
    <div className="leadFormLayout">
      <form action={formAction} className="leadForm">
        {lead ? <input name="id" type="hidden" value={lead.id} /> : null}

        <div className="formGrid">
          <label>
            Empresa
            <input
              name="companyName"
              placeholder="Nome da empresa"
              required
              type="text"
              defaultValue={lead?.companyName}
            />
          </label>

          <label>
            Contato
            <input
              name="contactName"
              placeholder="Nome do decisor ou contato"
              required
              type="text"
              defaultValue={lead?.contactName}
            />
          </label>

          <label>
            Segmento
            <input
              name="segment"
              placeholder="Ex.: gastronomia, turismo, serviços"
              required
              type="text"
              defaultValue={lead?.segment}
            />
          </label>

          <label>
            Origem
            <select name="source" required defaultValue={lead?.source ?? "Instagram"}>
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>

          <label>
            Perfil do Instagram
            <input
              name="instagramProfile"
              placeholder="@perfil, se existir"
              type="text"
              defaultValue={lead?.instagramProfile}
            />
          </label>

          <label>
            Etapa do pipeline
            <select name="stage" required defaultValue={lead?.stage ?? "Mapeado"}>
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>

          <label>
            Valor estimado
            <input
              min={0}
              name="estimatedValue"
              placeholder="0"
              step="0.01"
              type="number"
              defaultValue={lead?.estimatedValue ?? 0}
            />
          </label>

          <label>
            Recorrência mensal
            <input
              min={0}
              name="recurringValue"
              placeholder="0"
              step="0.01"
              type="number"
              defaultValue={lead?.recurringValue}
            />
          </label>

          <label>
            Probabilidade (%)
            <input
              max={100}
              min={0}
              name="probability"
              required
              step="1"
              type="number"
              defaultValue={lead?.probability ?? 0}
            />
          </label>

          <label>
            Data da próxima ação
            <input
              name="nextActionAt"
              required
              type="datetime-local"
              defaultValue={toDateTimeLocal(lead?.nextActionAt)}
            />
          </label>
        </div>

        <label>
          Próxima ação
          <textarea
            name="nextAction"
            placeholder="Ex.: enviar apresentação, agendar diagnóstico, fazer follow-up"
            required
            rows={3}
            defaultValue={lead?.nextAction}
          />
        </label>

        <label>
          Motivo de perda
          <textarea
            name="lossReason"
            placeholder="Preencher apenas quando o lead for marcado como Fechado perdido"
            rows={3}
            defaultValue={lead?.lossReason}
          />
        </label>

        {state.message ? (
          <p className={`authMessage authMessage${state.status}`}>
            {state.message}
          </p>
        ) : null}

        <div className="formActions">
          <SubmitButton label={mode === "create" ? "Cadastrar lead" : "Salvar lead"} />
          <Link className="secondaryButton" href="/leads">
            Voltar para leads
          </Link>
        </div>
      </form>

      {lead ? (
        <form action={deleteFormAction} className="deleteLeadForm">
          <input name="id" type="hidden" value={lead.id} />
          <p className="eyebrow">Zona de atenção</p>
          <h2>Remover oportunidade</h2>
          <p>
            Exclua apenas quando o cadastro for duplicado ou tiver sido criado
            por engano.
          </p>
          {deleteState.message ? (
            <p className={`authMessage authMessage${deleteState.status}`}>
              {deleteState.message}
            </p>
          ) : null}
          <DeleteButton />
        </form>
      ) : null}
    </div>
  );
}

function toDateTimeLocal(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes())
  ].join("");
}
