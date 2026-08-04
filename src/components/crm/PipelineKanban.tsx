"use client";

import Link from "next/link";
import { useState } from "react";

import { formatCurrency, formatShortDate } from "@/lib/crm/dashboard";
import type { KanbanColumn } from "@/lib/crm/kanban";

interface PipelineKanbanProps {
  columns: KanbanColumn[];
}

export function PipelineKanban({ columns }: PipelineKanbanProps) {
  const [selectedStage, setSelectedStage] = useState(columns[0]?.stage ?? "Novo");

  return (
    <div className="kanbanWorkspace">
      <label className="kanbanMobileSelector">
          Etapa exibida no celular
        <select
          aria-label="Selecionar etapa do funil"
          onChange={(event) => {
            const nextColumn = columns.find(
              (column) => column.stage === event.target.value
            );
            if (nextColumn) setSelectedStage(nextColumn.stage);
          }}
          value={selectedStage}
        >
          {columns.map((column) => (
            <option key={column.stage} value={column.stage}>
              {column.stage} ({column.leads.length})
            </option>
          ))}
        </select>
      </label>

      <div className="kanbanBoard" aria-label="Funil de vendas em formato Kanban">
        {columns.map((column, index) => (
          <section
            className={`kanbanColumn${column.stage === selectedStage ? " kanbanColumnSelected" : ""}`}
            key={column.stage}
          >
            <header className="kanbanColumnHeader">
              <div>
                <span className="stageIndex">{String(index + 1).padStart(2, "0")}</span>
                <h3>{column.stage}</h3>
              </div>
              <strong>{column.leads.length}</strong>
            </header>
            <div className="kanbanColumnValue">{formatCurrency(column.totalValue)}</div>
            <div className="kanbanCards">
              {column.leads.length ? (
                column.leads.map((lead) => (
                  <article className="kanbanLeadCard" key={lead.id}>
                    <div className="kanbanLeadCardTopline">
                      <span>{lead.source}</span>
                      <strong>{lead.probability}%</strong>
                    </div>
                    <h4>{lead.companyName}</h4>
                    <p>{lead.contactName}</p>
                    <div className="kanbanLeadCardMeta">
                      <strong>{formatCurrency(lead.estimatedValue)}</strong>
                      <span>{formatShortDate(lead.nextActionAt)}</span>
                    </div>
                    <p className="kanbanNextAction">{lead.nextAction}</p>
                    <Link className="tableAction" href={`/leads/${lead.id}`}>
                      Abrir oportunidade
                    </Link>
                  </article>
                ))
              ) : (
                <div className="kanbanEmptyColumn">Nenhuma oportunidade nesta etapa.</div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
