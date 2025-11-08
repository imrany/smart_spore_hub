package v1

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/imrany/smart_spore_hub/server/database/processes/hub"
)

// GetUserHubs retrieves all hubs for a user - GET /v1/hubs/:user_id
func GetUserHubs(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	userID := r.URL.Query().Get("user_id")
	w.Header().Set("Content-Type", "application/json")
	hubs, err := hub.GetByID(ctx, userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(Response{
		Message: "Hubs retrieved successfully",
		Data:    hubs,
	})
}
