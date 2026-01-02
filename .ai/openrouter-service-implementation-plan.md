# Plan wdrożenia usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter (`openrouter.service.ts`) jest serwisem TypeScript integrującym się z interfejsem API OpenRouter w celu uzupełniania czatów opartych na modelach językowych (LLM). Usługa zapewnia:

- **Komunikację z API OpenRouter**: Wysyłanie żądań do endpointu `/v1/chat/completions`
- **Obsługę komunikatów systemowych i użytkownika**: Strukturyzacja wiadomości zgodnie z formatem OpenRouter
- **Ustrukturyzowane odpowiedzi JSON**: Wsparcie dla `response_format` z definicją schematu JSON Schema
- **Konfigurację modeli**: Wybór modelu LLM i dostosowanie parametrów (temperatura, max_tokens, itp.)
- **Obsługę błędów**: Kompleksowa obsługa błędów sieciowych, walidacyjnych i API
- **Bezpieczeństwo**: Bezpieczne przechowywanie kluczy API i walidacja danych

Usługa będzie zlokalizowana w `src/lib/services/openrouter.service.ts` zgodnie ze strukturą projektu.

## 2. Opis konstruktora

Konstruktor `OpenRouterService` inicjalizuje usługę z wymaganymi parametrami konfiguracyjnymi:

```typescript
class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultParams: OpenRouterModelParams;

  constructor(config: OpenRouterServiceConfig) {
    // Walidacja wymaganych parametrów
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
    if (!config.defaultModel) {
      throw new Error("Default model name is required");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel;
    this.defaultParams = {
      temperature: config.defaultParams?.temperature ?? 0.7,
      max_tokens: config.defaultParams?.max_tokens ?? 1000,
      top_p: config.defaultParams?.top_p ?? 1.0,
      frequency_penalty: config.defaultParams?.frequency_penalty ?? 0,
      presence_penalty: config.defaultParams?.presence_penalty ?? 0,
      ...config.defaultParams,
    };
  }
}
```

**Parametry konstruktora:**
- `apiKey` (wymagane): Klucz API OpenRouter pobierany z zmiennych środowiskowych
- `baseUrl` (opcjonalne): URL bazowy API (domyślnie: `https://openrouter.ai/api/v1`)
- `defaultModel` (wymagane): Nazwa modelu LLM używana domyślnie (np. `openai/gpt-4`, `anthropic/claude-3-opus`)
- `defaultParams` (opcjonalne): Domyślne parametry modelu (temperatura, max_tokens, itp.)

## 3. Publiczne metody i pola

### 3.1. `chatCompletion`

Główna metoda do wysyłania żądań do API OpenRouter i otrzymywania odpowiedzi.

```typescript
async chatCompletion(
  request: OpenRouterChatRequest
): Promise<{ data: OpenRouterChatResponse | null; error: Error | null }>
```

**Parametry:**
- `request.messages` (wymagane): Tablica komunikatów w formacie OpenRouter
  - Komunikat systemowy: `{ role: "system", content: string }`
  - Komunikat użytkownika: `{ role: "user", content: string }`
  - Komunikat asystenta: `{ role: "assistant", content: string }` (dla konwersacji)
- `request.model` (opcjonalne): Nazwa modelu (domyślnie używa `defaultModel`)
- `request.responseFormat` (opcjonalne): Format odpowiedzi z definicją schematu JSON
- `request.params` (opcjonalne): Parametry modelu (nadpisują domyślne)

**Przykład użycia:**

```typescript
const service = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultModel: "openai/gpt-4",
});

const { data, error } = await service.chatCompletion({
  messages: [
    { role: "system", content: "Jesteś pomocnym asystentem do nauki języków." },
    { role: "user", content: "Przetłumacz słowo 'hello' na polski." }
  ],
  responseFormat: {
    type: "json_schema",
    json_schema: {
      name: "translation_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          translation: { type: "string" },
          pronunciation: { type: "string" }
        },
        required: ["translation"],
        additionalProperties: false
      }
    }
  }
});
```

### 3.2. `createSystemMessage`

Pomocnicza metoda do tworzenia komunikatów systemowych.

```typescript
createSystemMessage(content: string): OpenRouterMessage
```

**Przykład:**

```typescript
const systemMsg = service.createSystemMessage(
  "Jesteś ekspertem w tłumaczeniu tekstów. Zawsze odpowiadaj w formacie JSON."
);
```

### 3.3. `createUserMessage`

Pomocnicza metoda do tworzenia komunikatów użytkownika.

```typescript
createUserMessage(content: string): OpenRouterMessage
```

**Przykład:**

```typescript
const userMsg = service.createUserMessage("Przetłumacz: Hello world");
```

