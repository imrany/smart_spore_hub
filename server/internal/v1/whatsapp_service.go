package v1

import (
	"encoding/json"
	"net/http"

	"github.com/imrany/smart_spore_hub/server/pkg/whatsapp"
)

type WhatsAppRequest struct {
	PhoneNumber string `json:"phone_number"`
	Message     string `json:"message"`
}

// SendWhatsAppMessage sends a WhatsApp message using the WhatsApp API - POST /api/v1/whatsapp/send.
func SendWhatsAppMessage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req WhatsAppRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}
	// Assuming there's a method to actually send the message.  Since there isn't one on the
	// struct `WhatsAppService`, we can't call it.  This line has been replaced with a comment
	err = whatsapp.SendMessage(r.Context(), req.PhoneNumber, req.Message)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}
	w.WriteHeader(http.StatusCreated)
}
