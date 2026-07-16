import Link from "next/link";
import { Landmark, ArrowRight } from "lucide-react"; 
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
            
            {/* NAVBAR (Kapsul Melayang) */}
            <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <nav className="bg-slate-50/80 backdrop-blur-md rounded-full px-6 py-4 flex items-center justify-between shadow-sm border border-slate-200/60">
                    
                    {/* Logo Kiri */}
                    <Link href="/" className="flex items-center gap-2 text-slate-900 hover:opacity-80 transition-opacity">
                        <Image src={"/Logo Vektor.png"} width={40} height={40} alt="Logo" className="w-10 h-12" />
                        <span className="font-bold text-lg tracking-tight">Disparekraf</span>
                    </Link>

                    {/* Menu Tengah (Disembunyikan di layar kecil) */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-semibold text-slate-900">Home</Link>
                        <Link href="#about" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">About</Link>
                        <Link href="#destinasi" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Destinasi Wisata</Link>
                        <Link href="#kontak" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Kontak</Link>
                    </div>

                    {/* Menu Kanan (Auth) */}
                    <div className="flex items-center gap-5">
                        <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
                            Register
                        </Link>
                    </div>
                </nav>
            </div>

            {/* HERO SECTION */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
                    
                    {/* Kolom Kiri: Teks & Tombol CTA */}
                    <div className="w-full md:w-1/2 flex flex-col items-start text-left z-10">
                        <div className="inline-block px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs rounded-full tracking-wide mb-6">
                            ✈️ Eksplorasi Tanpa Batas
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                            Temukan Destinasi Wisata yang Sesuai dengan Preferensi Anda
                        </h1>
                        
                        <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
                            Sistem rekomendasi destinasi wisata yang membantu Anda menemukan tempat wisata berdasarkan minat dan preferensi anda menggunakan metode <span className="font-semibold text-slate-800">Content-Based Filtering</span>.
                        </p>
                        
                        {/* Tombol CTA (Telah Diperbagus) */}
                        <div className="mt-10 flex items-center gap-4">
                            <Link 
                                href="/login" 
                                className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-base font-bold rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                Ayo Jalan - Jalan !
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                        </div>
                    </div>

                    {/* Kolom Kanan: Gambar Ilustrasi Gunung Asli */}
                    <div className="w-full md:w-1/2 relative group">
                        {/* Efek glow/bayangan dekoratif di belakang gambar */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-slate-100 rounded-3xl transform translate-x-4 translate-y-4 -z-10 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                        
                        {/* Gambar Utama Gunung (Asli & High-Res) */}
                        <div className="overflow-hidden rounded-3xl shadow-2xl border border-white">
                            <img 
                                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop" 
                                alt="Pemandangan Gunung Megah" 
                                className="w-full h-[400px] md:h-[540px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        </div>
                    </div>

                </div>
            </main>
            
        </div>
    );
}