### 3.4. `createResponseFormat`

Pomocnicza metoda do tworzenia formatu odpowiedzi z schematem JSON.

```typescript
createResponseFormat(
  schemaName: string,
  schema: JSONSchema,
  strict: boolean = true
): OpenRouterResponseFormat
```

**Przykład:**

```typescript
const responseFormat = service.createResponseFormat(
  "flashcard_data",
  {
    type: "object",
    properties: {
      source_text: { type: "string", maxLength: 200 },
      translation: { type: "string" },
      difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
    },
    required: ["source_text", "translation"],
    additionalProperties: false
  },
  true
);
```

### 3.5. `validateModel`

Metoda do walidacji, czy model jest obsługiwany przez OpenRouter.

```typescript
async validateModel(model: string): Promise<{ valid: boolean; error: Error | null }>
```

## 4. Prywatne metody i pola

### 4.1. `buildRequestPayload`

Buduje payload żądania zgodnie z formatem OpenRouter API.

```typescript
private buildRequestPayload(
  request: OpenRouterChatRequest
): OpenRouterAPIRequest
```

**Funkcjonalność:**
- Łączy komunikaty systemowe i użytkownika w odpowiedniej kolejności
- Dodaje `response_format` jeśli jest zdefiniowany
- Łączy parametry domyślne z parametrami żądania
- Ustawia nazwę modelu (z żądania lub domyślną)

### 4.2. `makeAPIRequest`

Wykonuje żądanie HTTP do API OpenRouter z obsługą błędów.

```typescript
private async makeAPIRequest(
  payload: OpenRouterAPIRequest
): Promise<{ data: OpenRouterAPIResponse | null; error: Error | null }>
```

**Funkcjonalność:**
- Dodaje nagłówki autoryzacyjne (`Authorization: Bearer {apiKey}`)
- Obsługuje timeout (domyślnie 30 sekund)
- Parsuje odpowiedź JSON
- Obsługuje błędy HTTP i sieciowe

### 4.3. `parseResponse`

Parsuje odpowiedź z API i waliduje strukturę.

```typescript
private parseResponse(
  apiResponse: OpenRouterAPIResponse
): OpenRouterChatResponse
```

**Funkcjonalność:**
- Ekstrahuje treść odpowiedzi z `choices[0].message.content`
- Waliduje strukturę odpowiedzi
- Jeśli `response_format` był użyty, parsuje JSON z odpowiedzi
- Zwraca ustrukturyzowany obiekt odpowiedzi

### 4.4. `validateJSONSchema`

Waliduje odpowiedź JSON względem zdefiniowanego schematu.

```typescript
private validateJSONSchema(
  data: unknown,
  schema: JSONSchema
): { valid: boolean; error: Error | null }
```

**Funkcjonalność:**
- Używa biblioteki do walidacji JSON Schema (np. `ajv`)
- Sprawdza wymagane pola
- Waliduje typy danych
- Sprawdza `additionalProperties: false` jeśli ustawione

### 4.5. `handleAPIError`

Obsługuje błędy z API i mapuje je na czytelne komunikaty.

```typescript
private handleAPIError(
  error: unknown,
  statusCode?: number
): Error
```

**Funkcjonalność:**
- Mapuje kody statusu HTTP na odpowiednie błędy
- Ekstrahuje komunikaty błędów z odpowiedzi API
- Tworzy czytelne komunikaty dla użytkownika

### 4.6. Pola prywatne

```typescript
private readonly apiKey: string;
private readonly baseUrl: string;
private readonly defaultModel: string;
private readonly defaultParams: OpenRouterModelParams;
private readonly requestTimeout: number = 30000; // 30 sekund
```

## 5. Obsługa błędów

### 5.1. Scenariusze błędów i ich obsługa

#### 5.1.1. Błędy autoryzacji (401 Unauthorized)
**Przyczyna:** Nieprawidłowy lub wygasły klucz API
**Obsługa:**
```typescript
if (statusCode === 401) {
  return {
    data: null,
    error: new Error("Invalid or expired API key. Please check your OPENROUTER_API_KEY environment variable.")
  };
}
```

#### 5.1.2. Błędy walidacji (400 Bad Request)
**Przyczyna:** Nieprawidłowy format żądania, brakujące wymagane pola, nieprawidłowy schemat JSON
**Obsługa:**
```typescript
if (statusCode === 400) {
  const errorMessage = apiErrorResponse?.error?.message || "Invalid request format";
  return {
    data: null,
    error: new Error(`Validation error: ${errorMessage}`)
  };
}
```

