package v1

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/imrany/smart_spore_hub/server/database/models"
	"github.com/imrany/smart_spore_hub/server/database/processes"
)

// InsertNewSensorReadings inserts new sensor readings into the database - POST /v1/sensors/insert
func InsertNewSensorReadings(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	w.Header().Set("Content-Type", "application/json")

	var readings models.CreateSensorReadingRequest
	err := json.NewDecoder(r.Body).Decode(&readings)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "invalid request body",
		})
		return
	}

	if readings.RecordedAt.IsZero() {
		readings.RecordedAt = time.Now()
	}

	// Insert the readings into the database
	sensorReading, alertTriggered, err := processes.ProcessSensorReading(ctx, readings)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "failed to insert readings",
		})
		return
	}

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "readings inserted successfully",
		Data: map[string]interface{}{
			"reading": sensorReading,
			"alert_triggered": alertTriggered,
		},
	})
}
