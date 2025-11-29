import { Dispatch, SetStateAction } from "react";

export type SearchBarProps = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
};

export type SignOutDilagProps = {
  logout: () => void;
};
