# Schemat bazy danych PostgreSQL - Aplikacja Fiszki Edukacyjne z AI

## 1. Tabele

### 1.1 Tabela `flashcards`

Główna tabela biznesowa przechowująca fiszki edukacyjne użytkowników.

#### Kolumny:

| Nazwa kolumny | Typ danych | Ograniczenia | Opis |
|--------------|------------|--------------|------|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Unikalny identyfikator fiszki |
| `user_id` | `UUID` | NOT NULL, FOREIGN KEY → `auth.users(id)` | Identyfikator użytkownika, który utworzył fiszkę |
| `source_text` | `VARCHAR(200)` | NOT NULL, CHECK `char_length(source_text) <= 200` | Tekst źródłowy fiszki (słowo/fraza), maksymalnie 200 znaków |
| `translation` | `TEXT` | NULL | Translacja lub znaczenie tekstu źródłowego (opcjonalne) |

#### Definicja SQL:

```sql
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_text VARCHAR(200) NOT NULL CHECK (char_length(source_text) <= 200),
    translation TEXT
);
```

#### Uwagi:
- `source_text` jest ograniczone do 200 znaków zgodnie z wymaganiami PRD
- `translation` może być NULL, ponieważ użytkownik może utworzyć fiszkę bez translacji
- `user_id` ma ON DELETE CASCADE, aby automatycznie usuwać fiszki użytkownika przy usunięciu konta
- Brak pól `created_at`, `updated_at` - wykluczone z MVP zgodnie z notatkami z sesji
- Brak pól `source_language`, `target_language` - wykluczone z MVP (użytkownik określa języki ręcznie w UI, ale nie są przechowywane w bazie)

### 1.2 Tabela `auth.users`

**WAŻNE:** Tabela `auth.users` jest w pełni obsługiwana przez **Supabase Auth** i nie wymaga tworzenia ani konfiguracji w naszym schemacie bazy danych.

#### Charakterystyka:
- Tabela jest automatycznie tworzona i zarządzana przez Supabase Auth
- Nie wymaga żadnych migracji ani definicji SQL z naszej strony
- Wykorzystywana wyłącznie jako referencja dla foreign key w tabeli `flashcards`

#### Struktura (zarządzana przez Supabase):
- `id` (UUID) - PRIMARY KEY, używany jako referencja w `flashcards.user_id`
- `email` - adres email użytkownika
- `encrypted_password` - zahashowane hasło
- `created_at` - data utworzenia konta
- Inne pola standardowe dla Supabase Auth

#### Uwagi:
- **Nie tworzymy** własnej tabeli `users` - Supabase Auth zarządza tym automatycznie
- **Nie modyfikujemy** struktury `auth.users` - jest to wbudowana tabela systemowa
- Brak dodatkowej tabeli `user_profiles` - zgodnie z notatkami z sesji, MVP nie wymaga dodatkowych danych użytkownika
- Wszystkie operacje na użytkownikach (rejestracja, logowanie, wylogowanie) są obsługiwane przez Supabase Auth SDK

## 2. Relacje między tabelami

### 2.1 Relacja `flashcards` → `auth.users`

**Typ relacji:** Jeden-do-wielu (One-to-Many)

- Jeden użytkownik może mieć wiele fiszek
- Każda fiszka należy do dokładnie jednego użytkownika
- **Kardynalność:** `auth.users(1) : flashcards(N)`

**Implementacja:**
- Foreign Key: `flashcards.user_id` → `auth.users(id)`
- ON DELETE CASCADE: Usunięcie użytkownika automatycznie usuwa wszystkie jego fiszki

### 2.2 Diagram relacji

```
auth.users (1) ────────< (N) flashcards
```

## 3. Indeksy

### 3.1 Indeksy dla tabeli `flashcards`

#### 3.1.1 Indeks na `user_id`

**Nazwa:** `idx_flashcards_user_id`

**Definicja:**
```sql
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
```

**Uzasadnienie:**
- Optymalizuje zapytania filtrowane po użytkowniku (najczęstsza operacja)
- Wymagany dla wydajnego działania RLS (Row Level Security)
- Przyspiesza operacje SELECT, UPDATE, DELETE dla fiszek użytkownika

#### 3.1.2 Indeks PRIMARY KEY

**Nazwa:** Automatycznie utworzony przez PostgreSQL

