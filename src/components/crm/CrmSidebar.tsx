import Image from "next/image";
import Link from "next/link";

import {
  CRM_NAV_ITEMS,
  getCrmNavItemClassName,
  type CrmNavItemId
} from "./navigation";

interface CrmSidebarProps {
  adminName: string;
  activeItem: CrmNavItemId;
}

export function CrmSidebar({ adminName, activeItem }: CrmSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="logoChip">
        <Image
          src="/logo-porto-alegre-oficial.png"
          alt="Porto Alegre Oficial"
          width={140}
          height={132}
          priority
        />
      </div>

      <nav aria-label="Navegação principal">
        {CRM_NAV_ITEMS.map((item) => (
          <Link
            className={getCrmNavItemClassName(item.id, activeItem)}
            href={item.href}
            key={item.id}
          >
            <span className="navDot" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebarFooter">
        <span className="eyebrow">Acesso atual</span>
        <Link className="profileUserLink" href="/perfil">
          {adminName}
        </Link>
        <span>Administrador do CRM</span>
        <form action="/auth/sign-out" method="post">
          <button className="signOutButton" type="submit">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
