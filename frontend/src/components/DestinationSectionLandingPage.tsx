import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const featuredDestinations = [
    {
        id: 1,
        name: "Taman Margasatwa Ragunan",
        category: "Taman Wisata",
        city: "Jakarta Selatan",
        image: "/image/Ragunan.jpg",
    },
    {
        id: 2,
        name: "Monumen Nasional",
        category: "Wisata Sejarah",
        city: "Jakarta Pusat",
        image: "/image/Monas.jpg",
    },
    {
        id: 3,
        name: "Kota Tua Jakarta",
        category: "Wisata Sejarah",
        city: "Jakarta Barat",
        image: "/image/Kota-Tua.jpg",
    },
];

export default function DestinationSection() {
    return (
        <section
            id="destinasi"
            className="bg-slate-50 py-24"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Heading */}

                <div className="mx-auto max-w-3xl text-center">

                    <div
                        className="
                            mb-6 inline-flex items-center
                            rounded-full border border-blue-100
                            bg-blue-50 px-4 py-1.5
                            text-sm font-semibold text-blue-700
                        "
                    >
                        Destinasi Pilihan
                    </div>

                    <h2
                        className="
                            text-3xl font-extrabold
                            tracking-tight text-slate-900
                            md:text-4xl
                        "
                    >
                        Jelajahi Destinasi Wisata Unggulan
                    </h2>

                    <p
                        className="
                            mt-6 text-lg leading-relaxed
                            text-slate-600
                        "
                    >
                        Temukan beberapa destinasi wisata pilihan yang tersedia
                        di dalam sistem. Login untuk melihat lebih banyak
                        destinasi serta memperoleh rekomendasi sesuai
                        preferensi Anda.
                    </p>

                </div>

                {/* Cards */}

                <div
                    className="
                        mt-16 grid gap-8
                        md:grid-cols-2
                        lg:grid-cols-3
                    "
                >
                    {featuredDestinations.map((destination) => (
                        <article
                            key={destination.id}
                            className="
                                group overflow-hidden rounded-3xl
                                border border-slate-200 bg-white
                                shadow-sm transition-all duration-300
                                hover:-translate-y-1 hover:shadow-xl
                            "
                        >
                            <div className="overflow-hidden">
                                <Image
                                    src={destination.image}
                                    alt={destination.name}
                                    width={600}
                                    height={400}
                                    quality={100}
                                    className="
                                        h-64 w-full object-cover
                                        transition-transform duration-700
                                        group-hover:scale-105
                                    "
                                />
                            </div>

                            <div className="p-6">

                                <span
                                    className="
                                        inline-flex rounded-full
                                        bg-blue-50 px-3 py-1
                                        text-sm font-semibold
                                        text-blue-700
                                    "
                                >
                                    {destination.category}
                                </span>

                                <h3
                                    className="
                                        mt-4 text-xl font-bold
                                        text-slate-900
                                    "
                                >
                                    {destination.name}
                                </h3>

                                <div
                                    className="
                                        mt-4 flex items-center
                                        gap-2 text-slate-500
                                    "
                                >
                                    <MapPin size={18} />

                                    <span>{destination.city}</span>
                                </div>

                            </div>
                        </article>
                    ))}
                </div>

                {/* CTA */}

                <div className="mt-14 text-center">

                    <Link
                        href="/login"
                        className="
                            group inline-flex items-center
                            gap-3 rounded-2xl border
                            border-slate-300 bg-white
                            px-8 py-4
                            text-base font-bold text-slate-900
                            transition-all duration-300
                            hover:border-blue-600
                            hover:bg-blue-600
                            hover:text-white
                        "
                    >
                        Lihat Semua Destinasi

                        <ArrowRight
                            size={20}
                            className="
                                transition-transform duration-300
                                group-hover:translate-x-1
                            "
                        />
                    </Link>

                </div>

            </div>
        </section>
    );
}