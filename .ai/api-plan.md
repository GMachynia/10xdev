# REST API Plan

## 1. Resources

### 1.1 Flashcards Resource
- **Database Table:** `flashcards`
- **Description:** Main business entity representing educational flashcards created by users
- **Fields:**
  - `id` (UUID) - Primary key, auto-generated
  - `user_id` (UUID) - Foreign key to `auth.users`, automatically set by trigger
  - `source_text` (VARCHAR(200)) - Source text/word/phrase, required, max 200 characters
  - `translation` (TEXT) - Translation or meaning, optional

## 2. Endpoints

### 2.1 Flashcards Endpoints

#### 2.1.1 List Flashcards
**Method:** `GET`  
**Path:** `/api/flashcards`  
**Description:** Retrieves all flashcards for the authenticated user. Supports random ordering for study sessions.

**Query Parameters:**
- `order` (string, optional): Ordering mode. Values: `random` (default), `id` (ascending by ID)
  - `random`: Returns flashcards in random order (for study sessions)
  - `id`: Returns flashcards ordered by ID (for regular viewing)
- `limit` (integer, optional): Maximum number of flashcards to return. Default: no limit (all flashcards)
- `offset` (integer, optional): Number of flashcards to skip. Default: 0

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Request Body:** None

**Response Body (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "source_text": "Hello",
      "translation": "Cześć"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "source_text": "World",
      "translation": null
    }
  ],
  "count": 2
}
```

**Success Codes:**
- `200 OK`: Flashcards retrieved successfully

**Error Codes:**
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Database error or server failure

**Error Response Body:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 2.1.2 Get Single Flashcard
**Method:** `GET`  
**Path:** `/api/flashcards/:id`  
**Description:** Retrieves a single flashcard by ID for the authenticated user.

**Path Parameters:**
- `id` (UUID, required): Flashcard identifier

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Request Body:** None

**Response Body (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "source_text": "Hello",
    "translation": "Cześć"
  }
}
```

**Success Codes:**
- `200 OK`: Flashcard retrieved successfully

**Error Codes:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Flashcard not found or does not belong to the user
- `500 Internal Server Error`: Database error or server failure

**Error Response Body (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Flashcard not found"
  }
}
```

#### 2.1.3 Create Flashcard
**Method:** `POST`  
**Path:** `/api/flashcards`  
**Description:** Creates a new flashcard for the authenticated user. The `user_id` is automatically set by the database trigger based on the authenticated user.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)
- `Content-Type: application/json` (required)

**Request Body:**
```json
{
  "source_text": "Hello",
  "translation": "Cześć"
}
```

**Request Body Schema:**
- `source_text` (string, required): Source text/word/phrase. Maximum 200 characters.
- `translation` (string, optional): Translation or meaning. Can be null or empty string.

**Response Body (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "source_text": "Hello",
    "translation": "Cześć"
  }
}
```

**Success Codes:**
- `201 Created`: Flashcard created successfully

**Error Codes:**
- `400 Bad Request`: Validation error (e.g., source_text too long, missing required field)
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Database error or server failure

**Error Response Body (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Source text exceeds maximum length of 200 characters",
    "details": {
      "field": "source_text",
      "max_length": 200,
      "actual_length": 250
    }
  }
}
```

#### 2.1.4 Update Flashcard
**Method:** `PATCH`  
**Path:** `/api/flashcards/:id`  
**Description:** Updates an existing flashcard. Only `source_text` and `translation` can be updated. The `user_id` cannot be changed (enforced by trigger).

**Path Parameters:**
- `id` (UUID, required): Flashcard identifier

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)
- `Content-Type: application/json` (required)

**Request Body:**
```json
{
  "source_text": "Hello World",
  "translation": "Cześć Świecie"
}
```

**Request Body Schema:**
- `source_text` (string, optional): Source text/word/phrase. Maximum 200 characters. If not provided, existing value is preserved.
- `translation` (string, optional): Translation or meaning. Can be null, empty string, or omitted. If omitted, existing value is preserved.

**Response Body (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "source_text": "Hello World",
    "translation": "Cześć Świecie"
  }
}
```

**Success Codes:**
- `200 OK`: Flashcard updated successfully

**Error Codes:**
- `400 Bad Request`: Validation error (e.g., source_text too long)
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Flashcard not found or does not belong to the user
- `500 Internal Server Error`: Database error or server failure

