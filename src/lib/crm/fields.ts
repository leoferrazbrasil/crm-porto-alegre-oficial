export type CrmFieldType =
  | "texto"
  | "lista"
  | "url"
  | "e-mail"
  | "booleano"
  | "data"
  | "moeda"
  | "pontuação"
  | "fórmula";

export interface CrmFieldDefinition {
  order: number;
  name: string;
  type: CrmFieldType;
  required: boolean;
  example: string;
  rule: string;
}

function field(
  order: number,
  name: string,
  type: CrmFieldType,
  required: boolean,
  example = "",
  rule = ""
): CrmFieldDefinition {
  return { order, name, type, required, example, rule };
}

export const CRM_FIELD_DEFINITIONS: readonly CrmFieldDefinition[] = [
  field(1, "ID do lead", "texto", true, "POA-0001", "Único"),
  field(2, "Empresa", "texto", true, "Restaurante Exemplo", "Nome comercial"),
  field(3, "CNPJ", "texto", false, "00.000.000/0001-00", "Coletar antes do contrato"),
  field(4, "Segmento", "lista", true, "Gastronomia", "Usar taxonomia do ICP"),
  field(5, "Cidade", "lista", true, "Porto Alegre", "Porto Alegre ou município do RS"),
  field(6, "Bairro", "texto", false, "Moinhos de Vento", "Quando relevante"),
  field(7, "Site", "url", false, "https://exemplo.com.br", "URL pública"),
  field(8, "Instagram", "url", true, "https://instagram.com/exemplo", "URL do perfil"),
  field(9, "Nome do contato", "texto", false, "Ana Souza", "Não inferir"),
  field(10, "Cargo", "texto", false, "Gerente de Marketing", "Não inferir"),
  field(11, "E-mail", "e-mail", false, "ana@exemplo.com.br", "Preferir corporativo"),
  field(12, "Telefone", "texto", false, "+5551999999999", "Formato internacional"),
  field(13, "Canal de origem", "lista", true, "Instagram", "Instagram; e-mail; telefone; inbound; indicação; evento"),
  field(14, "Detalhe de origem", "texto", false, "@portoalegreoficial", "Perfil campanha ou parceiro"),
  field(15, "Opt-in WhatsApp", "booleano", true, "FALSO", "Obrigatório antes de mensagem proativa"),
  field(16, "Data do opt-in", "data", false, "2026-07-29", "Obrigatória se opt-in verdadeiro"),
  field(17, "Prova do opt-in", "texto", false, "Link ou nota", "Origem auditável"),
  field(18, "Responsável interno", "lista", true, "Leonardo", "Um único owner"),
  field(19, "Etapa", "lista", true, "Novo", "Etapas oficiais do funil de vendas"),
  field(20, "Status da próxima ação", "lista", true, "Pendente", "Pendente; concluída; vencida"),
  field(21, "Próxima ação", "texto", true, "Enviar follow-up", "Nenhuma oportunidade sem ação"),
  field(22, "Data da próxima ação", "data", true, "2026-07-31", "Obrigatória"),
  field(23, "Último contato", "data", false, "2026-07-29", "Atualizar após interação"),
  field(24, "Objetivo da campanha", "texto", false, "Gerar reservas", "Declarado pelo lead"),
  field(25, "Oferta a divulgar", "texto", false, "Menu de inverno", "Oferta real"),
  field(26, "Geografia alvo", "texto", false, "Porto Alegre", "Cidade ou região"),
  field(27, "Data ou janela", "data", false, "2026-08-15", "Data crítica"),
  field(28, "CTA principal", "lista", false, "Reserva", "Reserva; conversa; visita; cupom; cadastro; compra"),
  field(29, "URL de destino", "url", false, "https://exemplo.com.br/reserva", "Usar UTM"),
  field(30, "Orçamento disponível", "moeda", false, "5900", "Valor declarado"),
  field(31, "Faixa de orçamento", "lista", false, "R$ 5k–10k", "Faixas padronizadas"),
  field(32, "Decisor identificado", "booleano", true, "FALSO"),
  field(33, "Capacidade validada", "booleano", true, "FALSO", "Estoque agenda ou atendimento"),
  field(34, "Potencial de recorrência", "lista", true, "Médio", "Baixo; médio; alto"),
  field(35, "Mensurabilidade", "lista", true, "Média", "Baixa; média; alta"),
  field(36, "Fit regional", "pontuação", true, "20", "0 a 25"),
  field(37, "Capacidade e oferta", "pontuação", true, "15", "0 a 20"),
  field(38, "Intenção e urgência", "pontuação", true, "12", "0 a 20"),
  field(39, "Acesso ao decisor", "pontuação", true, "10", "0 a 15"),
  field(40, "Recorrência", "pontuação", true, "5", "0 a 10"),
  field(41, "Mensuração", "pontuação", true, "7", "0 a 10"),
  field(42, "Score total", "fórmula", true, "69", "Soma dos seis critérios"),
  field(43, "Classe", "fórmula", true, "B", "A 75+; B 60–74; C 45–59; nurture 30–44"),
  field(44, "Produto recomendado", "lista", false, "Descoberta Local", "Produtos oficiais"),
  field(45, "Perfis recomendados", "texto", false, "@portoalegreoficial", "Ativos justificados"),
  field(46, "Valor da oportunidade", "moeda", false, "5900", "Valor líquido de repasses"),
  field(47, "Probabilidade", "fórmula", true, "0.7", "Derivada da etapa"),
  field(48, "Valor ponderado", "fórmula", true, "4130", "Valor x probabilidade"),
  field(49, "Data esperada de fechamento", "data", false, "2026-08-05", "Forecast"),
  field(50, "Motivo de perda", "lista", false, "Sem prioridade", "Obrigatório em perdido"),
  field(51, "Concorrente ou alternativa", "texto", false, "Mídia paga", "Se informado"),
  field(52, "UTM campanha", "texto", false, "poa_descoberta_cliente_202608", "Padronizada"),
  field(53, "Código ou cupom", "texto", false, "POA10", "Quando aplicável"),
  field(54, "Contrato assinado", "booleano", true, "FALSO"),
  field(55, "Pagamento inicial recebido", "booleano", true, "FALSO"),
  field(56, "Data do briefing", "data", false, "2026-08-06"),
  field(57, "Data de publicação", "data", false, "2026-08-15"),
  field(58, "Link da publicação", "url", false, "https://instagram.com/p/exemplo"),
  field(59, "Relatório entregue", "data", false, "2026-08-24"),
  field(60, "Data da renovação", "data", false, "2026-08-25"),
  field(61, "Consentimento para case", "booleano", true, "FALSO", "Não publicar sem autorização"),
  field(62, "Observações", "texto", false, "", "Sem dados sensíveis desnecessários")
];
