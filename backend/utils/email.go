package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendResetPasswordEmail(toEmail string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpEmail := os.Getenv("SMTP_EMAIL")
	smtpPassword := os.Getenv("SMTP_PASSWORD")
	frontendURL := os.Getenv("FRONTEND_URL")

	auth := smtp.PlainAuth("", smtpEmail, smtpPassword, smtpHost)

	resetLink := fmt.Sprintf("%s/reset-password?email=%s", frontendURL, toEmail)

	subject := "Subject: Reset Password\r\n"
	mime := "MIME-Version: 1.0\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n"

	body := fmt.Sprintf(`
		<html>
			<body style="font-family: Arial, sans-serif;">
				<h2>Reset Password</h2>

				<p>Halo,</p>

				<p>Kami menerima permintaan untuk mengganti password akun Anda.</p>

				<p>Silakan klik tombol di bawah ini:</p>

				<p>
					<a href="%s"
					   style="
						background:#2563eb;
						color:white;
						padding:10px 18px;
						text-decoration:none;
						border-radius:6px;">
						Ganti Password
					</a>
				</p>

				<p>Atau buka link berikut:</p>

				<p>%s</p>

				<br>

				<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
			</body>
		</html>
	`, resetLink, resetLink)

	message := []byte(subject + mime + body)

	return smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		smtpEmail,
		[]string{toEmail},
		message,
	)
}
