import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

/**
 * k6 Load Testing Script for Flashcards API
 *
 * This script tests the API under various load conditions.
 *
 * To run:
 * k6 run tests/performance/load-test.js
 *
 * To run with custom options:
 * k6 run --vus 50 --duration 60s tests/performance/load-test.js
 */

// Custom metrics
const errorRate = new Rate("errors");

// Test configuration
export const options = {
  // Test stages
  stages: [
    { duration: "30s", target: 10 }, // Ramp up to 10 users
    { duration: "1m", target: 10 }, // Stay at 10 users for 1 minute
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 20 }, // Stay at 20 users for 1 minute
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "2m", target: 50 }, // Stay at 50 users for 2 minutes
    { duration: "30s", target: 0 }, // Ramp down to 0 users
  ],

  // Performance thresholds
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"], // 95% of requests < 500ms, 99% < 1000ms
    http_req_failed: ["rate<0.05"], // Error rate < 5%
    errors: ["rate<0.05"],
  },
};

// Base URL - can be overridden with -e BASE_URL=...
const BASE_URL = __ENV.BASE_URL || "http://localhost:4321";
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "your-jwt-token-here";

// Headers
const headers = {
  Authorization: `Bearer ${AUTH_TOKEN}`,
  "Content-Type": "application/json",
};

/**
 * Setup function - runs once at the beginning
 */
export function setup() {
  console.log("Starting load test...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Authorization: ${AUTH_TOKEN ? "Configured" : "NOT CONFIGURED - Tests will fail!"}`);
}

/**
 * Main test function - runs for each virtual user
 */
export default function () {
  // Scenario weights (adjust for different load patterns)
  const scenario = Math.random();

  if (scenario < 0.6) {
    // 60% - Read operations (GET)
    testGetFlashcards();
  } else if (scenario < 0.8) {
    // 20% - Create operations (POST)
    testCreateFlashcard();
  } else if (scenario < 0.9) {
    // 10% - Update operations (PATCH)
    testUpdateFlashcard();
  } else {
    // 10% - Delete operations (DELETE)
    testDeleteFlashcard();
  }

  // Think time between requests (simulates user behavior)
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

/**
 * Test GET /api/flashcards
 */
function testGetFlashcards() {
  const response = http.get(`${BASE_URL}/api/flashcards?limit=10`, { headers });

  const success = check(response, {
    "GET /api/flashcards status 200": (r) => r.status === 200,
    "GET /api/flashcards response time < 500ms": (r) => r.timings.duration < 500,
    "GET /api/flashcards has data": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

/**
 * Test POST /api/flashcards
 */
function testCreateFlashcard() {
  const payload = JSON.stringify({
    source_text: `Load Test ${Date.now()}`,
    translation: "Test obciążenia",
  });

  const response = http.post(`${BASE_URL}/api/flashcards`, payload, { headers });

  const success = check(response, {
    "POST /api/flashcards status 201 or 200": (r) => r.status === 201 || r.status === 200,
    "POST /api/flashcards response time < 500ms": (r) => r.timings.duration < 500,
    "POST /api/flashcards returns flashcard": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.id;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

/**
 * Test PATCH /api/flashcards/:id
 */
function testUpdateFlashcard() {
  // First, get a flashcard ID
  const getResponse = http.get(`${BASE_URL}/api/flashcards?limit=1`, { headers });

  if (getResponse.status !== 200) {
    errorRate.add(true);
    return;
  }

  let flashcardId;
  try {
    const body = JSON.parse(getResponse.body);
    if (body.data && body.data.length > 0) {
      flashcardId = body.data[0].id;
    } else {
      // No flashcards to update
      return;
    }
  } catch {
    errorRate.add(true);
    return;
  }

  const payload = JSON.stringify({
    source_text: `Updated ${Date.now()}`,
  });

  const response = http.patch(`${BASE_URL}/api/flashcards/${flashcardId}`, payload, { headers });

  const success = check(response, {
    "PATCH /api/flashcards/:id status 200": (r) => r.status === 200,
    "PATCH /api/flashcards/:id response time < 500ms": (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
}

/**
 * Test DELETE /api/flashcards/:id
 */
function testDeleteFlashcard() {
  // First, create a flashcard to delete
  const createPayload = JSON.stringify({
    source_text: `To Delete ${Date.now()}`,
    translation: "Do usunięcia",
  });

  const createResponse = http.post(`${BASE_URL}/api/flashcards`, createPayload, { headers });

  if (createResponse.status !== 201 && createResponse.status !== 200) {
    errorRate.add(true);
    return;
  }

  let flashcardId;
  try {
    const body = JSON.parse(createResponse.body);
    flashcardId = body.data.id;
  } catch {
    errorRate.add(true);
    return;
  }

  const response = http.del(`${BASE_URL}/api/flashcards/${flashcardId}`, null, { headers });

  const success = check(response, {
    "DELETE /api/flashcards/:id status 200 or 204": (r) => r.status === 200 || r.status === 204,
    "DELETE /api/flashcards/:id response time < 500ms": (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
}

/**
 * Teardown function - runs once at the end
 */
export function teardown(data) {
  console.log("Load test completed!");
}
