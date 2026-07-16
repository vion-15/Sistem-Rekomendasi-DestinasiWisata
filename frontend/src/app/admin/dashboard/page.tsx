"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface DashboardResponse {
    total_destinasi: number;
    total_wisatawan: number;
    total_petugas: number;
    total_ulasan: number;
}

interface AdminProfile {
    id: string;
    username: string;
    email: string;
    foto: string;
    created_at: string;
}

export default function DashboardPage() {

    const [dashboard, setDashboard] = useState<DashboardResponse>({
        total_destinasi: 0,
        total_wisatawan: 0,
        total_petugas: 0,
        total_ulasan: 0,
    });

    const [profile, setProfile] = useState<AdminProfile | null>(null);

    const getDashboard = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/dashboard");

            const result = await response.json();

            setDashboard(result.data);

        } catch (error) {
            console.error("Gagal mengambil data dashboard:", error);
        }
    };

    const getProfile = async () => {
        try {
            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );

            if (!userData.id) return;

            const response = await fetch(
                `http://localhost:8080/api/admin/${userData.id}`
            );

            const result = await response.json();

            setProfile(result.data);

        } catch (error) {
            console.error("Gagal mengambil profile:", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getDashboard();
        getProfile();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Dashboard Admin
            </h1>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Wisatawan
                    </h3>
                    <p className="text-3xl font-bold text-green-600">{dashboard.total_wisatawan}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Petugas
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">{dashboard.total_petugas}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Destinasi
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">{dashboard.total_destinasi}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Ulasan
                    </h3>
                    <p className="text-3xl font-bold text-orange-600">{dashboard.total_ulasan}</p>
                </div>
            </div>

            {/* Area Informasi Profile Admin */}
            <div className="mt-10">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                    Profile
                </h2>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Foto Profile */}
                        <div className="flex justify-center">
                            <div className="w-64 h-64 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">

                                {profile?.foto ? (
                                    <Image
                                        src={profile.foto}
                                        alt={profile.username}
                                        width={176}
                                        height={176}
                                        className="w-44 h-44 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-44 h-44 rounded-full bg-blue-600 text-white flex items-center justify-center text-6xl font-bold">
                                        {profile?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Informasi */}
                        <div className="flex-1 grid grid-cols-[180px_1fr] gap-y-6 gap-x-8 items-center">

                            <span className="text-lg font-medium text-gray-700">
                                Username
                            </span>

                            <div className="bg-gray-100 text-slate-900 rounded-lg px-4 py-3">
                                {profile?.username ?? "-"}
                            </div>

                            <span className="text-lg font-medium text-gray-700">
                                Email
                            </span>

                            <div className="bg-gray-100 text-slate-900 rounded-lg px-4 py-3">
                                {profile?.email ?? "-"}
                            </div>

                            <span className="text-lg font-medium text-gray-700">
                                Peran
                            </span>

                            <div className="bg-gray-100 text-slate-900 rounded-lg px-4 py-3">
                                Admin
                            </div>

                            <span className="text-lg font-medium text-gray-700">
                                Tanggal Bergabung
                            </span>

                            <div className="bg-gray-100 rounded-lg text-slate-900 px-4 py-3">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString(
                                        "id-ID",
                                        {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )
                                    : "-"}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}