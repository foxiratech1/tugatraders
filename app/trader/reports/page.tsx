"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import TraderReportTable from "@/components/Trader/TraderReportTable";

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await authApi.getMyReports();
            setReports(res.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-6">
                My Reports
            </h1>

            <div className="bg-white rounded-xl shadow border">
                <TraderReportTable
                    reports={reports}
                    loading={loading}
                />
            </div>
        </div>
    );
}