**Uzasadnienie:**
- Indeks PRIMARY KEY jest automatycznie tworzony przez PostgreSQL
- Optymalizuje operacje wyszukiwania po `id`

### 3.2 Podsumowanie indeksów

| Nazwa indeksu | Tabela | Kolumny | Typ | Uzasadnienie |
|--------------|--------|---------|-----|--------------|
| `flashcards_pkey` | `flashcards` | `id` | PRIMARY KEY | Automatyczny, optymalizacja wyszukiwań po ID |
| `idx_flashcards_user_id` | `flashcards` | `user_id` | B-tree | Optymalizacja zapytań filtrowanych po użytkowniku i RLS |

## 4. Ograniczenia (Constraints)

### 4.1 Ograniczenia dla tabeli `flashcards`

#### 4.1.1 PRIMARY KEY

```sql
PRIMARY KEY (id)
```

#### 4.1.2 FOREIGN KEY

```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```

#### 4.1.3 NOT NULL

- `id`: NOT NULL (automatycznie przez PRIMARY KEY)
- `user_id`: NOT NULL
- `source_text`: NOT NULL

#### 4.1.4 CHECK Constraint

```sql
CHECK (char_length(source_text) <= 200)
```

**Uzasadnienie:**
- Zapewnia walidację długości tekstu na poziomie bazy danych
- Dodatkowa warstwa bezpieczeństwa obok walidacji w aplikacji
- Zgodne z wymaganiami PRD (maksymalnie 200 znaków)

## 5. Row Level Security (RLS)

### 5.1 Włączenie RLS dla tabeli `flashcards`

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
```

### 5.2 Polityki RLS

#### 5.2.1 Polityka SELECT

**Nazwa:** `flashcards_select_policy`

**Definicja:**
```sql
CREATE POLICY flashcards_select_policy ON flashcards
    FOR SELECT
    USING (user_id = auth.uid());
```

**Opis:**
- Użytkownik może odczytać tylko swoje własne fiszki
- `auth.uid()` zwraca UUID zalogowanego użytkownika

#### 5.2.2 Polityka INSERT

**Nazwa:** `flashcards_insert_policy`

**Definicja:**
```sql
CREATE POLICY flashcards_insert_policy ON flashcards
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

**Opis:**
- Użytkownik może tworzyć fiszki tylko dla siebie
- `user_id` musi być równy ID zalogowanego użytkownika
- Trigger dodatkowo zapewnia automatyczne ustawienie `user_id`

#### 5.2.3 Polityka UPDATE

**Nazwa:** `flashcards_update_policy`

**Definicja:**
```sql
CREATE POLICY flashcards_update_policy ON flashcards
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

**Opis:**
- Użytkownik może aktualizować tylko swoje własne fiszki
- `USING` kontroluje dostęp do istniejących wierszy
- `WITH CHECK` zapewnia, że po aktualizacji `user_id` nadal należy do zalogowanego użytkownika

#### 5.2.4 Polityka DELETE

**Nazwa:** `flashcards_delete_policy`

**Definicja:**
```sql
CREATE POLICY flashcards_delete_policy ON flashcards
    FOR DELETE
    USING (user_id = auth.uid());
```

**Opis:**
- Użytkownik może usuwać tylko swoje własne fiszki
- Hard delete - fiszka jest trwale usuwana z bazy danych

### 5.3 Podsumowanie polityk RLS

| Nazwa polityki | Operacja | Warunek |
|----------------|----------|---------|
| `flashcards_select_policy` | SELECT | `user_id = auth.uid()` |
| `flashcards_insert_policy` | INSERT | `user_id = auth.uid()` |
| `flashcards_update_policy` | UPDATE | `user_id = auth.uid()` (USING i WITH CHECK) |
| `flashcards_delete_policy` | DELETE | `user_id = auth.uid()` |

## 6. Triggers

### 6.1 Trigger automatycznego ustawienia `user_id`

**Nazwa:** `set_flashcards_user_id`

**Typ:** BEFORE INSERT OR UPDATE

**Funkcja:**
```sql
CREATE OR REPLACE FUNCTION set_flashcards_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Trigger:**
```sql
CREATE TRIGGER set_flashcards_user_id
    BEFORE INSERT OR UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION set_flashcards_user_id();
```

