# API Endpoint Implementation Plan: GET /api/flashcards/:id

## 1. Przegląd punktu końcowego

Endpoint **GET /api/flashcards/:id** służy do pobierania pojedynczej fiszki edukacyjnej należącej do zalogowanego użytkownika. Endpoint wymaga autoryzacji i zwraca szczegóły fiszki (id, source_text, translation) tylko wtedy, gdy fiszka istnieje i należy do użytkownika wykonującego żądanie.

**Główne funkcjonalności:**
- Pobieranie pojedynczej fiszki po identyfikatorze UUID
- Automatyczne filtrowanie po użytkowniku (RLS + walidacja)
- Zwracanie danych w formacie DTO (bez wewnętrznych pól jak user_id)
- Obsługa błędów: 401 (brak autoryzacji), 404 (nie znaleziono), 500 (błąd serwera)

## 2. Szczegóły żądania

**Metoda HTTP:** `GET`

**Struktura URL:** `/api/flashcards/:id`

**Path Parameters:**
- `id` (UUID, wymagane): Identyfikator fiszki w formacie UUID. Musi być poprawnym UUID i istnieć w bazie danych.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (wymagane) - Token JWT z Supabase Auth

**Request Body:** Brak

**Query Parameters:** Brak

## 3. Wykorzystywane typy

### 3.1 Typy z `src/types.ts`

**Entity Type:**
- `FlashcardEntity` - Pełna encja fiszki z bazy danych (zawiera user_id, created_at, updated_at)

**DTO Type:**
- `FlashcardDTO` - Typ odpowiedzi API, zawiera tylko: `id`, `source_text`, `translation`

**Response Type:**
- `GetFlashcardResponse` - Struktura odpowiedzi: `{ data: FlashcardDTO }`

**Error Types:**
- `ErrorResponse` - Standardowa struktura błędu: `{ error: { code: ErrorCode, message: string, details?: ErrorDetails } }`
- `ErrorCode` - Typ wyliczeniowy: `'UNAUTHORIZED' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR' | 'DATABASE_ERROR'`

### 3.2 Typy z `src/db/database.types.ts`

- `Tables<'flashcards'>` - Typ wiersza z tabeli flashcards
- `SupabaseClient<Database>` - Typ klienta Supabase dostępny w `context.locals.supabase`

## 4. Szczegóły odpowiedzi

### 4.1 Sukces (200 OK)

**Struktura odpowiedzi:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "source_text": "Hello",
    "translation": "Cześć"
  }
}
```

**Typ TypeScript:** `GetFlashcardResponse`

**Uwagi:**
- Pole `translation` może być `null` jeśli fiszka nie ma przypisanej translacji
- Pole `user_id` nie jest zwracane (wewnętrzne pole)

### 4.2 Błędy

#### 4.2.1 401 Unauthorized - Brak lub nieprawidłowy token

**Struktura odpowiedzi:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide a valid JWT token."
  }
}
```

**Scenariusze:**
- Brak nagłówka `Authorization`
- Nieprawidłowy format tokenu
- Wygasły token
- Nieprawidłowy podpis tokenu

#### 4.2.2 404 Not Found - Fiszka nie znaleziona

**Struktura odpowiedzi:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Flashcard not found or you do not have permission to access it"
  }
}
```

**Scenariusze:**
- Fiszka o podanym ID nie istnieje
- Fiszka istnieje, ale należy do innego użytkownika (RLS blokuje dostęp)
- Nieprawidłowy format UUID (powinien być obsłużony jako 400, ale RLS może zwrócić 404)

#### 4.2.3 400 Bad Request - Nieprawidłowy format UUID

**Struktura odpowiedzi:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid UUID format for flashcard ID",
    "details": {
      "parameter": "id",
      "provided_value": "invalid-uuid"
    }
  }
}

**Scenariusze:**
- Parametr `id` nie jest poprawnym UUID
- Parametr `id` jest pusty lub nieprawidłowy

#### 4.2.4 500 Internal Server Error - Błąd serwera

**Struktura odpowiedzi:**
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

**Scenariusze:**
- Błąd połączenia z bazą danych
- Błąd Supabase SDK
- Nieoczekiwany wyjątek w kodzie

## 5. Przepływ danych

### 5.1 Diagram przepływu

```
1. Request → GET /api/flashcards/:id
   ↓
