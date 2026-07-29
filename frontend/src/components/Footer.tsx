import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const navigationLinks = (
    lang: FooterProps["lang"]
) => [
        {
            label: lang.footerHome,
            href: "/",
        },
        {
            label: lang.footerAbout,
            href: "#about",
        },
        {
            label: lang.footerDestination,
            href: "#destinasi",
        },
        {
            label: lang.footerLogin,
            href: "/login",
        },
    ];

type FooterProps = {
    lang: {
        footerDescription: string;

        footerNavigation: string;
        footerHome: string;
        footerAbout: string;
        footerDestination: string;
        footerLogin: string;

        footerContact: string;

        footerAddress: string;
        footerEmail: string;
        footerPhone: string;

        footerCopyright: string;
    };
};

export default function Footer({
    lang,
}: FooterProps) {

    const links = navigationLinks(lang);

    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">

                    {/* Brand */}
                    <div>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <Image
                                src="/logo-vektor-white.png"
                                alt="Logo Disparekraf"
                                width={40}
                                height={48}
                            />

                            <span className="text-xl font-bold text-white">
                                Disparekraf
                            </span>
                        </Link>

                        <p className="mt-5 max-w-sm leading-relaxed text-slate-400">
                            {lang.footerDescription}
                        </p>

                    </div>

                    {/* Navigation */}
                    <div>

                        <h3 className="text-lg font-semibold text-white">
                            {lang.footerNavigation}
                        </h3>

                        <nav className="mt-5 flex flex-col gap-4">
                            {links.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="
                                        transition-colors
                                        duration-200
                                        hover:text-blue-400
                                    "
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                    </div>

                    {/* Contact */}
                    <div>

                        <h3 className="text-lg font-semibold text-white">
                            {lang.footerContact}
                        </h3>

                        <div className="mt-5 space-y-4">

                            <div className="flex items-start gap-3">
                                <MapPin
                                    size={20}
                                    className="mt-0.5 text-blue-400"
                                />

                                <span>
                                    {lang.footerAddress}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail
                                    size={20}
                                    className="text-blue-400"
                                />

                                <span>
                                    {lang.footerEmail}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone
                                    size={20}
                                    className="text-blue-400"
                                />

                                <span>
                                    {lang.footerPhone}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Disparekraf. {lang.footerCopyright}
                </div>

            </div>
        </footer>
    );
}