#### 5.1.3. Błędy limitu (429 Too Many Requests)
**Przyczyna:** Przekroczony limit żądań lub budżet API
**Obsługa:**
```typescript
if (statusCode === 429) {
  return {
    data: null,
    error: new Error("Rate limit exceeded. Please try again later or check your API budget limits.")
  };
}
```

#### 5.1.4. Błędy modelu (404 Not Found)
**Przyczyna:** Nieobsługiwany lub nieistniejący model
**Obsługa:**
```typescript
if (statusCode === 404) {
  return {
    data: null,
    error: new Error(`Model '${model}' is not available or not supported by OpenRouter.`)
  };
}
```

#### 5.1.5. Błędy serwera (500, 502, 503)
**Przyczyna:** Problemy po stronie serwera OpenRouter
**Obsługa:**
```typescript
if (statusCode >= 500) {
  return {
    data: null,
    error: new Error("OpenRouter service is temporarily unavailable. Please try again later.")
  };
}
```

#### 5.1.6. Błędy sieciowe
**Przyczyna:** Timeout, brak połączenia, problemy DNS
**Obsługa:**
```typescript
catch (error) {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      data: null,
      error: new Error("Network error. Please check your internet connection.")
    };
  }
  if (error.name === "AbortError") {
    return {
      data: null,
      error: new Error("Request timeout. The API did not respond in time.")
    };
  }
  throw error;
}
```

#### 5.1.7. Błędy walidacji JSON Schema
**Przyczyna:** Odpowiedź nie spełnia zdefiniowanego schematu JSON
**Obsługa:**
```typescript
const validation = this.validateJSONSchema(parsedContent, schema);
if (!validation.valid) {
  return {
    data: null,
    error: new Error(`Response does not match JSON schema: ${validation.error?.message}`)
  };
}
```

#### 5.1.8. Błędy parsowania JSON
**Przyczyna:** Nieprawidłowy format JSON w odpowiedzi
**Obsługa:**
```typescript
try {
  const parsed = JSON.parse(content);
} catch (parseError) {
  return {
    data: null,
    error: new Error("Failed to parse JSON response from API.")
  };
}
```

### 5.2. Wzorzec obsługi błędów

Wszystkie metody publiczne zwracają obiekt w formacie:
```typescript
{ data: T | null; error: Error | null }
```

Zawsze sprawdzaj `error` przed użyciem `data`:
```typescript
const { data, error } = await service.chatCompletion(request);
if (error) {
  // Obsługa błędu
  console.error("Error:", error.message);
  return;
}
// Użycie danych
console.log("Response:", data);
```

## 6. Kwestie bezpieczeństwa

### 6.1. Przechowywanie klucza API

**Zasada:** Klucz API NIGDY nie powinien być hardkodowany w kodzie.

**Implementacja:**
- Przechowywanie w zmiennych środowiskowych (`.env` lub `.env.local`)
- Dodanie do `src/env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
}
```
- Walidacja w konstruktorze:
```typescript
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is required");
}
```

### 6.2. Walidacja danych wejściowych

**Zasada:** Wszystkie dane wejściowe muszą być walidowane przed wysłaniem do API.

**Implementacja:**
- Walidacja komunikatów: sprawdzenie, czy `role` jest jednym z dozwolonych wartości
- Walidacja długości treści: maksymalna długość zgodna z limitami modelu
- Walidacja schematu JSON: sprawdzenie poprawności struktury przed wysłaniem
- Sanityzacja treści: usunięcie potencjalnie niebezpiecznych znaków

```typescript
private validateMessage(message: OpenRouterMessage): { valid: boolean; error: Error | null } {
  const validRoles = ["system", "user", "assistant"];
  if (!validRoles.includes(message.role)) {
    return {
      valid: false,
      error: new Error(`Invalid message role: ${message.role}. Must be one of: ${validRoles.join(", ")}`)
    };
  }
  if (!message.content || message.content.trim().length === 0) {
    return {
      valid: false,
      error: new Error("Message content cannot be empty")
    };
  }
  if (message.content.length > 100000) {
    return {
      valid: false,
      error: new Error("Message content exceeds maximum length of 100,000 characters")
    };
  }
  return { valid: true, error: null };
}
```

### 6.3. Walidacja danych wyjściowych

**Zasada:** Odpowiedzi z API muszą być walidowane przed zwróceniem do użytkownika.

**Implementacja:**
- Walidacja struktury odpowiedzi
- Walidacja względem JSON Schema (jeśli zdefiniowany)
- Sanityzacja treści odpowiedzi (usunięcie potencjalnie niebezpiecznych elementów)

### 6.4. Rate limiting

**Zasada:** Implementacja mechanizmu ograniczania liczby żądań.