**Error Response Body (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Source text exceeds maximum length of 200 characters"
  }
}
```

#### 2.1.5 Delete Flashcard
**Method:** `DELETE`  
**Path:** `/api/flashcards/:id`  
**Description:** Permanently deletes a flashcard (hard delete). The flashcard must belong to the authenticated user.

**Path Parameters:**
- `id` (UUID, required): Flashcard identifier

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Request Body:** None

**Response Body (200 OK):**
```json
{
  "message": "Flashcard deleted successfully"
}
```

**Success Codes:**
- `200 OK`: Flashcard deleted successfully

**Error Codes:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Flashcard not found or does not belong to the user
- `500 Internal Server Error`: Database error or server failure

**Error Response Body (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Flashcard not found"
  }
}
```

#### 2.1.6 Get Flashcards Count
**Method:** `GET`  
**Path:** `/api/flashcards/count`  
**Description:** Returns the total count of flashcards for the authenticated user. Useful for displaying statistics in the UI.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Request Body:** None

**Response Body (200 OK):**
```json
{
  "count": 42
}
```

**Success Codes:**
- `200 OK`: Count retrieved successfully

**Error Codes:**
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Database error or server failure

### 2.2 Health Check Endpoint

#### 2.2.1 Health Check
**Method:** `GET`  
**Path:** `/api/health`  
**Description:** Health check endpoint for monitoring and load balancers.

**Request Headers:** None

**Request Body:** None

**Response Body (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Success Codes:**
- `200 OK`: Service is healthy

## 3. Validation and Business Logic

**Note:** Authentication is handled entirely by Supabase Auth SDK on the frontend. All protected endpoints require a valid Supabase JWT token in the `Authorization` header. Row Level Security (RLS) policies at the database level ensure users can only access their own flashcards.

### 4.1 Validation Rules

#### 4.1.1 Flashcard Creation and Update

**Source Text (`source_text`):**
- **Required:** Yes
- **Type:** String
- **Max Length:** 200 characters (enforced by database CHECK constraint)
- **Validation:** 
  - Must not be empty or whitespace-only
  - Must not exceed 200 characters
  - Trimmed before validation (leading/trailing whitespace removed)

**Translation (`translation`):**
- **Required:** No (optional)
- **Type:** String or null
- **Max Length:** No limit (TEXT type in database)
- **Validation:**
  - Can be null, empty string, or any text
  - If provided, should be trimmed (leading/trailing whitespace removed)

**User ID (`user_id`):**
- **Required:** Yes (automatically set by database trigger)
- **Type:** UUID
- **Validation:**
  - Automatically set from `auth.uid()` by database trigger
  - Cannot be set or modified by the API request
  - Must match the authenticated user's ID

#### 4.1.2 Query Parameters

**Order Parameter (`order`):**
- **Type:** String
- **Valid Values:** `random`, `id`
- **Default:** `random`
- **Validation:**
  - Must be one of the valid values
  - Case-insensitive comparison recommended

**Limit Parameter (`limit`):**
- **Type:** Integer
- **Min Value:** 1
- **Max Value:** 1000 (recommended to prevent performance issues)
- **Default:** No limit (all flashcards)
- **Validation:**
  - Must be a positive integer
  - Should have a reasonable maximum to prevent abuse

**Offset Parameter (`offset`):**
- **Type:** Integer
- **Min Value:** 0
- **Default:** 0
- **Validation:**
  - Must be a non-negative integer

### 4.2 Business Logic

#### 4.2.1 Random Ordering for Study Sessions

**Implementation:**
- When `order=random` is specified, flashcards are returned in random order
- Random ordering is implemented using PostgreSQL `ORDER BY RANDOM()`
- Each request with `order=random` returns flashcards in a different order
- This supports the study session feature where flashcards are displayed in random order

**Performance Considerations:**
- `ORDER BY RANDOM()` can be expensive for large datasets
- The index on `user_id` optimizes the filtering before randomization
- For very large collections, consider caching the random order on the frontend for the duration of a study session

#### 4.2.2 Automatic User ID Assignment

**Implementation:**
- Database trigger `set_flashcards_user_id` automatically sets `user_id` on INSERT and UPDATE
- The trigger uses `auth.uid()` to get the authenticated user's ID
- This prevents users from creating or modifying flashcards for other users
- The API should not accept `user_id` in the request body (it will be ignored if provided)

#### 4.2.3 Hard Delete

**Implementation:**
- Flashcard deletion is permanent (hard delete)
- No soft delete mechanism in MVP
- Deleted flashcards cannot be recovered
- RLS ensures users can only delete their own flashcards

#### 4.2.4 Flashcard Ownership

**Implementation:**
- All flashcards are owned by the user who created them
- RLS policies ensure users can only access their own flashcards
- The database trigger prevents changing ownership (user_id cannot be modified)
- All API endpoints automatically filter by the authenticated user's ID

### 4.3 Error Handling

#### 4.3.1 Validation Errors (400 Bad Request)

**Source Text Too Long:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Source text exceeds maximum length of 200 characters",
    "details": {
      "field": "source_text",
      "max_length": 200,
      "actual_length": 250
    }
  }
}
```

**Missing Required Field:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: source_text",
    "details": {
      "field": "source_text"
    }
  }
}
```

