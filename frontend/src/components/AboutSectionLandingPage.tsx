import { MapPinned, Sparkles, Target } from "lucide-react";

export default function AboutSection() {
    return (
        <section
            id="about"
            className="bg-white py-24"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Heading */}
                <div className="mx-auto max-w-3xl text-center">

                    <div
                        className="
                            mb-6 inline-flex items-center gap-2 rounded-full
                            border border-blue-100 bg-blue-50
                            px-4 py-1.5
                            text-sm font-semibold text-blue-700
                        "
                    >
                        Tentang Aplikasi
                    </div>

                    <h2
                        className="
                            text-3xl font-extrabold tracking-tight text-slate-900
                            md:text-4xl
                        "
                    >
                        Mengenal Sistem Rekomendasi Disparekraf
                    </h2>

                    <p
                        className="
                            mt-6 text-lg leading-relaxed text-slate-600
                        "
                    >
                        Disparekraf merupakan sistem rekomendasi destinasi wisata
                        yang membantu wisatawan menemukan tempat wisata sesuai
                        minat dan preferensi. Dengan memanfaatkan metode{" "}
                        <span className="font-semibold text-slate-800">
                            Content-Based Filtering
                        </span>
                        , sistem memberikan rekomendasi yang lebih relevan sehingga
                        proses mencari destinasi menjadi lebih cepat, mudah, dan
                        sesuai kebutuhan pengguna.
                    </p>

                </div>

                {/* Feature Cards */}
                <div
                    className="
                        mt-16 grid gap-8
                        md:grid-cols-2
                        lg:grid-cols-3
                    "
                >

                    <div
                        className="
                            rounded-3xl border border-slate-200
                            bg-white p-8
                            transition-all duration-300
                            hover:-translate-y-1
                            hover:shadow-xl
                        "
                    >
                        <div
                            className="
                                inline-flex rounded-2xl
                                bg-blue-50 p-3 text-blue-600
                            "
                        >
                            <Target size={24} />
                        </div>

                        <h3
                            className="
                                mt-6 text-xl font-bold text-slate-900
                            "
                        >
                            Rekomendasi Personal
                        </h3>

                        <p
                            className="
                                mt-3 leading-relaxed text-slate-600
                            "
                        >
                            Sistem memberikan rekomendasi berdasarkan
                            karakteristik destinasi dan preferensi pengguna
                            sehingga hasil yang ditampilkan menjadi lebih
                            relevan.
                        </p>
                    </div>

                    <div
                        className="
                            rounded-3xl border border-slate-200
                            bg-white p-8
                            transition-all duration-300
                            hover:-translate-y-1
                            hover:shadow-xl
                        "
                    >
                        <div
                            className="
                                inline-flex rounded-2xl
                                bg-blue-50 p-3 text-blue-600
                            "
                        >
                            <MapPinned size={24} />
                        </div>

                        <h3
                            className="
                                mt-6 text-xl font-bold text-slate-900
                            "
                        >
                            Destinasi Beragam
                        </h3>

                        <p
                            className="
                                mt-3 leading-relaxed text-slate-600
                            "
                        >
                            Menyediakan berbagai pilihan destinasi wisata dari
                            berbagai kategori sehingga pengguna memiliki lebih
                            banyak alternatif tempat yang dapat dikunjungi.
                        </p>
                    </div>

                    <div
                        className="
                            rounded-3xl border border-slate-200
                            bg-white p-8
                            transition-all duration-300
                            hover:-translate-y-1
                            hover:shadow-xl
                        "
                    >
                        <div
                            className="
                                inline-flex rounded-2xl
                                bg-blue-50 p-3 text-blue-600
                            "
                        >
                            <Sparkles size={24} />
                        </div>

                        <h3
                            className="
                                mt-6 text-xl font-bold text-slate-900
                            "
                        >
                            Cepat dan Mudah
                        </h3>

                        <p
                            className="
                                mt-3 leading-relaxed text-slate-600
                            "
                        >
                            Antarmuka yang sederhana membuat proses memperoleh
                            rekomendasi menjadi lebih cepat tanpa langkah yang
                            rumit sehingga nyaman digunakan oleh semua pengguna.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}