import Link from "next/link";
import { ActiveZap, WhiteCircle, Zap } from "../svg";

type SidebarLinkProps = {
  href: string;
  isActive: boolean;
  label: string;
};

const SidebarLink = ({ href, isActive, label }: SidebarLinkProps) => (
  <Link
    prefetch={true}
    href={href}
    className={`py-1.5 px-2 flex items-center gap-2 rounded-sm ${
      isActive ? "bg-[#F4F4F5]" : "bg-white"
    }`}
  >
    {isActive ? <ActiveZap /> : <Zap />}
    <p
      className={`font-Inter text-sm font-normal ${
        isActive ? "text-[#09090B]" : "text-gray-500"
      }`}
    >
      {label}
    </p>
  </Link>
);

type SidebarType = {
  user: string;
  payment: string;
};

export const Sidebar = (props: SidebarType) => {
  return (
    <div className="max-w-[240px] min-h-screen w-full bg-white border-r border-[#E2E8F0] flex flex-col">
      <div className="h-full flex flex-col justify-between">
        <div className="w-full h-full relative">
          <div className="p-2 w-full">
            <div className="p-2 flex gap-2 items-center">
              <div className="p-2 rounded-lg bg-[#2563EB]">
                <WhiteCircle />
              </div>
              <div className="flex flex-col">
                <p className="font-Inter text-sm font-medium text-[#334155]">
                  Expont Mind
                </p>
                <p className="font-Inter text-xs font-normal text-[#334155]">
                  Admin
                </p>
              </div>
            </div>
          </div>
          <div className="p-2 w-full">
            <SidebarLink href="/" isActive={!!props.user} label="User" />
            <SidebarLink
              href="/payment"
              isActive={!!props.payment}
              label="Payment"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
