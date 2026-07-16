package utils

import (
	"context"
	"errors"
	"net/url"
	"os"
	"path"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// global Cloudinary instance (biar tidak inisialisasi berulang-ulang)
var cld *cloudinary.Cloudinary

// InitCloudinary dipanggil saat startup (di main.go)
func InitCloudinary() error {
	url := os.Getenv("CLOUDINARY_URL")
	if url == "" {
		return errors.New("CLOUDINARY_URL tidak ditemukan di .env")
	}

	instance, err := cloudinary.NewFromURL(url)
	if err != nil {
		return err
	}

	cld = instance
	return nil
}

// UploadImage upload file ke Cloudinary dan return secure URL
func UploadImage(file interface{}, folderName string) (string, error) {
	if cld == nil {
		return "", errors.New("Cloudinary belum diinisialisasi")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: folderName,
	})

	if err != nil {
		return "", err
	}

	return resp.SecureURL, nil
}

func DeleteImageByURL(imageURL string) error {
	if imageURL == "" {
		return nil
	}

	if cld == nil {
		return errors.New("Cloudinary belum diinisialisasi")
	}

	parsedURL, err := url.Parse(imageURL)
	if err != nil {
		return err
	}

	parts := strings.Split(parsedURL.Path, "/upload/")
	if len(parts) != 2 {
		return errors.New("format URL Cloudinary tidak valid")
	}

	publicPath := parts[1]

	// Hilangkan versi v1234567890
	pathParts := strings.SplitN(publicPath, "/", 2)
	if len(pathParts) != 2 {
		return errors.New("public id tidak valid")
	}

	publicPath = pathParts[1]

	// Hilangkan ekstensi file
	ext := path.Ext(publicPath)
	publicID := strings.TrimSuffix(publicPath, ext)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		60*time.Second,
	)
	defer cancel()

	_, err = cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})

	return err
}
