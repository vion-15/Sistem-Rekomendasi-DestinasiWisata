package routes

import (
	"backend-wisata/controllers"
	"backend-wisata/middlewares" // Import package middleware kamu

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.New()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Pasang middleware CORS yang sudah dipisah
	r.Use(middlewares.CORSMiddleware())

	r.Static("/images", "./assets/images")

	// Group routing untuk API
	api := r.Group("/api")
	{
		// Endpoint khusus Admin
		auth := api.Group("/auth")
		{
			auth.POST("/login", controllers.LoginUniversal)
			auth.POST("/register", controllers.RegisterWisatawan)
		}

		admin := api.Group("/admin")
		{
			admin.POST("/", controllers.CreateAdmin)
			admin.GET("/", controllers.GetAdmin)
			admin.GET("/:id", controllers.GetAdminByID)
			admin.PUT("/:id", controllers.UpdateAdmin)
			admin.DELETE("/:id", controllers.DeleteAdmin)
		}

		admin_aktivitas := api.Group("/admin-aktivitas")
		{
			admin_aktivitas.POST("/cari", controllers.CariDestinasiAdminCBF)
			admin_aktivitas.GET("/statistik", controllers.GetStatistikPencarian)
			admin_aktivitas.POST("/kirim-laporan", controllers.BuatLaporanPencarian)
			admin_aktivitas.GET("/statistik-destinasi", controllers.GetStatistikDestinasi)
			admin_aktivitas.POST("/kirim-laporan-destinasi", controllers.BuatLaporanDestinasi)
		}

		admin_laporan := api.Group("/admin-laporan")
		{
			admin_laporan.GET("", controllers.GetDaftarLaporan)
			admin_laporan.DELETE("/:id", controllers.DeleteLaporan)
			admin_laporan.GET("/:id/download", controllers.DownloadLaporan)
		}

		// Endpoint Petugas
		petugas := api.Group("/petugas")
		{
			petugas.POST("/", controllers.CreatePetugas)
			petugas.GET("/", controllers.GetPetugas)
			petugas.PUT("/:id", controllers.UpdatePetugas)
			petugas.DELETE("/:id", controllers.DeletePetugas)
			petugas.GET("/:id", controllers.GetPetugasByID)
		}

		petugas_aktivitas := api.Group("/petugas-aktivitas")
		{
			petugas_aktivitas.POST("/cari", controllers.CariDestinasiPetugasCBF)
		}

		petugas_laporan := api.Group("/petugas-laporan")
		{
			petugas_laporan.GET("", controllers.GetDaftarLaporanPetugas)
			petugas_laporan.DELETE("/:id", controllers.DeleteLaporan)
			petugas_laporan.GET("/:id/download", controllers.DownloadLaporan)
		}

		destinasi := api.Group("/destinasi")
		{
			destinasi.POST("/", controllers.CreateDestinasi)
			destinasi.GET("/", controllers.GetDestinasi)
			destinasi.GET("/random", controllers.GetRandomDestinasi)
			destinasi.GET("/:id", controllers.GetDestinasiByID)
			destinasi.PUT("/:id", controllers.UpdateDestinasi)
			destinasi.DELETE("/:id", controllers.DeleteDestinasi)
			destinasi.POST("/import", controllers.ImportDestinasiCSV)
		}

		ai := api.Group("/ai")
		{
			ai.GET("/destinasi", controllers.GetDestinasiForAI)
		}

		wisatawan := api.Group("/wisatawan")
		{
			wisatawan.GET("/", controllers.GetWisatawan)
			wisatawan.DELETE("/:id", controllers.DeleteWisatawan)
		}

		ulasan := api.Group("/ulasan")
		{
			ulasan.GET("/", controllers.GetUlasan)
			ulasan.GET("/:id", controllers.GetDetailUlasan) // Tambahan rute baru
			ulasan.DELETE("/:id", controllers.DeleteUlasan)
			ulasan.POST("/kirim-laporan", controllers.BuatLaporanUlasan)
		}

		api.GET("/dashboard", controllers.GetDashboard)

		wisatawan_aktivitas := api.Group("/wisatawan-aktivitas")
		{
			wisatawan_aktivitas.POST("/cari", controllers.CariDestinasiCBF)
			wisatawan_aktivitas.POST("/riwayat-destinasi", controllers.SimpanRiwayatDestinasi)
			wisatawan_aktivitas.GET("/riwayat-destinasi/:id_wisatawan", controllers.GetRiwayatDestinasiByWisatawan)
			wisatawan_aktivitas.DELETE("/riwayat-destinasi/:id", controllers.DeleteRiwayatDestinasi)
			wisatawan_aktivitas.GET("/riwayat-pencarian/:id_wisatawan", controllers.GetRiwayatPencarianByWisatawan)
			wisatawan_aktivitas.DELETE("/pencarian/:id", controllers.DeleteRiwayatPencarian)
			wisatawan_aktivitas.POST("/ulasan", controllers.CreateUlasan)
			wisatawan_aktivitas.GET("/ulasan/:id_wisatawan", controllers.GetUlasanByWisatawan)
			wisatawan_aktivitas.DELETE("/ulasan/:id", controllers.DeleteUlasan)
			wisatawan_aktivitas.GET("/rekomendasi/:id", controllers.RekomendasiDashboardCBF)
			wisatawan_aktivitas.DELETE("/riwayat-destinasi/all/:id_wisatawan", controllers.DeleteAllRiwayatDestinasi)
			wisatawan_aktivitas.DELETE("/riwayat-pencarian/all/:id_wisatawan", controllers.DeleteAllRiwayatPencarian)
			wisatawan_aktivitas.POST("/cari-rekomendasi", controllers.CariDanSimpanRekomendasi)
			wisatawan_aktivitas.GET("/hasil-rekomendasi/:id", controllers.GetHasilRekomendasi)
			wisatawan_aktivitas.GET("/pencarian/:id", controllers.GetPencarian)
		}

		wisatawan_laporan := api.Group("/wisatawan-laporan")
		{
			wisatawan_laporan.GET("/pencarian/:id_wisatawan", controllers.DownloadRiwayatPencarianWisatawan)
			wisatawan_laporan.GET("/destinasi/:id_wisatawan", controllers.DownloadRiwayatDestinasiWisatawan)
			wisatawan_laporan.GET("/ulasan/:id_wisatawan", controllers.DownloadUlasanWisatawan)
		}
	}

	return r
}
