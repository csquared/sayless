test:
	go test -v ./...

build:
	GOOS=linux GOARCH=amd64 go build -o sayless-api .

clean:
	rm -f sayless-api

.PHONY: test build clean
