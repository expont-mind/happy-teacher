import { UserDataTableProps, UserRowProps } from "./types";
import { Frown } from "lucide-react";
import { DataTableLoader } from "../constants";
import { format } from "date-fns";
import Link from "next/link";

const UserRow = ({ user, index }: UserRowProps) => {
  const formattedId = String(index + 1).padStart(4, "0");

  return (
    <div className="flex w-full">
      <Link
        prefetch
        href={`/user/${user?.id}`}
        className="w-full flex items-center border-t border-[#E4E4E7] h-[64px] hover:bg-[#FAFAFA] transition-all duration-200"
      >
        <p className="px-4 py-2 max-w-[82px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {formattedId}
        </p>
        <p className="px-4 py-2 w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {user.full_name || "-/-"}
        </p>
        <p className="px-4 py-2 w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {user.email || "-/-"}
        </p>
        <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {user?.created_at
            ? format(new Date(user.created_at), "MMM d, yyyy")
            : "-/-"}
        </p>
      </Link>
    </div>
  );
};

export const UserDataTable = ({ data, loading }: UserDataTableProps) => {
  return (
    <div className="w-full">
      <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
        <div className="flex items-center">
          <p className="px-4 py-2 max-w-[82px] w-full text-[#09090B] font-Inter text-sm font-normal h-10 flex items-center border-r border-[#E4E4E7]">
            ID
          </p>
          <p className="px-4 py-2  w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Name
          </p>
          <p className="px-4 py-2  w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Email
          </p>
          <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Date
          </p>
        </div>

        {loading ? (
          <DataTableLoader />
        ) : data && data.length > 0 ? (
          data.map((user, index) => (
            <UserRow key={user.id} user={user} index={index} />
          ))
        ) : (
          <div className="py-10 flex flex-col gap-2 justify-center items-center border-t border-[#E4E4E7]">
            <Frown size={40} color="#09090B" />
            <p className="text-[#09090B] text-base font-Inter font-semibold">
              User not found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