**Implementacja:**
- Śledzenie liczby żądań w określonym przedziale czasowym
- Zwracanie błędu, gdy limit zostanie przekroczony
- Opcjonalnie: kolejkowanie żądań zamiast odrzucania

```typescript
private requestCount: number = 0;
private requestWindowStart: number = Date.now();
private readonly maxRequestsPerMinute: number = 60;

private checkRateLimit(): { allowed: boolean; error: Error | null } {
  const now = Date.now();
  const windowMs = 60000; // 1 minuta
  
  if (now - this.requestWindowStart > windowMs) {
    this.requestCount = 0;
    this.requestWindowStart = now;
  }
  
  if (this.requestCount >= this.maxRequestsPerMinute) {
    return {
      allowed: false,
      error: new Error("Rate limit exceeded. Maximum 60 requests per minute.")
    };
  }
  
  this.requestCount++;
  return { allowed: true, error: null };
}
```

### 6.5. Logowanie bezpieczne

**Zasada:** Nie loguj wrażliwych danych (klucze API, pełne treści wiadomości).

**Implementacja:**
```typescript
// ❌ NIE RÓB TEGO
console.log("API Key:", this.apiKey);
console.log("Full request:", request);

// ✅ ZRÓB TO
console.log("[OpenRouter] Request sent", {
  model: request.model,
  messageCount: request.messages.length,
  hasResponseFormat: !!request.responseFormat
});
```

### 6.6. HTTPS tylko

**Zasada:** Wszystkie żądania muszą być wysyłane przez HTTPS.

**Implementacja:**
- Weryfikacja, że `baseUrl` zaczyna się od `https://`
- W środowisku produkcyjnym: wymuszenie HTTPS

```typescript
if (!this.baseUrl.startsWith("https://")) {
  throw new Error("OpenRouter base URL must use HTTPS");
}
```

## 7. Plan wdrożenia krok po kroku

### Krok 1: Przygotowanie środowiska i zależności

#### 1.1. Instalacja zależności
```bash
npm install ajv  # Do walidacji JSON Schema
npm install --save-dev @types/node  # Jeśli potrzebne
```

#### 1.2. Konfiguracja zmiennych środowiskowych
Utwórz plik `.env.local` w katalogu głównym projektu:
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

Dodaj do `.gitignore`:
```
.env.local
.env
```

#### 1.3. Aktualizacja `src/env.d.ts`
Dodaj definicję zmiennej środowiskowej:
```typescript
interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
  // ... istniejące zmienne
}
```

### Krok 2: Definicja typów TypeScript

#### 2.1. Utwórz plik `src/types.ts` (lub dodaj do istniejącego)

Dodaj następujące typy:

```typescript
/**
 * ============================================================================
 * OpenRouter Service Types
 * ============================================================================
 */

/**
 * Komunikat w formacie OpenRouter API
 */
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Parametry modelu OpenRouter
 */
export interface OpenRouterModelParams {
  temperature?: number; // 0.0 - 2.0, domyślnie 1.0
  max_tokens?: number; // Maksymalna liczba tokenów w odpowiedzi
  top_p?: number; // 0.0 - 1.0, domyślnie 1.0
  frequency_penalty?: number; // -2.0 - 2.0, domyślnie 0
  presence_penalty?: number; // -2.0 - 2.0, domyślnie 0
  stop?: string[]; // Sekwencje zatrzymujące generowanie
}

/**
 * Format odpowiedzi z definicją schematu JSON
 */
export interface OpenRouterResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string; // Nazwa schematu
    strict: boolean; // Czy wymuszać ścisłą zgodność ze schematem
    schema: JSONSchema; // Definicja schematu JSON Schema
  };
}

/**
 * Typ pomocniczy dla JSON Schema (uproszczony)
 * W produkcji użyj biblioteki jak `json-schema` lub `ajv`
 */
export type JSONSchema = {
  type: "object" | "array" | "string" | "number" | "boolean";
  properties?: Record<string, JSONSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JSONSchema;
  enum?: (string | number)[];
  maxLength?: number;
  minLength?: number;
  maximum?: number;
  minimum?: number;
  description?: string;
  [key: string]: unknown;
};

/**
 * Konfiguracja konstruktora OpenRouterService
 */
export interface OpenRouterServiceConfig {
  apiKey: string;
  baseUrl?: string; // Domyślnie: "https://openrouter.ai/api/v1"
  defaultModel: string; // np. "openai/gpt-4", "anthropic/claude-3-opus"
  defaultParams?: OpenRouterModelParams;
}

/**
 * Żądanie do API OpenRouter
 */
export interface OpenRouterChatRequest {
  messages: OpenRouterMessage[];
  model?: string; // Opcjonalne, używa defaultModel jeśli nie podane
  responseFormat?: OpenRouterResponseFormat;
  params?: OpenRouterModelParams; // Nadpisuje defaultParams
}

/**
 * Odpowiedź z API OpenRouter (format wewnętrzny)
 */
export interface OpenRouterAPIResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: OpenRouterMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Ustrukturyzowana odpowiedź zwracana przez serwis
 */
export interface OpenRouterChatResponse {
  content: string; // Treść odpowiedzi
  parsedContent?: unknown; // Sparsowana treść JSON (jeśli responseFormat był użyty)
  model: string; // Nazwa użytego modelu
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string; // "stop", "length", "content_filter", itp.
}
```

