"use client";

import React, { createContext, useContext, useState } from "react";

interface ForgotPasswordContextType {
    email: string | null;
    setEmail: (email: string | null) => void;
    resetToken: string | null;
    setResetToken: (token: string | null) => void;
}

const ForgotPasswordContext = createContext<ForgotPasswordContextType | undefined>(undefined);

export function useForgotPassword() {
    const context = useContext(ForgotPasswordContext);
    if (!context) {
        throw new Error("useForgotPassword must be used within a ForgotPasswordProvider");
    }
    return context;
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    const [email, setEmail] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null);

    return (
        <ForgotPasswordContext.Provider value={{ email, setEmail, resetToken, setResetToken }}>
            {children}
        </ForgotPasswordContext.Provider>
    );
}
