"use client";

import { useAuth } from "@/src/components/auth";
import { BottomNavbar } from "./BottomNavbar";

export function BottomNavbarWrapper() {
  const { activeProfile, loading } = useAuth();
  if (loading || !activeProfile) return null;
  return <BottomNavbar />;
}