### Krok 3: Implementacja serwisu

#### 3.1. Utwórz plik `src/lib/services/openrouter.service.ts`

Zacznij od szkieletu klasy:

```typescript
import type {
  OpenRouterServiceConfig,
  OpenRouterChatRequest,
  OpenRouterChatResponse,
  OpenRouterMessage,
  OpenRouterResponseFormat,
  OpenRouterModelParams,
  JSONSchema,
} from "../../types.ts";
import type { OpenRouterAPIResponse } from "../../types.ts";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultParams: OpenRouterModelParams;
  private readonly requestTimeout: number = 30000;

  constructor(config: OpenRouterServiceConfig) {
    // Implementacja konstruktora (patrz sekcja 2)
  }

  // Implementacja metod publicznych i prywatnych
}
```

#### 3.2. Implementuj konstruktor

Zgodnie z opisem w sekcji 2, dodaj walidację i inicjalizację pól.

#### 3.3. Implementuj metodę `chatCompletion`

```typescript
async chatCompletion(
  request: OpenRouterChatRequest
): Promise<{ data: OpenRouterChatResponse | null; error: Error | null }> {
  // 1. Walidacja żądania
  const validation = this.validateRequest(request);
  if (!validation.valid) {
    return { data: null, error: validation.error };
  }

  // 2. Sprawdzenie rate limit
  const rateLimitCheck = this.checkRateLimit();
  if (!rateLimitCheck.allowed) {
    return { data: null, error: rateLimitCheck.error };
  }

  // 3. Budowanie payload
  const payload = this.buildRequestPayload(request);

  // 4. Wysłanie żądania
  const apiResponse = await this.makeAPIRequest(payload);
  if (apiResponse.error) {
    return { data: null, error: apiResponse.error };
  }

  // 5. Parsowanie odpowiedzi
  try {
    const parsedResponse = this.parseResponse(apiResponse.data!);
    
    // 6. Walidacja JSON Schema (jeśli responseFormat był użyty)
    if (request.responseFormat) {
      const schemaValidation = this.validateJSONSchema(
        parsedResponse.parsedContent,
        request.responseFormat.json_schema.schema
      );
      if (!schemaValidation.valid) {
        return { data: null, error: schemaValidation.error };
      }
    }

    return { data: parsedResponse, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to parse response")
    };
  }
}
```

#### 3.4. Implementuj metody pomocnicze publiczne

- `createSystemMessage`
- `createUserMessage`
- `createResponseFormat`
- `validateModel`

#### 3.5. Implementuj metody prywatne

- `buildRequestPayload`
- `makeAPIRequest`
- `parseResponse`
- `validateJSONSchema`
- `validateRequest`
- `validateMessage`
- `handleAPIError`
- `checkRateLimit`

### Krok 4: Konfiguracja komunikatów

#### 4.1. Komunikat systemowy

Komunikat systemowy definiuje rolę i zachowanie asystenta. Przykłady:

**Przykład 1: Asystent do nauki języków**
```typescript
const systemMessage = service.createSystemMessage(
  "Jesteś pomocnym asystentem do nauki języków. " +
  "Twoim zadaniem jest tłumaczenie tekstów, wyjaśnianie gramatyki " +
  "i pomaganie w nauce nowych słów. Zawsze odpowiadaj w języku polskim."
);
```

**Przykład 2: Asystent do generowania fiszek**
```typescript
const systemMessage = service.createSystemMessage(
  "Jesteś ekspertem w tworzeniu fiszek edukacyjnych. " +
  "Twórz fiszki z pytaniami i odpowiedziami, które pomagają w efektywnej nauce. " +
  "Zawsze zwracaj odpowiedzi w formacie JSON zgodnym z podanym schematem."
);
```

**Przykład 3: Asystent z instrukcjami formatowania**
```typescript
const systemMessage = service.createSystemMessage(
  "Jesteś asystentem, który zawsze odpowiada w formacie JSON. " +
  "Twoje odpowiedzi muszą być ściśle zgodne z podanym schematem JSON Schema. " +
  "Nie dodawaj żadnych dodatkowych pól poza tymi zdefiniowanymi w schemacie."
);
```

