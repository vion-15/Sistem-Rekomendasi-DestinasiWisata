import { MapPinned, Sparkles, Target } from "lucide-react";

type AboutSectionProps = {
    lang: {
        aboutBadge: string;
        aboutTitle: string;
        aboutDescription: string;

        feature1Title: string;
        feature1Description: string;

        feature2Title: string;
        feature2Description: string;

        feature3Title: string;
        feature3Description: string;
    };
};

export default function AboutSection({
    lang,
}: AboutSectionProps) {
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
                        {lang.aboutBadge}
                    </div>

                    <h2
                        className="
                            text-3xl font-extrabold tracking-tight text-slate-900
                            md:text-4xl
                        "
                    >
                        {lang.aboutTitle}
                    </h2>

                    <p
                        className="
                            mt-6 text-lg leading-relaxed text-slate-600
                        "
                    >
                        {lang.aboutDescription}
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
                            {lang.feature1Title}
                        </h3>

                        <p
                            className="
                                mt-3 leading-relaxed text-slate-600
                            "
                        >
                            {lang.feature1Description}
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
                            {lang.feature2Title}
                        </h3>

                        <p
                            className="
                                mt-3 leading-relaxed text-slate-600
                            "
                        >
                            {lang.feature2Description}
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
                            {lang.feature3Title}
                        </h3>

                        <p
                            className="
                                mt-3 leading-relaxed text-slate-600
                            "
                        >
                            {lang.feature3Description}
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}