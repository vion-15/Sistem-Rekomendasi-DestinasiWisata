"use client"

export default function LaporanPage() {

    const handleDownload = async (jenis: string) => {
        try {
            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );
            if (!userData.id) {
                alert("Data pengguna tidak ditemukan.");
                return;
            }
            let endpoint = "";
            switch (jenis) {
                case "pencarian":
                    endpoint = `http://localhost:8080/api/wisatawan-laporan/pencarian/${userData.id}`;
                    break;
                case "lokasi":
                    endpoint = `http://localhost:8080/api/wisatawan-laporan/destinasi/${userData.id}`;
                    break;
                case "ulasan":
                    endpoint = `http://localhost:8080/api/wisatawan-laporan/ulasan/${userData.id}`;
                    break;
                default:
                    return;
            }
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error("Gagal mengunduh laporan");
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
            alert("Gagal mengunduh laporan.");
        }
    };

    return (
        <div className="px-10 py-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                Laporan
            </h2>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-lg">
                            <th className="py-4 w-20 text-center font-semibold">
                                No
                            </th>
                            <th className="py-4 px-6 text-left font-semibold">
                                Nama Laporan
                            </th>
                            <th className="py-4 text-center font-semibold">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            [
                                {
                                    id: 1,
                                    nama: "Data Pencarian Kamu",
                                    jenis: "pencarian",
                                },
                                {
                                    id: 2,
                                    nama: "Data Lokasi Destinasi Kamu",
                                    jenis: "lokasi",
                                },
                                {
                                    id: 3,
                                    nama: "Data Ulasan Kamu",
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
                                                Download
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