export const DataTableLoader = () => {
  return (
    <div className="py-10 flex flex-col gap-2 justify-center items-center border-t border-[#E4E4E7]">
      <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-10 h-10 animate-spin" />
      <p className="text-[#09090B] text-base font-Inter font-semibold">
        Loading...
      </p>
    </div>
  );
};
