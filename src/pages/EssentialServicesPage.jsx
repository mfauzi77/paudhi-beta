import React from "react";
import Footer from "../components/Footer";

const essentialServicesData = [
  {
    category: "KESEHATAN DAN GIZI",
    services: [
      "Layanan kesehatan dan gizi bagi calon ibu",
      "Layanan kesehatan dan gizi bagi ibu",
      "Layanan kesehatan dan gizi bagi bayi dan anak",
      "Layanan sanitasi dan air bersih untuk keluarga",
    ],
    color: "from-green-400 to-emerald-500",
  },
  {
    category: "PENGASUHAN",
    services: [
      "Layanan edukasi pengasuhan bagi keluarga untuk dapat mengasuh anak dengan layak",
      "Layanan edukasi pengasuhan bagi tenaga pengasuh",
      "Pengasuhan sementara/di luar rumah (day care) untuk anak usia 0–6 tahun",
    ],
    color: "from-blue-400 to-cyan-500",
  },
  {
    category: "PENDIDIKAN",
    services: [
      "Layanan pendidikan bagi anak usia 3–6 tahun",
      "Layanan pemberian identitas hukum bagi anak",
    ],
    color: "from-purple-400 to-pink-500",
  },
  {
    category: "PERLINDUNGAN",
    services: [
      "Lingkungan yang aman dari kekerasan di manapun anak berada",
      "Fasilitasi bagi anak dalam kategori memerlukan perlindungan khusus",
      "Pengasuhan pengganti bagi anak yang terlantarkan atau mengalami perlakuan salah lainnya",
    ],
    color: "from-orange-400 to-red-500",
  },
  {
    category: "KESEJAHTERAAN SOSIAL",
    services: [
      "Bantuan sosial bagi keluarga rentan dengan anak usia dini sehingga dapat mengakses layanan dasar lainnya",
    ],
    color: "from-yellow-400 to-amber-500",
  },
];

function EssentialServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Layanan Esensial PAUDHI
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Layanan dasar untuk pengembangan anak usia dini yang holistik,
            integratif, dan berkualitas
          </p>
        </div>

        <div className="space-y-12">
          {essentialServicesData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                <h2 className="text-2xl font-bold text-center">
                  {item.category}
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {item.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-indigo-500 hover:shadow-md transition-shadow duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Layanan {idx + 1}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{service}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EssentialServicesPage;
