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

	v1 "github.com/imrany/smart_spore_hub/server/internal/v1"
	"github.com/imrany/smart_spore_hub/server/middleware"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, welcome to smart spore hub server!")
}

func createServer() *http.Server {
	mux := http.NewServeMux()

	// general routes (unprotected)
	mux.HandleFunc("/", healthHandler)

	//api routers (protected)
	api := http.NewServeMux()
	api.HandleFunc("POST /v1/mailer/send", v1.SendMail)
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

	// Start server in goroutine
	go func() {
		slog.Info("Server started on ", "host", host, "port", port)
		err = server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			slog.Error("Error starting server", "error", err.Error())
		}
	}()

	// Graceful shutdown on SIGINT/SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	sig := <-quit
	slog.Info("Shutdown signal received", "signal", sig, "shutting down gracefully...", "")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
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
	rootCmd.PersistentFlags().Int("port", 8080, "Port to listen on")
	rootCmd.PersistentFlags().String("host", "0.0.0.0", "Host to listen on")
	rootCmd.PersistentFlags().String("SMTP_HOST", "smtp.gmail.com", "SMTP HOST (env: SMTP_HOST)")
	rootCmd.PersistentFlags().Int("SMTP_PORT", 587, "SMTP PORT (env: SMTP_PORT)")
	rootCmd.PersistentFlags().String("SMTP_USERNAME", "", "SMTP Username (env: SMTP_USERNAME)")
	rootCmd.PersistentFlags().String("SMTP_PASSWORD", "", "SMTP Password (env: SMTP_PASSWORD)")
	rootCmd.PersistentFlags().String("SMTP_EMAIL", "", "SMTP Email (env: SMTP_EMAIL)")

	// Bind flags to viper
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