#### 4.2. Komunikat użytkownika

Komunikat użytkownika zawiera treść zapytania:

**Przykład 1: Proste zapytanie**
```typescript
const userMessage = service.createUserMessage(
  "Przetłumacz słowo 'hello' na polski."
);
```

**Przykład 2: Zapytanie z kontekstem**
```typescript
const userMessage = service.createUserMessage(
  "Na podstawie tekstu: 'The quick brown fox jumps over the lazy dog', " +
  "stwórz fiszkę z pytaniem w języku angielskim i odpowiedzią w języku polskim."
);
```

**Przykład 3: Zapytanie wymagające strukturalnej odpowiedzi**
```typescript
const userMessage = service.createUserMessage(
  "Przeanalizuj zdanie 'I am learning TypeScript' i zwróć: " +
  "1. Czas gramatyczny, 2. Podmiot, 3. Orzeczenie, 4. Dopełnienie."
);
```

### Krok 5: Konfiguracja response_format (schemat JSON)

#### 5.1. Podstawowa struktura response_format

Format odpowiedzi musi być zgodny z wzorcem:
```typescript
{
  type: "json_schema",
  json_schema: {
    name: "schema_name",
    strict: true,
    schema: {
      // Definicja JSON Schema
    }
  }
}
```

#### 5.2. Przykłady schematów JSON

**Przykład 1: Schemat dla tłumaczenia**
```typescript
const translationSchema = service.createResponseFormat(
  "translation_response",
  {
    type: "object",
    properties: {
      translation: {
        type: "string",
        description: "Przetłumaczony tekst"
      },
      pronunciation: {
        type: "string",
        description: "Wymowa w formacie fonetycznym"
      },
      language: {
        type: "string",
        description: "Kod języka docelowego (np. 'pl', 'en')"
      }
    },
    required: ["translation"],
    additionalProperties: false
  },
  true // strict mode
);
```

**Przykład 2: Schemat dla fiszki**
```typescript
const flashcardSchema = service.createResponseFormat(
  "flashcard_data",
  {
    type: "object",
    properties: {
      source_text: {
        type: "string",
        maxLength: 200,
        description: "Tekst źródłowy (np. w języku angielskim)"
      },
      translation: {
        type: "string",
        description: "Tłumaczenie (np. w języku polskim)"
      },
      difficulty: {
        type: "string",
        enum: ["easy", "medium", "hard"],
        description: "Poziom trudności"
      },
      examples: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Przykłady użycia"
      }
    },
    required: ["source_text", "translation"],
    additionalProperties: false
  },
  true
);
```

**Przykład 3: Schemat dla analizy gramatycznej**
```typescript
const grammarAnalysisSchema = service.createResponseFormat(
  "grammar_analysis",
  {
    type: "object",
    properties: {
      tense: {
        type: "string",
        description: "Czas gramatyczny"
      },
      subject: {
        type: "string",
        description: "Podmiot zdania"
      },
      predicate: {
        type: "string",
        description: "Orzeczenie"
      },
      object: {
        type: "string",
        description: "Dopełnienie (opcjonalne)"
      },
      structure: {
        type: "string",
        enum: ["SVO", "SOV", "VSO"],
        description: "Struktura zdania"
      }
    },
    required: ["tense", "subject", "predicate"],
    additionalProperties: false
  },
  true
);
```

**Przykład 4: Schemat dla listy elementów**
```typescript
const listSchema = service.createResponseFormat(
  "word_list",
  {
    type: "object",
    properties: {
      words: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: { type: "string" },
            translation: { type: "string" },
            category: { type: "string" }
          },
          required: ["word", "translation"],
          additionalProperties: false
        },
        minLength: 1,
        maxLength: 50
      }
    },
    required: ["words"],
    additionalProperties: false
  },
  true
);
```

#### 5.3. Użycie response_format w żądaniu

```typescript
const { data, error } = await service.chatCompletion({
  messages: [
    systemMessage,
    userMessage
  ],
  responseFormat: translationSchema,
  model: "openai/gpt-4"
});

if (data && data.parsedContent) {
  // parsedContent zawiera już sparsowany obiekt JSON
  const translation = data.parsedContent as { translation: string; pronunciation?: string };
  console.log("Translation:", translation.translation);
}
```

### Krok 6: Konfiguracja nazwy modelu

#### 6.1. Popularne modele OpenRouter

**Modele OpenAI:**
- `openai/gpt-4-turbo` - Najnowszy GPT-4 Turbo
- `openai/gpt-4` - GPT-4
- `openai/gpt-3.5-turbo` - GPT-3.5 Turbo (tańszy)

