package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	_ "modernc.org/sqlite"
)

func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	if err := initDB(db); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func postSubscribe(handler http.HandlerFunc, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest("POST", "/api/subscribe", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()
	handler(w, req)
	return w
}

type response struct {
	OK    bool   `json:"ok"`
	Error string `json:"error,omitempty"`
}

func parseResponse(t *testing.T, w *httptest.ResponseRecorder) response {
	t.Helper()
	var r response
	if err := json.Unmarshal(w.Body.Bytes(), &r); err != nil {
		t.Fatalf("invalid json: %s", w.Body.String())
	}
	return r
}

func subscriberCount(t *testing.T, db *sql.DB) int {
	t.Helper()
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM subscribers").Scan(&count); err != nil {
		t.Fatal(err)
	}
	return count
}

func TestSubscribe(t *testing.T) {
	db := setupTestDB(t)
	handler := makeHandler(db)

	t.Run("valid email", func(t *testing.T) {
		w := postSubscribe(handler, "email=test@example.com")
		if w.Code != 200 {
			t.Fatalf("expected 200, got %d", w.Code)
		}
		r := parseResponse(t, w)
		if !r.OK {
			t.Fatal("expected ok=true")
		}
		if n := subscriberCount(t, db); n != 1 {
			t.Fatalf("expected 1 subscriber, got %d", n)
		}
	})

	t.Run("duplicate email", func(t *testing.T) {
		w := postSubscribe(handler, "email=dupe@example.com")
		if w.Code != 200 {
			t.Fatalf("expected 200, got %d", w.Code)
		}
		before := subscriberCount(t, db)
		w = postSubscribe(handler, "email=dupe@example.com")
		if w.Code != 200 {
			t.Fatalf("expected 200, got %d", w.Code)
		}
		r := parseResponse(t, w)
		if !r.OK {
			t.Fatal("expected ok=true for duplicate")
		}
		after := subscriberCount(t, db)
		if after != before {
			t.Fatalf("duplicate inserted: before=%d after=%d", before, after)
		}
	})

	t.Run("missing email", func(t *testing.T) {
		w := postSubscribe(handler, "")
		if w.Code != 400 {
			t.Fatalf("expected 400, got %d", w.Code)
		}
		r := parseResponse(t, w)
		if r.OK {
			t.Fatal("expected ok=false")
		}
	})

	t.Run("invalid email", func(t *testing.T) {
		w := postSubscribe(handler, "email=notanemail")
		if w.Code != 400 {
			t.Fatalf("expected 400, got %d", w.Code)
		}
		r := parseResponse(t, w)
		if r.OK {
			t.Fatal("expected ok=false")
		}
	})

	t.Run("email too long", func(t *testing.T) {
		long := "email=" + strings.Repeat("a", 250) + "@b.com"
		w := postSubscribe(handler, long)
		if w.Code != 400 {
			t.Fatalf("expected 400, got %d", w.Code)
		}
	})

	t.Run("wrong method", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/subscribe", nil)
		w := httptest.NewRecorder()
		handler(w, req)
		if w.Code != 405 {
			t.Fatalf("expected 405, got %d", w.Code)
		}
	})
}
