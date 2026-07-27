"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DirectoryListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && role === "trader") {
      router.replace("/trader");
    }
  }, [role, router, isMounted]);

  // Optionally, you could show nothing while deciding to redirect
  if (isMounted && role === "trader") {
    return null;
  }

  return <>{children}</>;
}
