package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type App struct {
	ctx context.Context
}

type RequestInput struct {
	Method  string            `json:"method"`
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
}

type ResponseOutput struct {
	Status     int               `json:"status"`
	StatusText string            `json:"statusText"`
	Headers    map[string]string `json:"headers"`
	Body       string            `json:"body"`
	Duration   int64             `json:"duration"`
	Error      string            `json:"error"`
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) SendRequest(req RequestInput) ResponseOutput {
	client := &http.Client{Timeout: 30 * time.Second}

	bodyReader := strings.NewReader(req.Body)
	httpReq, err := http.NewRequest(req.Method, req.URL, bodyReader)
	if err != nil {
		return ResponseOutput{Error: fmt.Sprintf("Failed to build request: %s", err.Error())}
	}

	for key, value := range req.Headers {
		httpReq.Header.Set(key, value)
	}

	start := time.Now()
	resp, err := client.Do(httpReq)
	duration := time.Since(start).Milliseconds()

	if err != nil {
		return ResponseOutput{Error: fmt.Sprintf("Request failed: %s", err.Error())}
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return ResponseOutput{Error: fmt.Sprintf("Failed to read response: %s", err.Error())}
	}

	respHeaders := map[string]string{}
	for key := range resp.Header {
		respHeaders[key] = resp.Header.Get(key)
	}

	return ResponseOutput{
		Status:     resp.StatusCode,
		StatusText: resp.Status,
		Headers:    respHeaders,
		Body:       string(respBody),
		Duration:   duration,
	}
}
