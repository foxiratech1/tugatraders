"use client";

import { useAuth } from "@/hooks/useAuth";

export default function ConditionalSection({ 
  children, 
  hideForRole 
}: { 
  children: React.ReactNode; 
  hideForRole: string;
}) {
  const { role } = useAuth();
  
  if (role === hideForRole) {
    return null;
  }
  
  return <>{children}</>;
}
