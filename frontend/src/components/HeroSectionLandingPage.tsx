import { ArrowRight, Plane } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
    lang: {
        heroBadge: string;
        heroTitle: string;
        heroDescription: string;
        heroButton: string;
        heroImageAlt: string;
    };
};

export default function HeroSection({
    lang,
}: HeroSectionProps) {
    return (
        <section
            className="
                flex flex-col items-center justify-between gap-12 lg:gap-16 md:flex-row">
            <div className="flex w-full flex-col items-start text-left md:w-1/2">
                <div
                    className="
                        mb-6 inline-flex items-center gap-2 rounded-full border 
                        border-blue-100 bg-blue-50 px-4 py-1.5   
                        text-sm font-semibold text-blue-700 tracking-wide">
                    <Plane size={16} />
                    {lang.heroBadge}
                </div>

                <h1
                    className="
                        max-w-2xl text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold 
                        leading-[1.15] tracking-tight text-slate-900">
                    {lang.heroTitle}
                </h1>

                <p
                    className="
                        mt-6 max-w-lg text-lg md:text-xl leading-relaxed 
                        text-slate-600">
                    {lang.heroDescription}
                </p>

                <div className="mt-10">
                    <Link
                        href="/login"
                        className="
                            group inline-flex items-center gap-3 rounded-2xl bg-slate-900 
                            px-8 py-4 text-base font-bold text-white shadow-lg 
                            shadow-slate-900/20 transition-all 
                            duration-300 hover:-translate-y-1 hover:bg-blue-600 
                            hover:shadow-blue-600/30"
                    >
                        {lang.heroButton}
                        <ArrowRight
                            size={20}
                            className="
                                transition-transform 
                                duration-300 ease-out
                                group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>

            <div className="relative group w-full md:w-1/2">
                <div
                    className="
                        pointer-events-none absolute inset-0 -z-10 translate-x-2 
                        translate-y-2 rounded-3xl bg-blue-100 transition-transform 
                        duration-500 group-hover:translate-x-1 group-hover:translate-y-1
                        md:translate-x-4 md:translate-y-4 md:group-hover:translate-x-2
                        md:group-hover:translate-y-2" />

                <div
                    className="
                        overflow-hidden rounded-3xl shadow-2xl 
                        border border-slate-200 select-none">
                    <Image
                        src="/images/foto-herosection-landingpage.jpg"
                        alt={lang.heroImageAlt}
                        width={1200}
                        height={800}
                        quality={100}
                        className="
                            w-full h-auto object-cover transition-transform duration-700 
                            ease-out group-hover:scale-105"
                    />
                </div>
            </div>
        </section>
    );
}