**Uzasadnienie:**
- Automatycznie ustawia `user_id` na podstawie zalogowanego użytkownika
- Dodatkowa warstwa bezpieczeństwa - zapobiega przypadkowemu lub celowemu ustawieniu nieprawidłowego `user_id`
- Działa zarówno przy INSERT, jak i UPDATE (zapobiega zmianie `user_id` na innego użytkownika)
- `SECURITY DEFINER` zapewnia dostęp do `auth.uid()` w kontekście triggera

## 7. Operacje na danych

### 7.1 System powtórek w losowej kolejności

**Zapytanie do pobrania fiszek w losowej kolejności:**

```sql
SELECT id, source_text, translation
FROM flashcards
WHERE user_id = auth.uid()
ORDER BY RANDOM();
```

**Uwagi:**
- `ORDER BY RANDOM()` zapewnia losową kolejność przy każdym zapytaniu
- Indeks na `user_id` optymalizuje filtrowanie
- Losowa kolejność jest generowana na poziomie bazy danych
- Brak osobnej tabeli do śledzenia sesji powtórek - zgodnie z wymaganiami MVP

### 7.2 Usuwanie fiszek

**Operacja:** Hard delete (fizyczne usunięcie z bazy)

```sql
DELETE FROM flashcards
WHERE id = :flashcard_id AND user_id = auth.uid();
```

**Uwagi:**
- Fiszki są trwale usuwane z bazy danych
- Brak soft delete (brak pola `deleted_at`) - zgodnie z wymaganiami MVP
- RLS zapewnia, że użytkownik może usuwać tylko swoje fiszki

### 7.3 Tworzenie fiszki

```sql
INSERT INTO flashcards (source_text, translation)
VALUES (:source_text, :translation);
```

**Uwagi:**
- `user_id` jest automatycznie ustawiane przez trigger
- Walidacja długości `source_text` jest wykonywana przez CHECK constraint
- `translation` może być NULL

### 7.4 Aktualizacja fiszki

```sql
UPDATE flashcards
SET source_text = :source_text,
    translation = :translation
WHERE id = :flashcard_id AND user_id = auth.uid();
```

**Uwagi:**
- Trigger automatycznie aktualizuje `user_id` (zapobiega zmianie właściciela)
- CHECK constraint waliduje długość `source_text`
- RLS zapewnia, że użytkownik może aktualizować tylko swoje fiszki

## 8. Normalizacja

### 8.1 Poziom normalizacji

Schemat jest znormalizowany do **3NF (Third Normal Form)**:

- **1NF:** Wszystkie wartości są atomowe (brak powtarzających się grup)
- **2NF:** Tabela jest w 1NF i wszystkie kolumny niebędące kluczem są w pełni zależne od klucza głównego
- **3NF:** Tabela jest w 2NF i nie ma zależności przechodnich

### 8.2 Uzasadnienie braku denormalizacji