2. Middleware (src/middleware/index.ts)
   - Dodaje supabase client do context.locals
   ↓
3. API Route Handler (src/pages/api/flashcards/[id].ts)
   - Walidacja UUID parametru :id
   - Pobranie użytkownika z tokenu JWT (via Supabase)
   ↓
4. Service Layer (src/lib/services/flashcards.service.ts)
   - Wywołanie metody getFlashcardById(id, userId)
   ↓
5. Supabase Query
   - SELECT * FROM flashcards WHERE id = :id AND user_id = :userId
   - RLS automatycznie filtruje po user_id
   ↓
6. Mapowanie Entity → DTO
   - Konwersja FlashcardEntity → FlashcardDTO
   - Usunięcie pól: user_id, created_at, updated_at
   ↓
7. Response → JSON { data: FlashcardDTO }
```

### 5.2 Szczegółowy przepływ

**Krok 1: Otrzymanie żądania**
- Astro API route otrzymuje żądanie GET na `/api/flashcards/:id`
- Parametr `id` jest dostępny w `Astro.params.id`

**Krok 2: Middleware**
- Middleware (`src/middleware/index.ts`) wykonuje się przed handlerem
- Dodaje `supabaseClient` do `context.locals.supabase`
- Klient Supabase jest już skonfigurowany z odpowiednimi zmiennymi środowiskowymi

**Krok 3: Walidacja i autoryzacja**
- Walidacja formatu UUID parametru `id` (używając regex lub biblioteki UUID)
- Pobranie użytkownika z tokenu JWT:
  ```typescript
  const { data: { user }, error: authError } = await context.locals.supabase.auth.getUser();
  ```
- Jeśli brak użytkownika → zwróć 401

**Krok 4: Zapytanie do bazy danych**
- Wywołanie serwisu: `flashcardsService.getFlashcardById(id, user.id)`
- Serwis wykonuje zapytanie:
  ```typescript
  const { data, error } = await supabase
    .from('flashcards')
    .select('id, source_text, translation')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  ```
- RLS automatycznie zapewnia, że użytkownik widzi tylko swoje fiszki

**Krok 5: Obsługa wyniku**
- Jeśli `error` → sprawdź typ błędu:
  - `PGRST116` (not found) → 404
  - Inne błędy → 500
- Jeśli `data` → mapuj do DTO i zwróć 200

**Krok 6: Formatowanie odpowiedzi**
- Konwersja `FlashcardEntity` → `FlashcardDTO` (usunięcie user_id)
- Zwrócenie JSON: `{ data: FlashcardDTO }`

## 6. Względy bezpieczeństwa

### 6.1 Autoryzacja

**Mechanizm:**
- Wszystkie żądania wymagają poprawnego tokenu JWT w nagłówku `Authorization`
- Token jest weryfikowany przez Supabase Auth SDK
- Funkcja `getUser()` zwraca użytkownika tylko dla ważnych tokenów

**Implementacja:**
```typescript
const { data: { user }, error: authError } = await context.locals.supabase.auth.getUser();
if (authError || !user) {
  return new Response(JSON.stringify({ error: { ... } }), { status: 401 });
}
```

### 6.2 Autoryzacja na poziomie danych (RLS)

**Mechanizm:**
- Row Level Security (RLS) jest włączone dla tabeli `flashcards`
- Polityka SELECT: `user_id = auth.uid()`
- Nawet jeśli kod aplikacji ma błąd, RLS zapobiega dostępowi do cudzych danych

**Zabezpieczenie:**
- RLS działa na poziomie bazy danych
- Automatycznie filtruje wyniki zapytań
- Nie można obejść przez bezpośrednie zapytania SQL

### 6.3 Walidacja danych wejściowych

**UUID Validation:**
- Parametr `id` musi być poprawnym UUID v4
- Walidacja przed wykonaniem zapytania do bazy danych
- Zapobiega niepotrzebnym zapytaniom i potencjalnym atakom

**Implementacja:**
```typescript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(id)) {
  return new Response(JSON.stringify({ error: { ... } }), { status: 400 });
}
```

### 6.4 Ochrona przed SQL Injection

**Mechanizm:**
- Supabase SDK używa parametryzowanych zapytań
- Wszystkie wartości są automatycznie escapowane
- Nie ma możliwości bezpośredniego wykonania SQL z danych użytkownika

### 6.5 Ochrona przed ujawnieniem informacji

**Zasada:**
- Błędy 404 dla nieistniejących fiszek i fiszek innych użytkowników zwracają ten sam komunikat
- Zapobiega wyliczaniu ID fiszek innych użytkowników
- Komunikat: "Flashcard not found or you do not have permission to access it"

## 7. Obsługa błędów

### 7.1 Hierarchia obsługi błędów

```
1. Walidacja UUID (400 Bad Request)
   ↓ Jeśli UUID poprawny