**Invalid Query Parameter:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid value for 'order' parameter. Must be 'random' or 'id'",
    "details": {
      "parameter": "order",
      "provided_value": "invalid",
      "valid_values": ["random", "id"]
    }
  }
}
```

#### 4.3.2 Authentication Errors (401 Unauthorized)

**Missing Token:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide a valid JWT token."
  }
}
```

**Invalid Token:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token"
  }
}
```

#### 4.3.3 Not Found Errors (404 Not Found)

**Flashcard Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Flashcard not found or you do not have permission to access it"
  }
}
```

#### 4.3.4 Server Errors (500 Internal Server Error)

**Generic Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

**Database Error:**
```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database operation failed. Please try again later."
  }
}
```

### 4.4 Rate Limiting and Security

#### 4.4.1 Rate Limiting (Recommended)

While not explicitly required in MVP, consider implementing rate limiting:
- **Per-user rate limits:** Prevent abuse by individual users
- **Endpoint-specific limits:** Different limits for different operations
- **Recommended limits:**
  - Create/Update/Delete: 100 requests per minute per user
  - List/Get: 200 requests per minute per user

#### 4.4.2 Security Measures

1. **SQL Injection Prevention:**
   - Use parameterized queries (Supabase SDK handles this automatically)
   - Never concatenate user input into SQL queries

2. **XSS Prevention:**
   - Validate and sanitize all user input
   - Return data in JSON format (not HTML)

3. **CORS Configuration:**
   - Configure CORS to only allow requests from the frontend domain
   - Restrict allowed HTTP methods and headers

4. **Input Sanitization:**
   - Trim whitespace from text inputs
   - Validate data types and formats
   - Enforce length limits

5. **RLS as Defense in Depth:**
   - RLS policies provide database-level security
   - Even if API logic has bugs, RLS prevents unauthorized access

## 5. Implementation Notes

### 5.1 Technology Stack Considerations

**Supabase Integration:**
- The API can be implemented using:
  - Astro API routes (`src/pages/api/`)
  - Supabase Edge Functions (if more complex logic is needed)
  - Direct Supabase client calls from the frontend (for simple CRUD operations)

**Recommended Approach:**
- For MVP, use Astro API routes that wrap Supabase client calls
- This provides a consistent REST API interface
- Allows for additional validation and business logic
- Easier to extend in the future

### 5.2 Database Constraints

The following constraints are enforced at the database level:
- `source_text` maximum length: 200 characters (CHECK constraint)
- `user_id` foreign key to `auth.users(id)` with ON DELETE CASCADE
- `user_id` automatically set by trigger (cannot be modified)
- RLS policies enforce user-level access control

### 5.3 API Response Format

**Success Response Format:**
- Single resource: `{ "data": { ... } }`
- List of resources: `{ "data": [...], "count": N }`
- Simple operations: `{ "message": "..." }`

**Error Response Format:**
- Consistent error structure: `{ "error": { "code": "...", "message": "...", "details": {...} } }`
- HTTP status codes match the error type
- Error messages are user-friendly and actionable

### 5.4 Future Extensions (Out of Scope for MVP)

The following features are explicitly excluded from MVP but may be added in the future:
- Search and filtering of flashcards
- Sorting by different criteria
- Pagination metadata (total pages, current page, etc.)
- Bulk operations (create/update/delete multiple flashcards)
- Flashcard sets/categories
- Tags
- Statistics and analytics endpoints
- Export functionality

