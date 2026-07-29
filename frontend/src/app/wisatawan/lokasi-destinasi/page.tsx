"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import {
    getLanguage,
    Language,
} from "@/helpers/language";

import { t } from "@/helpers/translate";

const MapGIS = dynamic(() => import("@/components/MapGIS"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-slate-100">
            Memuat Peta...
        </div>
    ),
});

interface DestinasiMap {
    id: string;

    nama: string;
    nama_en: string;

    kategori: string;
    kategori_en: string;

    deskripsi: string;
    deskripsi_en: string;

    latitude: number;
    longitude: number;

    similarity_score: number;
}

type RouteInfo = {
    distanceKm: string;
    durationMin: string;
} | null;

export default function LokasiDestinasiPage() {

    const router = useRouter();
    const [selectedDest, setSelectedDest] =
        useState<DestinasiMap | null>(null);
    const [userLoc, setUserLoc] =
        useState<{ lat: number; lng: number } | null>(null);
    const [routeInfo, setRouteInfo] =
        useState<RouteInfo>(null);
    const [routePath, setRoutePath] =
        useState<[number, number][] | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] =
        useState(false);
    const [isCardOpen, setIsCardOpen] =
        useState(true);
    const [showLocationModal, setShowLocationModal] = useState(false);
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

    const getLocation = () => {
        if (!("geolocation" in navigator)) {
            setShowLocationModal(true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLoc({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });

                setShowLocationModal(false);
            },
            () => {
                setShowLocationModal(true);
            }
        );
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getLocation();
        const savedDest = localStorage.getItem("route_destination");
        if (savedDest) {
            const rawData = JSON.parse(savedDest);
            const strictDest: DestinasiMap = {
                id: rawData.id || "0",

                nama: rawData.nama || "Destinasi Wisata",
                nama_en: rawData.nama_en || rawData.nama || "Destination",

                kategori: rawData.kategori || "-",
                kategori_en: rawData.kategori_en || rawData.kategori || "-",

                deskripsi: rawData.deskripsi || "-",
                deskripsi_en: rawData.deskripsi_en || rawData.deskripsi || "-",

                latitude: Number(rawData.latitude) || 0,
                longitude: Number(rawData.longitude) || 0,

                similarity_score: Number(rawData.similarity_score) || 0,
            };

            setSelectedDest(strictDest);
        }
    }, []);

    useEffect(() => {
        if (!selectedDest || !userLoc) return;
        const loadRoute = async () => {
            setIsLoadingRoute(true);
            try {
                const url =
                    `https://router.project-osrm.org/route/v1/driving/` +
                    `${userLoc.lng},${userLoc.lat};` +
                    `${selectedDest.longitude},${selectedDest.latitude}` +
                    `?overview=full&alternatives=true&geometries=geojson`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.code === "Ok" && data.routes.length > 0) {
                    const route = data.routes[0];
                    setRouteInfo({
                        distanceKm: (route.distance / 1000).toFixed(1),
                        durationMin:
                            Math.round(route.duration / 60).toString(),
                    });
                    const coords = route.geometry.coordinates.map(
                        (c: number[]) =>
                            [c[1], c[0]] as [number, number]
                    );
                    setRoutePath(coords);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingRoute(false);
            }
        };
        loadRoute();
    }, [selectedDest, userLoc]);

    const handleCloseCard = () => {
        setIsCardOpen(false);
    };

    const handleOpenCard = () => {
        setIsCardOpen(true);
    };

    return (
        <div className="fixed inset-0 top-42.5 bg-slate-100 overflow-hidden">
            <MapGIS
                key="lokasi-destinasi"
                destinasiList={selectedDest ? [selectedDest] : []}
                selectedDest={selectedDest}
                onViewDetail={() => { }}
                userLoc={userLoc}
                routePath={routePath}
            />

            {!isCardOpen && (
                <button
                    onClick={handleOpenCard}
                    className="absolute top-6 left-14 z-20 bg-white/95 backdrop-blur-md rounded-xl shadow-lg 
                    border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:text-blue-600 transition 
                    flex items-center gap-2"
                >
                    <Info size={18} />
                    {lang.destinationInfo}
                </button>
            )}

            {isCardOpen && (
                <div className="absolute top-6 left-14 bottom-6 w-105 z-20">
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 
                    shadow-2xl h-full flex flex-col overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                            <button
                                onClick={() => router.back()}
                                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
                            >
                                <ArrowLeft size={22} />
                            </button>

                            <h2 className="text-xl font-bold text-slate-800">
                                {lang.destinationInfo}
                            </h2>
                            <button
                                onClick={handleCloseCard}
                                className="ml-auto text-slate-500 hover:text-red-500 font-bold text-lg"
                            >
                                X
                            </button>
                        </div>

                        {selectedDest ? (
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <h1 className="text-3xl font-black text-blue-700 mb-3">
                                    {language === "id"
                                        ? selectedDest.nama
                                        : selectedDest.nama_en}
                                </h1>
                                <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-bold">
                                    {language === "id"
                                        ? selectedDest.kategori
                                        : selectedDest.kategori_en}
                                </span>

                                <div className="mt-8">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-slate-600">
                                            {lang.matchLevel}
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            {(selectedDest.similarity_score * 100).toFixed(2)}%
                                        </span>
                                    </div>

                                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                            style={{
                                                width: `${selectedDest.similarity_score * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="uppercase tracking-widest text-xs text-slate-400 font-bold mb-3">
                                        {lang.descriptionTitle}
                                    </h3>
                                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 
                                    text-sm leading-7 text-slate-700">
                                        {language === "id"
                                            ? selectedDest.deskripsi
                                            : selectedDest.deskripsi_en}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="uppercase tracking-widest text-xs text-slate-400 font-bold mb-4">
                                        {lang.travelEstimate}
                                    </h3>

                                    {!userLoc ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                                            {lang.detectingLocation}
                                        </div>
                                    ) : isLoadingRoute ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 
                                        text-blue-700 animate-pulse">
                                            {lang.calculatingRoute}
                                        </div>
                                    ) : routeInfo ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 text-center">
                                                <div className="text-xs uppercase text-blue-500 font-bold mb-2">
                                                    {lang.distance}
                                                </div>
                                                <div className="text-3xl font-black text-blue-700">
                                                    {routeInfo.distanceKm}
                                                </div>
                                                <div className="text-sm text-blue-500">
                                                    {lang.kilometer}
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 text-center">
                                                <div className="text-xs uppercase text-blue-500 font-bold mb-2">
                                                    {lang.time}
                                                </div>
                                                <div className="text-3xl font-black text-blue-700">
                                                    {routeInfo.durationMin}
                                                </div>
                                                <div className="text-sm text-blue-500">
                                                    {lang.minute}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
                                            {lang.routeUnavailable}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-1 items-center justify-center text-center text-slate-500 px-8">
                                <div>
                                    <div className="text-5xl mb-4">
                                        📍
                                    </div>
                                    <p>
                                        {lang.noDestinationSelected}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="text-5xl text-center mb-4">
                            📍
                        </div>

                        <h2 className="text-xl font-bold text-center text-slate-800">
                            {lang.locationAccessRequired}
                        </h2>

                        <p className="mt-4 text-center text-slate-600 leading-relaxed">
                            {lang.locationAccessDescription}
                        </p>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={getLocation}
                                className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                {lang.tryAgain}
                            </button>

                            <button
                                onClick={() => router.back()}
                                className="flex-1 rounded-xl border py-3 font-semibold text-slate-800"
                            >
                                {lang.back}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}