2. Autoryzacja użytkownika (401 Unauthorized)
   ↓ Jeśli użytkownik zalogowany
3. Zapytanie do bazy danych
   ↓ Jeśli zapytanie wykonane
4. Sprawdzenie wyniku:
   - Brak danych → 404 Not Found
   - Błąd bazy danych → 500 Internal Server Error
   - Sukces → 200 OK
```

### 7.2 Szczegółowa obsługa błędów

#### 7.2.1 Błąd walidacji UUID (400)

**Warunek:** Parametr `id` nie jest poprawnym UUID

**Obsługa:**
```typescript
if (!isValidUUID(id)) {
  return new Response(
    JSON.stringify({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid UUID format for flashcard ID',
        details: { parameter: 'id', provided_value: id }
      }
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
```

#### 7.2.2 Błąd autoryzacji (401)

**Warunki:**
- Brak tokenu w nagłówku Authorization
- Nieprawidłowy format tokenu
- Wygasły token
- Nieprawidłowy podpis tokenu

**Obsługa:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return new Response(
    JSON.stringify({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please provide a valid JWT token.'
      }
    }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}
```

#### 7.2.3 Fiszka nie znaleziona (404)

**Warunki:**
- Fiszka o podanym ID nie istnieje
- Fiszka istnieje, ale należy do innego użytkownika (RLS)

**Obsługa:**
```typescript
const { data, error } = await supabase
  .from('flashcards')
  .select('id, source_text, translation')
  .eq('id', id)
  .single();

if (error) {
  if (error.code === 'PGRST116') { // Not found
    return new Response(
      JSON.stringify({
        error: {
          code: 'NOT_FOUND',
          message: 'Flashcard not found or you do not have permission to access it'
        }
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  // Inne błędy → 500
}
```

#### 7.2.4 Błąd serwera (500)

**Warunki:**
- Błąd połączenia z bazą danych
- Błąd Supabase SDK
- Nieoczekiwany wyjątek

**Obsługa:**
```typescript
try {
  // ... kod endpointu
} catch (error) {
  console.error('Unexpected error in GET /api/flashcards/:id', error);
  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.'
      }
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

### 7.3 Logowanie błędów

**Zasady:**
- Błędy 4xx (400, 401, 404) - logowanie na poziomie INFO (dla monitoringu)
- Błędy 5xx (500) - logowanie na poziomie ERROR (z pełnym stack trace)
- Nie loguj wrażliwych danych (tokeny, hasła)
- Loguj: timestamp, endpoint, błąd, user_id (jeśli dostępny)

**Implementacja:**
```typescript
// Dla błędów 4xx
console.info(`[GET /api/flashcards/:id] ${statusCode} - ${errorCode}: ${message}`, { id, userId });

// Dla błędów 5xx
console.error(`[GET /api/flashcards/:id] ${statusCode} - Unexpected error`, { error, id, userId });
```

## 8. Rozważania dotyczące wydajności

### 8.1 Optymalizacja zapytań

**Indeksy:**
- PRIMARY KEY na `id` - automatyczny indeks, optymalizuje wyszukiwanie po ID
- Indeks na `user_id` - optymalizuje filtrowanie po użytkowniku (wymagane dla RLS)

**Zapytanie:**
- Używamy `.single()` zamiast `.select().limit(1)` - bardziej efektywne
- Wybieramy tylko potrzebne kolumny: `id, source_text, translation`
- Nie pobieramy `user_id`, `created_at`, `updated_at` (nie są potrzebne w odpowiedzi)

### 8.2 Cache'owanie

**Obecnie:** Brak cache'owania (MVP)

**Przyszłe rozszerzenia:**
- Cache na poziomie serwera dla często pobieranych fiszek
- Cache na poziomie klienta (frontend)
- TTL cache: 5-10 minut dla danych użytkownika

### 8.3 Limity i throttling

**Obecnie:** Brak limitów (MVP)

**Rekomendacje:**
- Rate limiting: 200 żądań na minutę na użytkownika
- Timeout zapytań: 5 sekund
- Connection pooling: Zarządzane przez Supabase

### 8.4 Potencjalne wąskie gardła

1. **Połączenie z bazą danych:**
   - Supabase zarządza pulą połączeń
   - W przypadku problemów: zwiększyć timeout lub użyć retry logic

2. **Walidacja UUID:**
   - Regex jest szybki, ale można użyć biblioteki UUID dla lepszej walidacji
   - Nie jest to wąskie gardło dla MVP

3. **RLS Policy Evaluation:**
   - RLS jest wydajne dzięki indeksowi na `user_id`
   - Dla bardzo dużych zbiorów może być wolniejsze, ale nie dotyczy MVP

## 9. Etapy wdrożenia

### Krok 1: Utworzenie struktury katalogów

**Akcje:**
1. Utworzyć katalog `src/pages/api/flashcards/` jeśli nie istnieje
2. Utworzyć plik `src/pages/api/flashcards/[id].ts` dla dynamicznego routingu Astro

**Struktura:**
```
src/
  pages/
    api/
      flashcards/
        [id].ts  ← Nowy plik
```

### Krok 2: Utworzenie serwisu flashcards

**Akcje:**
1. Utworzyć katalog `src/lib/services/` jeśli nie istnieje
2. Utworzyć plik `src/lib/services/flashcards.service.ts`
3. Zaimplementować funkcję `getFlashcardById(id: string, userId: string)`

**Implementacja serwisu:**
```typescript
// src/lib/services/flashcards.service.ts
import type { SupabaseClient } from '../db/supabase.client.ts';
import type { Database } from '../db/database.types.ts';
import type { FlashcardDTO } from '../../types.ts';

export async function getFlashcardById(
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string
): Promise<{ data: FlashcardDTO | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('id, source_text, translation')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (!data) {
    return { data: null, error: null };
  }

  // Mapowanie do DTO (już mamy tylko potrzebne pola)
  const dto: FlashcardDTO = {
    id: data.id,
    source_text: data.source_text,
    translation: data.translation
  };

  return { data: dto, error: null };
}
```

### Krok 3: Utworzenie helpera do walidacji UUID

**Akcje:**
1. Utworzyć plik `src/lib/utils/validation.ts` (lub dodać do istniejącego `src/lib/utils.ts`)
2. Zaimplementować funkcję `isValidUUID(uuid: string): boolean`

**Implementacja:**
```typescript
// src/lib/utils/validation.ts
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```

### Krok 4: Utworzenie helpera do obsługi błędów

**Akcje:**
1. Utworzyć plik `src/lib/utils/error-handler.ts`
2. Zaimplementować funkcje pomocnicze do tworzenia odpowiedzi błędów

**Implementacja:**
```typescript
// src/lib/utils/error-handler.ts
import type { ErrorResponse, ErrorCode } from '../../types.ts';

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): Response {
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      ...(details && { details })
    }
  };

  const statusCode = getStatusCodeForError(code);
  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}

