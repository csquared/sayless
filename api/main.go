package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"strings"

	_ "modernc.org/sqlite"
)

func initDB(db *sql.DB) error {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS subscribers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`)
	return err
}

func makeHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		if r.Method != "POST" {
			w.WriteHeader(405)
			json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "method not allowed"})
			return
		}

		email := strings.TrimSpace(r.FormValue("email"))

		if email == "" || !strings.Contains(email, "@") || len(email) > 254 {
			w.WriteHeader(400)
			json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "invalid email"})
			return
		}

		_, err := db.Exec("INSERT OR IGNORE INTO subscribers (email) VALUES (?)", email)
		if err != nil {
			log.Printf("db error: %v", err)
			w.WriteHeader(500)
			json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "server error"})
			return
		}

		json.NewEncoder(w).Encode(map[string]any{"ok": true})
	}
}

func main() {
	dbPath := flag.String("db", "/var/lib/sayless/sayless.db", "path to sqlite db")
	addr := flag.String("addr", "127.0.0.1:8090", "listen address")
	flag.Parse()

	db, err := sql.Open("sqlite", *dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := initDB(db); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/api/subscribe", makeHandler(db))

	log.Printf("listening on %s", *addr)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
