"use client"

export default function LaporanPage() {

    return (
        <div className="px-10 py-8">

            <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                Laporan
            </h2>


            <div className="
        bg-white
        rounded-xl
        shadow-md
        border border-gray-200
        overflow-hidden
    ">
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
                                },
                                {
                                    id: 2,
                                    nama: "Data Lokasi Destinasi Kamu",
                                },
                                {
                                    id: 3,
                                    nama: "Data Ulasan Kamu",
                                }
                            ].map((item, index) => (

                                <tr
                                    key={item.id}
                                    className="
                                text-gray-700
                                text-base
                                border-t
                                border-gray-200
                                hover:bg-gray-50
                                transition
                            "
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
                                                className="
                                            bg-blue-600
                                            text-white
                                            px-8
                                            py-2.5
                                            rounded-lg
                                            hover:bg-blue-700
                                            transition
                                            shadow-sm
                                        "
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