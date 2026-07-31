"use client"

import { useEffect, useState } from "react";
import {
    getLanguage,
    Language,
} from "@/helpers/language";
import { t } from "@/helpers/translate";

export default function LaporanPage() {

    const [language, setCurrentLanguage] =
        useState<Language>("id");

    const lang = t(language);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentLanguage(getLanguage());

        const handleLanguageChange = () => {
            setCurrentLanguage(getLanguage());
        };

        window.addEventListener(
            "languageChanged",
            handleLanguageChange
        );

        return () => {
            window.removeEventListener(
                "languageChanged",
                handleLanguageChange
            );
        };
    }, []);

    const handleDownload = async (jenis: string) => {
        try {
            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );
            if (!userData.id) {
                alert(lang.reportUserNotFound);
                return;
            }
            let endpoint = "";
            switch (jenis) {
                case "pencarian":
                    endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan-laporan/pencarian/${userData.id}`;
                    break;
                case "lokasi":
                    endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan-laporan/destinasi/${userData.id}`;
                    break;
                case "ulasan":
                    endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan-laporan/ulasan/${userData.id}`;
                    break;
                default:
                    return;
            }
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(lang.reportDownloadFailed);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const disposition = response.headers.get("Content-Disposition");
            let fileName = "laporan.csv";

            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match) {
                    fileName = match[1];
                }
            }

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(lang.reportDownloadFailed);
        }
    };

    return (
        <div className="px-10 py-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                {lang.reportTitle}
            </h2>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-lg">
                            <th className="py-4 w-20 text-center font-semibold">
                                {lang.reportTableNo}
                            </th>
                            <th className="py-4 px-6 text-left font-semibold">
                                {lang.reportTableName}
                            </th>
                            <th className="py-4 text-center font-semibold">
                                {lang.reportTableAction}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            [
                                {
                                    id: 1,
                                    nama:
                                        language === "id"
                                            ? lang.reportSearchData
                                            : lang.reportSearchData,
                                    jenis: "pencarian",
                                },
                                {
                                    id: 2,
                                    nama:
                                        language === "id"
                                            ? lang.reportDestinationData
                                            : lang.reportDestinationData,
                                    jenis: "lokasi",
                                },
                                {
                                    id: 3,
                                    nama:
                                        language === "id"
                                            ? lang.reportReviewData
                                            : lang.reportReviewData,
                                    jenis: "ulasan",
                                },
                            ].map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="text-gray-700 text-base border-t border-gray-200 hover:bg-gray-50 transition"
                                >
                                    <td className="py-5 text-center">
                                        {index + 1}
                                    </td>
                                    <td className="px-6">
                                        {item.nama}
                                    </td>
                                    <td>
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => handleDownload(item.jenis)}
                                                className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 
                                                transition shadow-sm"
                                            >
                                                {lang.reportDownload}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}