import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/HeroSectionLandingPage";
import AboutSection from "@/components/AboutSectionLandingPage";
import DestinationSection from "@/components/DestinationSectionLandingPage";
import Footer from "@/components/Footer";

export default function LandingPage() {
    const navLinkStyle = 
        "px-1 py-1 text-lg font-semibold text-slate-600 transition-colors duration-200 hover:text-blue-600"
    
    return (
        <div 
            className="min-h-screen overflow-x-hidden bg-white font-sans selection:bg-blue-100 
            selection:text-blue-900">
            <header className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <nav 
                    className="
                        flex items-center justify-between rounded-full border border-slate-200/60
                        bg-slate-50/80 px-6 py-4 shadow-sm backdrop-blur-md">
                    <Link 
                        href="/" 
                        className="
                            flex items-center gap-2 text-slate-900 transition-opacity
                            hover:opacity-80 ">
                        <Image 
                            src={"/logo-vektor.png"} 
                            width={40} 
                            height={48} 
                            alt="Logo Disparekraf" 
                        />

                        <span className="font-bold text-lg tracking-tight">Disparekraf</span>
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link 
                            href="/" 
                            className={navLinkStyle}>Home</Link>
                        <Link 
                            href="#about" 
                            className={navLinkStyle}>About</Link>
                        <Link 
                            href="#destinasi" 
                            className={navLinkStyle}>Destinasi Wisata</Link>
                    </div>

                    <div className="flex items-center gap-5">
                        <Link 
                            href="/login" 
                            className="
                                px-1 py-1 text-lg font-semibold text-slate-600 transition-colors
                                duration-200 hover:text-blue-600">
                            Login
                        </Link>

                        <Link 
                            href="/register" 
                            className="
                                px-1 py-1 text-lg font-semibold text-slate-600 
                                transition-colors duration-200 hover:text-blue-600">
                            Register
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <section className="py-15">
                    <HeroSection />
                    <AboutSection />
                    <DestinationSection />
                </section>
            </main>

            <Footer />
        </div>
    );
}