function getStatusCodeForError(code: ErrorCode): number {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'NOT_FOUND':
      return 404;
    case 'INTERNAL_SERVER_ERROR':
    case 'DATABASE_ERROR':
      return 500;
    default:
      return 500;
  }
}
```

### Krok 5: Implementacja endpointu GET

**Akcje:**
1. Utworzyć plik `src/pages/api/flashcards/[id].ts`
2. Zaimplementować handler GET zgodnie z przepływem danych
3. Dodać walidację, autoryzację, obsługę błędów

**Implementacja:**
```typescript
// src/pages/api/flashcards/[id].ts
import type { APIRoute } from 'astro';
import { getFlashcardById } from '../../../lib/services/flashcards.service.ts';
import { isValidUUID } from '../../../lib/utils/validation.ts';
import { createErrorResponse } from '../../../lib/utils/error-handler.ts';
import type { GetFlashcardResponse } from '../../../types.ts';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    // Walidacja UUID
    if (!id || !isValidUUID(id)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid UUID format for flashcard ID',
        { parameter: 'id', provided_value: id }
      );
    }

    // Autoryzacja
    const { data: { user }, error: authError } = await context.locals.supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required. Please provide a valid JWT token.'
      );
    }

    // Pobranie fiszki
    const { data: flashcard, error: serviceError } = await getFlashcardById(
      context.locals.supabase,
      id,
      user.id
    );

    if (serviceError) {
      console.error('[GET /api/flashcards/:id] Service error', { error: serviceError, id, userId: user.id });
      return createErrorResponse(
        'DATABASE_ERROR',
        'Database operation failed. Please try again later.'
      );
    }

    if (!flashcard) {
      return createErrorResponse(
        'NOT_FOUND',
        'Flashcard not found or you do not have permission to access it'
      );
    }

    // Sukces
    const response: GetFlashcardResponse = { data: flashcard };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[GET /api/flashcards/:id] Unexpected error', error);
    return createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred. Please try again later.'
    );
  }
};
```

### Krok 6: Testowanie endpointu

**Akcje:**
1. Testowanie z poprawnym UUID i tokenem → oczekiwany 200 OK
2. Testowanie z nieprawidłowym UUID → oczekiwany 400 Bad Request
3. Testowanie bez tokenu → oczekiwany 401 Unauthorized
4. Testowanie z nieistniejącym UUID → oczekiwany 404 Not Found
5. Testowanie z UUID fiszki innego użytkownika → oczekiwany 404 Not Found

**Narzędzia:**
- Postman / Insomnia
- curl
- Testy jednostkowe (opcjonalnie dla MVP)

### Krok 7: Dokumentacja i code review

**Akcje:**
1. Sprawdzenie zgodności z API specification
2. Weryfikacja typów TypeScript
3. Sprawdzenie obsługi błędów
4. Weryfikacja bezpieczeństwa (RLS, walidacja)

### Krok 8: Weryfikacja linterów

**Akcje:**
1. Uruchomienie linterów (ESLint, TypeScript)
2. Naprawienie wszystkich błędów i ostrzeżeń
3. Weryfikacja zgodności z coding practices z reguł projektu

## 10. Uwagi implementacyjne

### 10.1 Użycie Supabase Client

**Ważne:**
- Używamy `context.locals.supabase` zamiast bezpośredniego importu `supabaseClient`
- Zgodnie z regułami: "Use supabase from context.locals in Astro routes instead of importing supabaseClient directly"
- Middleware automatycznie dodaje klienta do context.locals

### 10.2 Typy Supabase

**Ważne:**
- Używamy typu `SupabaseClient<Database>` z `src/db/supabase.client.ts`
- NIE używamy typu z `@supabase/supabase-js` bezpośrednio
- Zgodnie z regułami: "Use SupabaseClient type from `src/db/supabase.client.ts`, not from `@supabase/supabase-js`"

### 10.3 Format odpowiedzi

**Ważne:**
- Wszystkie odpowiedzi (sukces i błędy) muszą mieć nagłówek `Content-Type: application/json`
- Struktura odpowiedzi musi być zgodna z typami w `src/types.ts`
- Nie zwracamy wewnętrznych pól (user_id, created_at, updated_at)

### 10.4 RLS i bezpieczeństwo

**Ważne:**
- RLS automatycznie filtruje wyniki, ale dodatkowo filtrujemy po `user_id` w kodzie jako defense in depth
- Trigger `set_flashcards_user_id` zapobiega zmianie właściciela fiszki
- Nie ufamy danym z klienta - zawsze weryfikujemy na serwerze

### 10.5 Obsługa błędów Supabase

**Ważne:**
- Kod błędu `PGRST116` oznacza "not found" (0 wierszy zwróconych)
- Inne kody błędów Supabase powinny być logowane i zwracane jako 500
- Zawsze loguj błędy dla debugowania, ale nie ujawniaj szczegółów w odpowiedzi

## 11. Podsumowanie

Plan wdrożenia endpointu **GET /api/flashcards/:id** obejmuje:

✅ **Kompletny przepływ danych** - od żądania do odpowiedzi
✅ **Bezpieczeństwo** - autoryzacja, RLS, walidacja
✅ **Obsługa błędów** - wszystkie scenariusze błędów
✅ **Wydajność** - optymalizacja zapytań, indeksy
✅ **Szczegółowe kroki implementacji** - gotowe do wykonania
✅ **Zgodność z regułami projektu** - Astro, TypeScript, Supabase

Endpoint jest gotowy do implementacji zgodnie z tym planem, zapewniając bezpieczne, wydajne i zgodne z API specification rozwiązanie.