- Prosta struktura danych nie wymaga denormalizacji
- Brak złożonych zapytań, które mogłyby skorzystać z denormalizacji
- Wydajność jest zapewniona przez odpowiednie indeksy
- Zgodnie z zasadą YAGNI (You Aren't Gonna Need It) - MVP nie wymaga zaawansowanych optymalizacji

## 9. Skalowalność i wydajność

### 9.1 Optymalizacje dla dużych wolumenów danych

#### 9.1.1 Indeksy
- Indeks na `user_id` zapewnia szybkie filtrowanie po użytkowniku
- PRIMARY KEY na `id` optymalizuje wyszukiwania po identyfikatorze

#### 9.1.2 Losowa kolejność
- `ORDER BY RANDOM()` może być kosztowne dla dużych zbiorów danych
- **Rekomendacja:** Rozważyć cache'owanie losowej kolejności w sesji frontendowej dla dużych kolekcji fiszek
- Alternatywnie: użycie `TABLESAMPLE` dla bardzo dużych zbiorów (opcjonalnie, poza MVP)

### 9.2 Limity i ograniczenia

- **Maksymalna długość `source_text`:** 200 znaków (CHECK constraint)
- **Brak limitów na liczbę fiszek:** Zgodnie z PRD, brak limitów na liczbę fiszek
- **Typ danych `translation`:** TEXT (bez limitu długości) - pozwala na długie translacje

## 10. Bezpieczeństwo

### 10.1 Warstwy bezpieczeństwa

1. **Row Level Security (RLS):** Główna warstwa kontroli dostępu
2. **Triggers:** Automatyczne ustawienie `user_id` zapobiega manipulacji
3. **CHECK constraints:** Walidacja danych na poziomie bazy
4. **Foreign Key constraints:** Integralność referencyjna

### 10.2 Ochrona przed atakami

- **SQL Injection:** Zapobieganie przez parametryzowane zapytania (Supabase SDK)
- **Unauthorized Access:** RLS zapewnia, że użytkownicy widzą tylko swoje dane
- **Data Manipulation:** Trigger zapobiega zmianie `user_id` przez użytkownika

## 11. Kompatybilność z Supabase

### 11.1 Wykorzystanie funkcji Supabase

- **`auth.users`:** Wbudowana tabela Supabase Auth
- **`auth.uid()`:** Funkcja Supabase zwracająca UUID zalogowanego użytkownika
- **RLS:** Wspierane natywnie przez Supabase
- **UUID:** Standardowy typ danych w Supabase

### 11.2 Migracje

Schemat może być wdrożony jako migracja Supabase:

```sql
-- Migracja powinna zawierać TYLKO następujące elementy:
-- UWAGA: Tabela auth.users jest zarządzana przez Supabase Auth
-- i NIE wymaga tworzenia w migracji!

-- 1. CREATE TABLE flashcards
-- 2. CREATE INDEX idx_flashcards_user_id
-- 3. ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY
-- 4. CREATE POLICY dla SELECT, INSERT, UPDATE, DELETE
-- 5. CREATE FUNCTION set_flashcards_user_id
-- 6. CREATE TRIGGER set_flashcards_user_id
```

**Ważne:**
- Tabela `auth.users` jest automatycznie dostępna w Supabase i **nie wymaga** tworzenia w migracji
- Supabase Auth automatycznie zarządza strukturą i danymi w `auth.users`
- Nasze migracje dotyczą wyłącznie tabeli `flashcards` i powiązanych obiektów (indeksy, polityki RLS, triggery)

## 12. Uwagi implementacyjne

### 12.1 Pola wykluczone z MVP

Zgodnie z notatkami z sesji i PRD, następujące pola są **celowo wykluczone** z MVP:

- `created_at` - Brak wymagań dotyczących śledzenia czasu utworzenia
- `updated_at` - Brak wymagań dotyczących śledzenia czasu aktualizacji
- `source_language` - Użytkownik określa język ręcznie w UI, ale nie jest przechowywany
- `target_language` - Użytkownik określa język ręcznie w UI, ale nie jest przechowywany
- `deleted_at` - Hard delete w MVP, brak soft delete

### 12.2 Rozszerzenia w przyszłości

Potencjalne rozszerzenia schematu (poza MVP):

- Tabela `flashcard_sets` - organizacja fiszek w zestawy
- Tabela `tags` - tagowanie fiszek
- Tabela `study_sessions` - śledzenie sesji nauki
- Pola `source_language`, `target_language` - jeśli wymagane w przyszłości
- Pola `created_at`, `updated_at` - dla audytu i statystyk
- Soft delete (`deleted_at`) - jeśli wymagane w przyszłości

## 13. Podsumowanie

### 13.1 Struktura schematu

- **1 tabela biznesowa:** `flashcards` (wymaga utworzenia w migracji)
- **1 tabela referencyjna:** `auth.users` (zarządzana przez Supabase Auth, **nie wymaga** tworzenia)
- **1 indeks:** `idx_flashcards_user_id`
- **4 polityki RLS:** SELECT, INSERT, UPDATE, DELETE
- **1 trigger:** Automatyczne ustawienie `user_id`
- **1 funkcja:** `set_flashcards_user_id()`

**Uwaga:** Tabela `auth.users` jest w pełni obsługiwana przez Supabase Auth i nie jest częścią naszych migracji bazy danych.

### 13.2 Kluczowe decyzje projektowe

1. **Prosta struktura:** Jedna tabela biznesowa dla MVP
2. **Bezpieczeństwo:** RLS + trigger dla podwójnej ochrony
3. **Wydajność:** Indeks na `user_id` dla optymalizacji zapytań
4. **Walidacja:** CHECK constraint na długość tekstu
5. **Hard delete:** Trwałe usuwanie fiszek (brak soft delete)

### 13.3 Zgodność z wymaganiami

- ✅ Wszystkie wymagania z PRD są spełnione
- ✅ Wszystkie decyzje z notatek z sesji są zaimplementowane
- ✅ Schemat jest zoptymalizowany pod kątem Supabase
- ✅ Zgodność z najlepszymi praktykami PostgreSQL