**Modele Anthropic:**
- `anthropic/claude-3-opus` - Najbardziej zaawansowany
- `anthropic/claude-3-sonnet` - Zbalansowany
- `anthropic/claude-3-haiku` - Szybki i ekonomiczny

**Modele Google:**
- `google/gemini-pro` - Model Gemini Pro
- `google/gemini-pro-vision` - Z obsługą obrazów

#### 6.2. Wybór modelu w żądaniu

**Opcja 1: Użycie domyślnego modelu**
```typescript
const service = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultModel: "openai/gpt-4-turbo"
});

// Model nie jest podany - użyje defaultModel
const { data, error } = await service.chatCompletion({
  messages: [systemMessage, userMessage]
});
```

**Opcja 2: Nadpisanie modelu w żądaniu**
```typescript
// Użyje "anthropic/claude-3-sonnet" zamiast defaultModel
const { data, error } = await service.chatCompletion({
  messages: [systemMessage, userMessage],
  model: "anthropic/claude-3-sonnet"
});
```

**Opcja 3: Walidacja modelu przed użyciem**
```typescript
const modelToUse = "openai/gpt-4";
const validation = await service.validateModel(modelToUse);
if (!validation.valid) {
  console.error("Model not available:", validation.error);
  // Fallback do innego modelu
  modelToUse = "openai/gpt-3.5-turbo";
}
```

### Krok 7: Konfiguracja parametrów modelu

#### 7.1. Parametry i ich znaczenie

**temperature** (0.0 - 2.0, domyślnie 1.0):
- Kontroluje losowość odpowiedzi
- Niższe wartości = bardziej deterministyczne odpowiedzi
- Wyższe wartości = bardziej kreatywne odpowiedzi

**max_tokens** (liczba całkowita):
- Maksymalna liczba tokenów w odpowiedzi
- Ogranicza długość odpowiedzi

**top_p** (0.0 - 1.0, domyślnie 1.0):
- Kontroluje różnorodność odpowiedzi (nucleus sampling)
- Niższe wartości = bardziej skupione odpowiedzi

**frequency_penalty** (-2.0 - 2.0, domyślnie 0):
- Kara za powtarzanie tokenów
- Dodatnie wartości = mniej powtórzeń

**presence_penalty** (-2.0 - 2.0, domyślnie 0):
- Kara za używanie nowych tokenów
- Dodatnie wartości = zachęca do eksploracji nowych tematów

**stop** (tablica stringów):
- Sekwencje, które zatrzymują generowanie
- Przydatne do kontrolowania formatu odpowiedzi

#### 7.2. Przykłady konfiguracji parametrów

**Przykład 1: Domyślne parametry w konstruktorze**
```typescript
const service = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultModel: "openai/gpt-4",
  defaultParams: {
    temperature: 0.7, // Umiarkowana kreatywność
    max_tokens: 1000,
    top_p: 0.9,
    frequency_penalty: 0.3, // Zmniejsza powtórzenia
    presence_penalty: 0.1
  }
});
```

**Przykład 2: Nadpisanie parametrów w żądaniu**
```typescript
const { data, error } = await service.chatCompletion({
  messages: [systemMessage, userMessage],
  params: {
    temperature: 0.3, // Bardziej deterministyczna odpowiedź
    max_tokens: 500, // Krótsza odpowiedź
    frequency_penalty: 0.5 // Mniej powtórzeń
  }
});
```

**Przykład 3: Parametry dla strukturalnych odpowiedzi JSON**
```typescript
// Dla response_format z strict: true, użyj niskiej temperatury
const { data, error } = await service.chatCompletion({
  messages: [systemMessage, userMessage],
  responseFormat: jsonSchema,
  params: {
    temperature: 0.1, // Bardzo niska temperatura dla ścisłej zgodności
    max_tokens: 2000
  }
});
```

**Przykład 4: Parametry dla kreatywnych odpowiedzi**
```typescript
// Dla kreatywnych zadań, użyj wyższej temperatury
const { data, error } = await service.chatCompletion({
  messages: [systemMessage, userMessage],
  params: {
    temperature: 1.2, // Wysoka kreatywność
    top_p: 0.95,
    frequency_penalty: 0.2,
    presence_penalty: 0.3
  }
});
```

**Przykład 5: Użycie stop sequences**
```typescript
const { data, error } = await service.chatCompletion({
  messages: [systemMessage, userMessage],
  params: {
    stop: ["\n\n---", "END", "###"] // Zatrzymaj generowanie przy tych sekwencjach
  }
});
```

### Krok 8: Integracja z endpointem API

