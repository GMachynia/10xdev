# Testy Integracyjne API

## Przegląd

Testy integracyjne sprawdzają interakcję między warstwami aplikacji (API endpoints + services + database).

## Konfiguracja

Testy integracyjne wymagają lokalnej instancji Supabase. Aby uruchomić testy:

1. Zainstaluj Supabase CLI:
```bash
npm install -g supabase
```

2. Uruchom lokalną instancję Supabase:
```bash
supabase start
```

3. Uruchom migracje:
```bash
supabase db reset
```

4. Uruchom testy:
```bash
npm run test:integration
```

## Struktura testów

- `api/` - Testy endpointów API
- `auth/` - Testy autoryzacji i autentykacji
- `database/` - Testy polityk RLS i triggers

## Scenariusze testowe

### API Flashcards

#### GET /api/flashcards
- [ ] Powinien zwrócić listę fiszek dla zalogowanego użytkownika
- [ ] Powinien zwrócić 401 dla niezalogowanego użytkownika
- [ ] Powinien filtrować fiszki według użytkownika (RLS)
- [ ] Powinien obsługiwać parametr `order=id`
- [ ] Powinien obsługiwać parametr `order=random`
- [ ] Powinien obsługiwać parametr `limit`
- [ ] Powinien obsługiwać parametr `offset`
- [ ] Powinien zwrócić błąd dla nieprawidłowych parametrów

#### POST /api/flashcards
- [ ] Powinien utworzyć fiszkę dla zalogowanego użytkownika
- [ ] Powinien zwrócić 401 dla niezalogowanego użytkownika
- [ ] Powinien automatycznie ustawić `user_id` (trigger)
- [ ] Powinien walidować długość `source_text` (max 200)
- [ ] Powinien walidować wymagane pole `source_text`
- [ ] Powinien obsługiwać opcjonalne pole `translation`
- [ ] Powinien zwrócić błąd dla nieprawidłowych danych

#### PATCH /api/flashcards/:id
- [ ] Powinien zaktualizować fiszkę użytkownika
- [ ] Powinien zwrócić 401 dla niezalogowanego użytkownika
- [ ] Powinien zwrócić 404 dla fiszki innego użytkownika (RLS)
- [ ] Powinien walidować UUID
- [ ] Powinien walidować długość `source_text`
- [ ] Powinien obsługiwać częściowe aktualizacje

#### DELETE /api/flashcards/:id
- [ ] Powinien usunąć fiszkę użytkownika
- [ ] Powinien zwrócić 401 dla niezalogowanego użytkownika
- [ ] Powinien zwrócić 404 dla fiszki innego użytkownika (RLS)
- [ ] Powinien walidować UUID

### Autoryzacja

#### POST /api/auth/login
- [ ] Powinien zalogować użytkownika z prawidłowymi danymi
- [ ] Powinien zwrócić błąd dla nieprawidłowych danych
- [ ] Powinien ustawić sesję w cookie

#### POST /api/auth/register
- [ ] Powinien zarejestrować nowego użytkownika
- [ ] Powinien zwrócić błąd dla istniejącego emaila
- [ ] Powinien walidować format emaila
- [ ] Powinien walidować długość hasła

### Row Level Security (RLS)

#### Polityki SELECT
- [ ] Użytkownik powinien widzieć tylko swoje fiszki
- [ ] Użytkownik anonimowy nie powinien widzieć żadnych fiszek (bez `anon` policy)

#### Polityki INSERT
- [ ] Użytkownik powinien móc tworzyć fiszki
- [ ] `user_id` powinien być automatycznie ustawiany (trigger)

#### Polityki UPDATE
- [ ] Użytkownik powinien móc edytować tylko swoje fiszki
- [ ] Użytkownik nie powinien móc zmienić `user_id`

#### Polityki DELETE
- [ ] Użytkownik powinien móc usuwać tylko swoje fiszki

## Metryki

Cel: 100% pokrycia krytycznych ścieżek integracyjnych

## Uwagi

- Testy integracyjne są wolniejsze niż testy jednostkowe
- Każdy test powinien czyścić dane po sobie
- Używaj transakcji lub `beforeEach`/`afterEach` do resetowania stanu
- Testy powinny być izolowane i niezależne od siebie

