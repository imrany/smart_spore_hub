package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/imrany/smart_spore_hub/server/database"
	v1 "github.com/imrany/smart_spore_hub/server/internal/v1"
	"github.com/imrany/smart_spore_hub/server/middleware"
	"github.com/imrany/smart_spore_hub/server/pkg/whatsapp"

	_ "modernc.org/sqlite"
)

func createServer() *http.Server {
	mux := http.NewServeMux()
	// general routes (unprotected)
	mux.HandleFunc("/health", v1.HealthHandler)

	//api routers (protected)
	api := http.NewServeMux()
	api.HandleFunc("POST /v1/mailer/send", v1.SendMail)
	api.HandleFunc("POST /v1/whatsapp/send", v1.SendWhatsAppMessage)

	mux.HandleFunc("POST /v1/profile/create", v1.CreateProfile)
	mux.HandleFunc("POST /v1/profile/login", v1.LoginUser)
	api.HandleFunc("PUT /v1/profile/:id", v1.UpdateProfile)
	api.HandleFunc("DELETE /v1/profile/:id", v1.DeleteProfile)
	api.HandleFunc("GET /v1/profile/:id", v1.GetUserProfile)

	api.HandleFunc("GET /v1/notification/preferences/:user_id", v1.GetNotificationPreferences)
	api.HandleFunc("PUT /v1/notification/preferences/:user_id", v1.UpdateNotificationPreferences)

	api.HandleFunc("GET /v1/courses", v1.GetAllCourses)

	api.HandleFunc("GET /v1/hubs/:user_id", v1.GetUserHubs)

	mux.Handle("/api/", middleware.AuthMiddleware(api))

	srv := &http.Server{
		Addr:           fmt.Sprintf("%s:%d", viper.GetString("HOST"), viper.GetInt("PORT")),
		Handler:        middleware.CorsMiddleware(mux),
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}
	return srv
}

func runServer() {
	var err error
	server := createServer()
	port := viper.GetInt("PORT")
	host := viper.GetString("HOST")

	// Initialize WhatsApp client
	slog.Info("Initializing WhatsApp client...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	if err := whatsapp.Init(ctx, nil); err != nil {
		slog.Error("Error initializing WhatsApp client", "error", err.Error())
		slog.Warn("Server will start without WhatsApp integration")
		// Continue running server even if WhatsApp fails to initialize
	} else {
		slog.Info("WhatsApp client initialized successfully")
	}

	//migrations run automatically
	if err := database.Init(viper.GetString("DB_DSN"), false); err != nil {
		slog.Error("Failed to initialize database", "error", err)
		os.Exit(1)
	}

	// Register cleanup on shutdown
	defer func() {
		if err := database.Close(); err != nil {
			slog.Error("Failed to close database connection", "error", err)
		} else {
			slog.Info("Database connection closed")
		}
	}()

	slog.Info("Database storage initialized successfully")

	// Start server in goroutine
	go func() {
		slog.Info("Server started", "host", host, "port", port)
		err = server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			slog.Error("Error starting server", "error", err.Error())
		}
	}()

	// Graceful shutdown on SIGINT/SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	sig := <-quit
	slog.Info("Shutdown signal received", "signal", sig)

	// Shutdown WhatsApp client
	slog.Info("Disconnecting WhatsApp client...")
	whatsapp.Disconnect()

	// Shutdown HTTP server
	slog.Info("Shutting down HTTP server...")
	ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("Server shutdown failed", "error", err)
	} else {
		slog.Info("Server exited cleanly")
	}
}

func main() {
	// Load .env if present
	if err := godotenv.Load(); err != nil {
		slog.Warn("No .env file found, using defaults")
	} else {
		slog.Info(".env file loaded successfully")
	}

	// root command
	var rootCmd = &cobra.Command{
		Use:   "smart-spore-hub",
		Short: "Smart Spore Hub",
		Long:  "Smart Spore Hub is a web application for managing spore data.",
		Run: func(cmd *cobra.Command, args []string) {
			runServer()
		},
	}

	// flags
	rootCmd.PersistentFlags().String("db-dsn", "postgresql://user:password@localhost:5432/database_name?sslmode=disable", "Database DSN")
	rootCmd.PersistentFlags().String("jwt-secret", "your_jwt_secret_key_here", "Your JWT secret key")
	rootCmd.PersistentFlags().String("jwt-expiration", "3600", "Your JWT expiration period")
	rootCmd.PersistentFlags().Int("port", 8080, "Port to listen on")
	rootCmd.PersistentFlags().String("host", "0.0.0.0", "Host to listen on")
	rootCmd.PersistentFlags().String("SMTP_HOST", "smtp.gmail.com", "SMTP HOST (env: SMTP_HOST)")
	rootCmd.PersistentFlags().Int("SMTP_PORT", 587, "SMTP PORT (env: SMTP_PORT)")
	rootCmd.PersistentFlags().String("SMTP_USERNAME", "", "SMTP Username (env: SMTP_USERNAME)")
	rootCmd.PersistentFlags().String("SMTP_PASSWORD", "", "SMTP Password (env: SMTP_PASSWORD)")
	rootCmd.PersistentFlags().String("SMTP_EMAIL", "", "SMTP Email (env: SMTP_EMAIL)")

	// Bind flags to viper
	viper.BindPFlag("DB_DSN", rootCmd.PersistentFlags().Lookup("db-dsn"))
	viper.BindPFlag("JWT_SECRET", rootCmd.PersistentFlags().Lookup("jwt-secret"))
	viper.BindPFlag("JWT_EXPIRATION", rootCmd.PersistentFlags().Lookup("jwt-expiration"))
	viper.BindPFlag("PORT", rootCmd.PersistentFlags().Lookup("port"))
	viper.BindPFlag("HOST", rootCmd.PersistentFlags().Lookup("host"))
	viper.BindPFlag("SMTP_HOST", rootCmd.PersistentFlags().Lookup("SMTP_HOST"))
	viper.BindPFlag("SMTP_PORT", rootCmd.PersistentFlags().Lookup("SMTP_PORT"))
	viper.BindPFlag("SMTP_USERNAME", rootCmd.PersistentFlags().Lookup("SMTP_USERNAME"))
	viper.BindPFlag("SMTP_PASSWORD", rootCmd.PersistentFlags().Lookup("SMTP_PASSWORD"))
	viper.BindPFlag("SMTP_EMAIL", rootCmd.PersistentFlags().Lookup("SMTP_EMAIL"))

	// Bind env variables
	viper.AutomaticEnv()

	if err := rootCmd.Execute(); err != nil {
		slog.Error("Failed to execute command", "error", err)
		os.Exit(1)
	}
}