#### 8.1. Utwórz endpoint API w `src/pages/api/openrouter/chat.ts`

```typescript
import type { APIRoute } from "astro";
import { OpenRouterService } from "../../../lib/services/openrouter.service.ts";
import { createErrorResponse } from "../../../lib/utils/error-handler.ts";
import type { OpenRouterChatRequest } from "../../../types.ts";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    // 1. Autoryzacja użytkownika
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse("UNAUTHORIZED", "Authentication required.");
    }

    // 2. Parsowanie body
    const body = await context.request.json();
    const request: OpenRouterChatRequest = body;

    // 3. Walidacja żądania
    if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
      return createErrorResponse("VALIDATION_ERROR", "Messages array is required and cannot be empty.");
    }

    // 4. Inicjalizacja serwisu
    const service = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      defaultModel: request.model || "openai/gpt-4-turbo",
    });

    // 5. Wysłanie żądania
    const { data, error } = await service.chatCompletion(request);

    if (error) {
      console.error("[POST /api/openrouter/chat] Error:", error);
      return createErrorResponse("INTERNAL_SERVER_ERROR", error.message);
    }

    // 6. Zwrócenie odpowiedzi
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[POST /api/openrouter/chat] Unexpected error:", error);
    return createErrorResponse(
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred. Please try again later."
    );
  }
};
```

#### 8.2. Utwórz klienta API w `src/lib/utils/openrouter-client.ts`

```typescript
import type { OpenRouterChatRequest, OpenRouterChatResponse } from "../../types.ts";
import type { ErrorResponse } from "../../types.ts";
import { getAuthToken } from "./api-client.ts";

export async function sendChatMessage(
  request: OpenRouterChatRequest
): Promise<{ data: OpenRouterChatResponse | null; error: ErrorResponse | null }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        data: null,
        error: {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        },
      };
    }

    const response = await fetch("/api/openrouter/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: json as ErrorResponse,
      };
    }

    return {
      data: json.data as OpenRouterChatResponse,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      data: null,
      error: {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        },
      },
    };
  }
}
```

### Krok 9: Testowanie

#### 9.1. Testy jednostkowe

Utwórz plik `src/lib/services/__tests__/openrouter.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { OpenRouterService } from "../openrouter.service.ts";

describe("OpenRouterService", () => {
  let service: OpenRouterService;

  beforeEach(() => {
    service = new OpenRouterService({
      apiKey: "test-api-key",
      defaultModel: "openai/gpt-4",
    });
  });

  it("should create system message", () => {
    const message = service.createSystemMessage("Test system message");
    expect(message.role).toBe("system");
    expect(message.content).toBe("Test system message");
  });

  it("should create user message", () => {
    const message = service.createUserMessage("Test user message");
    expect(message.role).toBe("user");
    expect(message.content).toBe("Test user message");
  });

  // Dodaj więcej testów...
});
```

#### 9.2. Testy integracyjne

Przetestuj pełny przepływ:
1. Utworzenie serwisu
2. Wysłanie żądania z komunikatami
3. Otrzymanie odpowiedzi
4. Walidacja struktury odpowiedzi

### Krok 10: Dokumentacja i przykłady użycia

#### 10.1. Utwórz plik z przykładami

Dodaj przykłady użycia w komentarzach JSDoc w pliku serwisu.

#### 10.2. Zaktualizuj README

Dodaj sekcję o usłudze OpenRouter w głównym README projektu.

## Podsumowanie

Plan wdrożenia obejmuje:

1. ✅ **Przygotowanie środowiska**: Instalacja zależności, konfiguracja zmiennych środowiskowych
2. ✅ **Definicja typów**: Kompletne typy TypeScript dla wszystkich komponentów
3. ✅ **Implementacja serwisu**: Klasa `OpenRouterService` z wszystkimi metodami
4. ✅ **Obsługa komunikatów**: Systemowe i użytkownika z przykładami
5. ✅ **Response format**: Szczegółowe przykłady schematów JSON
6. ✅ **Konfiguracja modeli**: Wybór i walidacja modeli
7. ✅ **Parametry modelu**: Konfiguracja temperature, max_tokens, itp.
8. ✅ **Obsługa błędów**: Kompleksowa obsługa wszystkich scenariuszy błędów
9. ✅ **Bezpieczeństwo**: Bezpieczne przechowywanie kluczy, walidacja danych
10. ✅ **Integracja**: Endpoint API i klient frontendowy
11. ✅ **Testowanie**: Testy jednostkowe i integracyjne

Plan jest gotowy do wdrożenia przez developera zgodnie z najlepszymi praktykami TypeScript, Astro i bezpieczeństwa.

