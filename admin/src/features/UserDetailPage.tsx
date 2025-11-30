"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Sidebar } from "@/components/constants";

export const UserDetailPage = () => {
  const router = useRouter();

  return (
    <div className="flex">
      <Sidebar user="active" payment="" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1200px] w-full h-full py-4 flex flex-col gap-4">
          <div className="flex gap-4 items-center h-10">
            <button
              onClick={() => router.back()}
              className="border border-gray-200 rounded-lg bg-white text-black w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="h-10 flex items-center font-Inter text-2xl font-semibold -tracking-[0.6px] text-[#020617]">
              User Detail
            </p>
          </div>
          <div className="flex gap-4">
            {/* <OrderContent order={order} loading={loading} />
          <UserContent order={order} refetch={refetch} loading={loading} /> */}
          </div>
        </div>
      </div>
    </div>
  );
};
