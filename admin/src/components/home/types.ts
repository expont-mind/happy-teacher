export interface User {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UserDataTableProps {
  data: User[];
  loading: boolean;
}

export interface UserRowProps {
  user: User;
  index: number;
}
