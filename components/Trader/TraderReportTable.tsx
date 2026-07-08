"use client";

import React from "react";

interface Report {
    id: string;
    reportType: string;
    reason: string;
    customReason: string;
    status: string;
    createdAt: string;
}

interface TraderReportTableProps {
    reports: Report[];
    loading?: boolean;
}

const TraderReportTable: React.FC<TraderReportTableProps> = ({
    reports,
    loading,
}) => {
    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Loading reports...
            </div>
        );
    }

    if (!reports.length) {
        return (
            <div className="p-6 text-center text-gray-500">
                No reports found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-[#F8F8F8]">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold">#</th>
                        <th className="px-4 py-3 text-left font-semibold">
                            Report Type
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                            Reason
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                            Custom Reason
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                            Created At
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {reports.map((report, index) => (
                        <tr
                            key={report.id}
                            className="border-b hover:bg-gray-50"
                        >
                            <td className="px-4 py-3">{index + 1}</td>

                            <td className="px-4 py-3 font-medium">
                                {report.reportType}
                            </td>

                            <td className="px-4 py-3">
                                {report.reason}
                            </td>

                            <td className="px-4 py-3">
                                {report.customReason || "-"}
                            </td>

                            <td className="px-4 py-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium
                    ${report.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : report.status === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {report.status}
                                </span>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                                {new Date(report.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TraderReportTable;