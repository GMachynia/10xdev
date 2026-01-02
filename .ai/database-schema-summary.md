# Podsumowanie decyzji projektowych - Schemat bazy danych

## Struktura tabeli `flashcards`

### Pola wymagane:
- `id` - UUID PRIMARY KEY (DEFAULT gen_random_uuid())
- `user_id` - UUID NOT NULL, REFERENCES auth.users(id)
- `source_text` - VARCHAR(200) NOT NULL z CHECK constraint: `CHECK (char_length(source_text) <= 200)`
- `translation` - TEXT (opcjonalne, może być NULL)

### Pola wykluczone z MVP:
- `created_at` - NIE dodawać (brak wymagań w MVP)
- `updated_at` - NIE dodawać (brak wymagań w MVP)
- `source_language` - NIE dodawać (brak przechowywania informacji o językach)
- `target_language` - NIE dodawać (brak przechowywania informacji o językach)
- `deleted_at` - NIE dodawać (hard delete w MVP)

## Relacje i struktura

### Tabele:
1. **`flashcards`** - jedyna tabela biznesowa
   - Relacja: `user_id` → `auth.users(id)` (Supabase auth)
   - Brak dodatkowych tabel referencyjnych

2. **`auth.users`** - wbudowana tabela Supabase
   - Brak dodatkowej tabeli `user_profiles`

## Bezpieczeństwo (RLS)

### Polityki Row Level Security dla `flashcards`:
- **SELECT**: `user_id = auth.uid()`
- **INSERT**: `user_id = auth.uid()` (automatyczne ustawienie przez trigger)
- **UPDATE**: `user_id = auth.uid()`
- **DELETE**: `user_id = auth.uid()`

### Trigger:
- **BEFORE INSERT/UPDATE**: Automatyczne ustawienie `user_id = auth.uid()` dla podwójnej ochrony

## Walidacja

### Poziom bazy danych:
- CHECK constraint: `CHECK (char_length(source_text) <= 200)` na polu `source_text`
- NOT NULL na `user_id` i `source_text`

### Poziom aplikacji:
- Walidacja długości tekstu przed zapisem (dla lepszego UX)

## Operacje na danych

### System powtórek:
- Losowa kolejność: `ORDER BY RANDOM()` przy każdym zapytaniu
- Brak osobnej tabeli do śledzenia sesji powtórek
- Indeks na `user_id` dla optymalizacji zapytań

### Usuwanie:
- **Hard delete** - fizyczne usunięcie z bazy (DELETE)
- Brak soft delete w MVP

## Indeksy

### Wymagane:
- PRIMARY KEY na `id` (UUID)
- INDEX na `user_id` (dla szybkich zapytań filtrowanych po użytkowniku)
- FOREIGN KEY constraint na `user_id` → `auth.users(id)`

## Optymalizacja

### Zapytania losowej kolejności:
- Indeks na `user_id` dla filtrowania
- `ORDER BY RANDOM()` dla losowej kolejności
- Rozważenie cache'owania losowej kolejności w sesji frontendowej (opcjonalnie)



