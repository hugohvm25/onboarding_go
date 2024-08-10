package main

import (
	"net/http"
	"onboarding_go/routes"
)

func main() {
	routes.CarregarRotas()
	http.ListenAndServe(":3000", nil)
}
