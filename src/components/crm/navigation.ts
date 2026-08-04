export const CRM_NAV_ITEMS = [
  { id: "overview", label: "Visão Geral", href: "/" },
  { id: "leads", label: "Leads", href: "/leads" },
  { id: "conversations", label: "Conversas", href: "/conversas" },
  { id: "whatsapp", label: "WhatsApp", href: "/integracoes/whatsapp" },
  { id: "profile", label: "Perfil", href: "/perfil" }
] as const;

export type CrmNavItemId = (typeof CRM_NAV_ITEMS)[number]["id"];
