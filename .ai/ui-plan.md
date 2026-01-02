# Architektura UI dla Aplikacji Fiszki Edukacyjne z AI

## 1. Przegląd struktury UI

Aplikacja Fiszki Edukacyjne z AI to aplikacja webowa z responsywnym designem, umożliwiająca szybkie tworzenie fiszek edukacyjnych poprzez wklejanie tekstu i interaktywny wybór zakresu treści. Architektura UI została zaprojektowana w oparciu o wymagania PRD, plan API i decyzje z sesji planowania.

### Główne założenia architektoniczne:
- **Separacja widoków**: Osobne widoki dla tworzenia (`/create`) i przeglądania (`/study`) fiszek, umożliwiające łatwe przełączanie przez nawigację
- **Tryb powtórek jako funkcja widoku**: Sesja powtórek jest trybem w widoku przeglądania, nie osobnym widokiem
- **Warstwa abstrakcji API**: Komponenty React komunikują się z Astro API routes, nie bezpośrednio z Supabase
- **Optimistic updates**: Natychmiastowa aktualizacja UI dla operacji edycji i usuwania, z możliwością cofnięcia w razie błędu
- **Pobieranie wszystkich danych**: W MVP wszystkie fiszki są pobierane na początku bez paginacji, zarządzane lokalnie w stanie React
- **Responsywność i dostępność**: Pełna obsługa urządzeń mobilnych, klawiatury i czytników ekranu

### Stack technologiczny:
- **Framework**: Astro 5 z React 19 dla komponentów dynamicznych
- **Stylowanie**: Tailwind CSS 4
- **Komponenty UI**: Shadcn/ui
- **Backend**: Astro API routes jako warstwa abstrakcji nad Supabase

## 2. Lista widoków

### 2.1 Strona główna / Strona logowania (`/`)

**Główny cel:** Punkt wejścia dla użytkowników niezalogowanych, prezentacja aplikacji i możliwość logowania.

**Kluczowe informacje do wyświetlenia:**
- Nazwa aplikacji i krótki opis funkcjonalności
- Formularz logowania (login i hasło)
- Link do strony rejestracji
- Informacja o wymaganiu logowania do korzystania z aplikacji

**Kluczowe komponenty widoku:**
- Shadcn/ui Card dla kontenera formularza logowania
- Shadcn/ui Input dla pól login i hasło
- Shadcn/ui Button dla przycisku logowania
- Shadcn/ui Alert dla komunikatów błędów walidacji i błędów logowania
- Link do strony rejestracji

**UX, dostępność i względy bezpieczeństwa:**
- **UX**: Prosty, minimalistyczny formularz zgodny z wymaganiami PRD (tylko login i hasło)
- **Dostępność**: Proper labels dla pól formularza, error messages powiązane z polami, focus management, obsługa klawiatury (Enter do logowania)
- **Bezpieczeństwo**: Walidacja po stronie klienta (pola nie mogą być puste), komunikaty błędów nie ujawniają szczegółów (np. "Nieprawidłowy login lub hasło" zamiast informacji, które pole jest nieprawidłowe)
- **Przekierowanie**: Po pomyślnym logowaniu przekierowanie do widoku przeglądania (`/study`)

**Mapowanie historyjek użytkownika:**
- US-002: Logowanie użytkownika
- US-016: Walidacja danych logowania
- US-022: Dostęp do aplikacji bez logowania

### 2.2 Strona rejestracji (`/register`)

**Główny cel:** Rejestracja nowego konta użytkownika z minimalnym formularzem (tylko login i hasło).

**Kluczowe informacje do wyświetlenia:**
- Formularz rejestracji z polami: login (min. 3 znaki) i hasło (min. 6 znaków)
- Komunikaty walidacji w czasie rzeczywistym
- Link do strony logowania
- Informacja o braku weryfikacji email (zgodnie z PRD)

**Kluczowe komponenty widoku:**
- Shadcn/ui Card dla kontenera formularza
- Shadcn/ui Input dla pól login i hasło
- Shadcn/ui Button dla przycisku rejestracji
- Shadcn/ui Alert dla komunikatów błędów walidacji (za krótki login/hasło, login zajęty)
- Licznik znaków dla pól (opcjonalnie, dla lepszego UX)

**UX, dostępność i względy bezpieczeństwa:**
- **UX**: Minimalistyczny formularz zgodny z PRD, walidacja w czasie rzeczywistym, natychmiastowe komunikaty błędów
- **Dostępność**: Proper labels, error messages powiązane z polami, focus management, obsługa klawiatury
- **Bezpieczeństwo**: Walidacja po stronie klienta (min. długości), walidacja po stronie serwera (unikalność loginu), komunikaty błędów nie ujawniają szczegółów bezpieczeństwa
- **Automatyczne logowanie**: Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do widoku przeglądania

**Mapowanie historyjek użytkownika:**
- US-001: Rejestracja nowego użytkownika
- US-017: Walidacja danych rejestracji

### 2.3 Widok tworzenia fiszek (`/create`)

**Główny cel:** Tworzenie nowych fiszek poprzez wklejanie tekstu (max 200 znaków) i interaktywny wybór zakresu treści (cały tekst lub pojedyncze słowa).

**Kluczowe informacje do wyświetlenia:**
- Pole tekstowe do wklejania tekstu źródłowego (max 200 znaków)
- Licznik znaków (aktualna liczba / 200)
- Interaktywny obszar wyświetlania tekstu z klikalnymi słowami
- Formularz tworzenia fiszki z wybranym tekstem i opcjonalnym polem translacji
- Przycisk "Accept" do zapisania fiszki
- Komunikaty sukcesu/błędu po zapisaniu

**Kluczowe komponenty widoku:**
- Shadcn/ui Textarea dla pola tekstowego źródłowego (max-w-2xl, mx-auto, p-4)
- Interaktywny obszar wyboru słów (flex flex-wrap gap-2, p-4, rounded-lg border) - każde słowo jako klikalny element
- Shadcn/ui Button "Utwórz fiszkę z całego tekstu" dla opcji wyboru całego tekstu
- Shadcn/ui Dialog lub inline formularz dla dodania translacji po wyborze słowa/tekstu
- Shadcn/ui Input lub Textarea dla pola translacji (opcjonalne)
- Shadcn/ui Button "Accept" (variant: "default") z disabled state podczas loading
- Shadcn/ui Skeleton/Spinner podczas zapisywania
- Shadcn/ui Toast/Alert dla komunikatów sukcesu (variant: "success") i błędów (variant: "destructive")
- Shadcn/ui Alert dla błędów walidacji (np. tekst zbyt długi)

**UX, dostępność i względy bezpieczeństwa:**
- **UX**: 
  - Tekst źródłowy pozostaje w polu po zapisaniu fiszki, umożliwiając tworzenie wielu fiszek z tego samego tekstu
  - Wizualne wyróżnienie wybranych słów (np. podświetlenie, zmiana koloru tła)
  - Natychmiastowa walidacja długości tekstu (przed wklejeniem i podczas wpisywania)
  - Licznik znaków widoczny dla użytkownika
- **Dostępność**: 
  - Proper labels dla wszystkich pól formularza
  - Obsługa klawiatury (Tab do nawigacji, Enter do akceptacji)
  - Aria-labels dla interaktywnych elementów (słowa)
  - Focus management podczas otwierania formularza translacji
- **Bezpieczeństwo**: 
  - Walidacja po stronie klienta (max 200 znaków dla source_text)
  - Trim whitespace przed walidacją
  - Sanityzacja danych przed wysłaniem do API
- **Integracja z API**: 
  - POST /api/flashcards po kliknięciu "Accept"
  - Czekanie na odpowiedź API przed aktualizacją UI (potrzebne ID fiszki)
  - Obsługa błędów walidacji (400) i błędów serwera (500)

**Mapowanie historyjek użytkownika:**
- US-004: Wklejanie tekstu do tworzenia fiszek
- US-005: Tworzenie fiszki z całego tekstu
- US-006: Tworzenie fiszki z pojedynczego słowa
- US-007: Tworzenie wielu fiszek z różnych słów
- US-014: Walidacja długości tekstu
- US-015: Obsługa błędów API
- US-020: Tworzenie fiszki bez translacji

**Przypadki brzegowe:**
- Tekst dłuższy niż 200 znaków: wyświetlenie komunikatu błędu, blokada zapisu
- Puste pole tekstowe: wyłączenie przycisku "Accept" lub opcji wyboru całego tekstu
- Brak wyboru słowa/tekstu: wyłączenie przycisku "Accept"
- Błąd sieci podczas zapisu: wyświetlenie komunikatu błędu z możliwością ponowienia próby
- Tekst zawierający tylko białe znaki: walidacja i odrzucenie

### 2.4 Widok przeglądania i powtórek (`/study`)

**Główny cel:** Przeglądanie fiszek w formie kart z efektem obrotu, nawigacja między fiszkami oraz sesja powtórek w losowej kolejności.

**Kluczowe informacje do wyświetlenia:**
- Lista wszystkich fiszek użytkownika (pobierana na początku)
- Karta z awersem (tekst źródłowy) i rewersem (translacja)
- Licznik statystyk (liczba wszystkich fiszek) - opcjonalnie z endpointu /api/flashcards/count
- Tryb przeglądania (order=id) lub tryb powtórek (order=random)
- Licznik postępu sesji powtórek (aktualna fiszka / wszystkie fiszki)
- Komunikat o zakończeniu cyklu powtórek
- Przyciski do edycji i usuwania fiszek

**Kluczowe komponenty widoku:**
- Shadcn/ui Card dla wyświetlania kart fiszek (max-w-md mx-auto w-full sm:w-96, aspect-[3/4])
- Shadcn/ui Tabs lub ToggleGroup dla przełączania między trybem przeglądania a powtórek
- Shadcn/ui Button "Rozpocznij sesję powtórek" (w-full sm:w-auto) dla aktywacji trybu powtórek
- Shadcn/ui Badge lub Card dla statystyki liczby fiszek (p-4, rounded-lg, border)
- Shadcn/ui Dialog dla formularza edycji fiszki (max-w-md mx-auto) z Input i Textarea
- Shadcn/ui Button z ikonami (lucide-react) dla edycji i usuwania
- Shadcn/ui AlertDialog dla potwierdzenia usunięcia
- Shadcn/ui Alert dla komunikatu o zakończeniu cyklu powtórek
- Shadcn/ui Button z ikonami ChevronLeft/ChevronRight (lucide-react) jako fallback nawigacji dla użytkowników bez obsługi dotyku
- Shadcn/ui Skeleton podczas ładowania listy fiszek
- Shadcn/ui Alert (variant: "destructive") dla błędów API
- Shadcn/ui Card (p-8 text-center) dla empty state z tekstem "Nie masz jeszcze fiszek" i Button linkiem do /create

**Efekt obrotu karty:**
- Tailwind CSS transforms (transform-gpu, perspective-1000, rotate-y-180) z transitions (transition-transform duration-500 ease-in-out)
- Shadcn/ui Card jako kontener
- Kliknięcie w kartę lub naciśnięcie Enter powoduje obrót
- Awers: tekst źródłowy
- Rewers: translacja lub "Brak translacji" jeśli translation jest null

**Swipe gestures:**
- react-swipeable lub Hammer.js dla obsługi gestów
- Tailwind classes (touch-pan-x, select-none)
- Przesunięcie w lewo/prawo powoduje nawigację do następnej/poprzedniej fiszki
- Fallback na przyciski nawigacyjne (ChevronLeft/ChevronRight) dla użytkowników bez obsługi dotyku

**Tryby widoku:**
- **Tryb przeglądania (domyślny)**: 
  - GET /api/flashcards?order=id
  - Fiszki wyświetlane w kolejności według ID
  - Możliwość nawigacji przez wszystkie fiszki
- **Tryb powtórek**: 
  - GET /api/flashcards?order=random
  - Fiszki wyświetlane w losowej kolejności
  - Lokalny stan sesji (aktualna fiszka, pozostałe fiszki, zakończone fiszki)
  - Licznik postępu (flex items-center gap-2, text-sm text-muted-foreground)
  - Po przejściu przez wszystkie fiszki: wyświetlenie Alert z komunikatem "Przeszedłeś przez wszystkie fiszki" i możliwością rozpoczęcia nowego cyklu
  - Nowy cykl: ponowne pobranie z order=random

**UX, dostępność i względy bezpieczeństwa:**
- **UX**: 
  - Płynne animacje obrotu karty i nawigacji
  - Optimistic updates dla edycji i usuwania (natychmiastowa aktualizacja UI)
  - W razie błędu API: cofnięcie zmian i wyświetlenie komunikatu błędu
  - Cykliczna nawigacja lub komunikat o zakończeniu (w zależności od trybu)
- **Dostępność**: 
  - Aria-labels dla kart ("Fiszka {numer}, tekst źródłowy: {tekst}")
  - Obsługa klawiatury: strzałki lewo/prawo do nawigacji, Enter do obrotu karty, Escape do zamknięcia dialogów
  - Focus management podczas otwierania dialogów edycji
  - Proper labels dla wszystkich formularzy
  - Fallback na przyciski nawigacyjne dla użytkowników bez obsługi dotyku
- **Bezpieczeństwo**: 
  - Walidacja po stronie klienta przed wysłaniem żądania edycji (max 200 znaków)
  - Potwierdzenie przed usunięciem (hard delete, brak możliwości przywrócenia)
  - Optimistic updates z możliwością cofnięcia w razie błędu
- **Integracja z API**: 
  - GET /api/flashcards?order=id|random na początku i przy przełączaniu trybów
  - GET /api/flashcards/count dla statystyki (opcjonalnie)
  - PATCH /api/flashcards/:id dla edycji (optimistic update)
  - DELETE /api/flashcards/:id dla usuwania (optimistic update)
  - Obsługa błędów 400, 401, 404, 500

**Mapowanie historyjek użytkownika:**
- US-008: Wyświetlanie fiszek jako karty
- US-009: Obrót karty i wyświetlanie translacji
- US-010: Przesuwanie kart na bok (swipe)
- US-011: System powtórek w losowej kolejności
- US-012: Edycja treści i translacji fiszki
- US-013: Usuwanie fiszki
- US-015: Obsługa błędów API
- US-018: Przechowywanie fiszek na koncie użytkownika
- US-021: Reset cyklu powtórek

**Przypadki brzegowe:**
- Brak fiszek (empty state): wyświetlenie Card z komunikatem i linkiem do /create
- Błąd podczas pobierania fiszek: wyświetlenie Alert z przyciskiem "Spróbuj ponownie"
- Błąd podczas edycji: cofnięcie optimistic update, wyświetlenie komunikatu błędu
- Błąd podczas usuwania: przywrócenie fiszki w UI, wyświetlenie komunikatu błędu
- Zakończenie cyklu powtórek: wyświetlenie Alert z możliwością rozpoczęcia nowego cyklu
- Fiszka bez translacji: wyświetlenie "Brak translacji" na rewersie
- Sesja powtórek przerwana: stan sesji tylko w pamięci komponentu (nie zapisywany w localStorage w MVP)

### 2.5 Header / Nawigacja (komponent globalny)

**Główny cel:** Globalna nawigacja między widokami i opcje użytkownika (wylogowanie).

**Kluczowe informacje do wyświetlenia:**
- Logo/nazwa aplikacji (link do strony głównej)
- Linki do głównych widoków: "Tworzenie" (/create), "Przeglądanie" (/study)
- Informacja o zalogowanym użytkowniku (opcjonalnie)
- Przycisk wylogowania

**Kluczowe komponenty:**
- Shadcn/ui Button dla linków nawigacyjnych
- Shadcn/ui Button dla wylogowania
- Responsywny layout (hamburger menu na mobile, poziome menu na desktop)

**UX, dostępność i względy bezpieczeństwa:**
- **UX**: 
  - Wyraźne oznaczenie aktywnego widoku (np. podświetlenie linku)
  - Responsywny design (hamburger menu na mobile)
- **Dostępność**: 
  - Proper aria-labels dla linków
  - Obsługa klawiatury (Tab do nawigacji)
- **Bezpieczeństwo**: 
  - Wylogowanie kończy sesję użytkownika
  - Przekierowanie do strony logowania po wylogowaniu

**Mapowanie historyjek użytkownika:**
- US-003: Wylogowanie użytkownika
- US-022: Dostęp do aplikacji bez logowania

**Przypadki brzegowe:**
- Użytkownik niezalogowany: ukrycie linków do chronionych widoków, wyświetlenie tylko linku do logowania
- Błąd podczas wylogowania: wyświetlenie komunikatu błędu, możliwość ponowienia próby

## 3. Mapa podróży użytkownika

### 3.1 Podróż nowego użytkownika (rejestracja i pierwsze użycie)

1. **Wejście na stronę główną** (`/`)
   - Użytkownik widzi stronę logowania
   - Kliknięcie linku "Zarejestruj się" → przekierowanie do `/register`

2. **Rejestracja** (`/register`)
   - Wypełnienie formularza (login min. 3 znaki, hasło min. 6 znaków)
   - Walidacja w czasie rzeczywistym
   - Kliknięcie "Zarejestruj się"
   - Automatyczne logowanie i przekierowanie do `/study`

3. **Pierwsze użycie** (`/study`)
   - Empty state: "Nie masz jeszcze fiszek"
   - Kliknięcie linku "Utwórz pierwszą fiszkę" → przekierowanie do `/create`

4. **Tworzenie pierwszej fiszki** (`/create`)
   - Wklejenie tekstu (max 200 znaków)
   - Wybór słowa lub całego tekstu
   - Dodanie translacji (opcjonalnie)
   - Kliknięcie "Accept"
   - Sukces: Toast z potwierdzeniem, tekst pozostaje w polu
   - Powrót do `/study` przez nawigację lub kontynuacja tworzenia kolejnych fiszek

### 3.2 Podróż zalogowanego użytkownika (codzienne użycie)

1. **Wejście na stronę główną** (`/`)
   - Jeśli niezalogowany: wyświetlenie formularza logowania
   - Jeśli zalogowany: przekierowanie do `/study` (lub ostatnio odwiedzany widok)

2. **Logowanie** (`/`)
   - Wypełnienie formularza (login i hasło)
   - Kliknięcie "Zaloguj się"
   - Przekierowanie do `/study`

3. **Przeglądanie fiszek** (`/study`)
   - Pobranie wszystkich fiszek (GET /api/flashcards?order=id)
   - Wyświetlenie kart z efektem obrotu
   - Nawigacja między fiszkami (swipe/przyciski/klawiatura)
   - Obrót karty (kliknięcie/Enter) → wyświetlenie translacji

4. **Sesja powtórek** (`/study` - tryb powtórek)
   - Kliknięcie "Rozpocznij sesję powtórek"
   - Pobranie fiszek w losowej kolejności (GET /api/flashcards?order=random)
   - Nawigacja przez fiszki w losowej kolejności
   - Licznik postępu (aktualna / wszystkie)
   - Po zakończeniu: Alert z możliwością nowego cyklu

5. **Tworzenie nowych fiszek** (`/create`)
   - Przejście z `/study` przez nawigację
   - Wklejenie tekstu
   - Wybór słów/tekstu i dodanie translacji
   - Kliknięcie "Accept"
   - Powrót do `/study` lub kontynuacja tworzenia

6. **Edycja fiszki** (`/study`)
   - Kliknięcie przycisku edycji na karcie
   - Otwarcie Dialog z formularzem
   - Zmiana treści źródłowej i/lub translacji
   - Kliknięcie "Zapisz"
   - Optimistic update: natychmiastowa aktualizacja UI
   - W razie błędu: cofnięcie zmian, wyświetlenie komunikatu

7. **Usuwanie fiszki** (`/study`)
   - Kliknięcie przycisku usuwania
   - Potwierdzenie w AlertDialog
   - Optimistic update: natychmiastowe usunięcie z UI
   - W razie błędu: przywrócenie fiszki, wyświetlenie komunikatu

8. **Wylogowanie**
   - Kliknięcie przycisku wylogowania w headerze
   - Zakończenie sesji
   - Przekierowanie do `/`

### 3.3 Kluczowe interakcje użytkownika

**Tworzenie fiszki z całego tekstu:**
1. Wklejenie tekstu w `/create`
2. Kliknięcie "Utwórz fiszkę z całego tekstu"
3. Otwarcie formularza z całym tekstem jako source_text
4. Dodanie translacji (opcjonalnie)
5. Kliknięcie "Accept"
6. Zapisywanie przez POST /api/flashcards
7. Tekst pozostaje w polu, możliwość tworzenia kolejnych fiszek

**Tworzenie fiszki z pojedynczego słowa:**
1. Wklejenie tekstu w `/create`
2. Kliknięcie na słowo w interaktywnym obszarze
3. Wizualne wyróżnienie słowa
4. Otwarcie formularza z wybranym słowem jako source_text
5. Dodanie translacji (opcjonalnie)
6. Kliknięcie "Accept"
7. Zapisywanie przez POST /api/flashcards
8. Słowo pozostaje klikalne, możliwość utworzenia kolejnej fiszki z tego samego słowa

**Nawigacja między fiszkami:**
1. W `/study` wyświetlenie karty z awersem (tekst źródłowy)
2. Swipe w lewo/prawo lub kliknięcie przycisków nawigacyjnych → następna/poprzednia fiszka
3. Kliknięcie w kartę lub naciśnięcie Enter → obrót karty, wyświetlenie rewersu (translacja)
4. Ponowne kliknięcie/Enter → powrót do awersu

**Sesja powtórek:**
1. W `/study` kliknięcie "Rozpocznij sesję powtórek"
2. Pobranie fiszek w losowej kolejności
3. Nawigacja przez fiszki w losowej kolejności
4. Licznik postępu aktualizuje się przy każdej fiszce
5. Po przejściu przez wszystkie: Alert "Przeszedłeś przez wszystkie fiszki"
6. Kliknięcie "Rozpocznij nowy cykl" → nowa losowa kolejność

## 4. Układ i struktura nawigacji

### 4.1 Struktura nawigacji globalnej (Header)

Header jest widoczny na wszystkich widokach (z wyjątkiem strony logowania/rejestracji, gdzie może być uproszczony).

**Elementy nawigacji:**
- **Logo/Nazwa aplikacji** (lewa strona): Link do strony głównej (`/`)
- **Linki główne** (środek, desktop):
  - "Tworzenie" → `/create`
  - "Przeglądanie" → `/study`
- **Menu użytkownika** (prawa strona):
  - Informacja o zalogowanym użytkowniku (opcjonalnie, tylko na desktop)
  - Przycisk "Wyloguj"

**Responsywność:**
- **Desktop**: Poziome menu z wszystkimi linkami
- **Mobile**: Hamburger menu (Shadcn/ui Sheet lub podobny) z linkami w menu rozwijanym

**Aktywny widok:**
- Wyraźne oznaczenie aktywnego widoku (np. podświetlenie linku, zmiana koloru, underline)

### 4.2 Nawigacja między widokami

**Przepływ podstawowy:**
```
/ (logowanie) ↔ /register (rejestracja)
     ↓ (po zalogowaniu)
/study (przeglądanie) ↔ /create (tworzenie)
```

**Ochrona widoków:**
- Widoki `/create` i `/study` wymagają logowania
- Próba dostępu bez logowania → przekierowanie do `/` z komunikatem
- Po zalogowaniu → przekierowanie do żądanego widoku (jeśli był zapamiętany)

**Nawigacja kontekstowa:**
- Empty state w `/study` zawiera link do `/create`
- Sukces w `/create` może zawierać link do `/study` (opcjonalnie)
- Dialogi edycji w `/study` nie wymagają nawigacji (są modalne)

### 4.3 Nawigacja wewnątrz widoków

**Widok `/create`:**
- Nawigacja wewnątrz widoku nie jest potrzebna (jeden ekran z formularzem)

**Widok `/study`:**
- **Nawigacja między fiszkami:**
  - Swipe gestures (lewo/prawo)
  - Przyciski nawigacyjne (ChevronLeft/ChevronRight)
  - Klawiatura (strzałki lewo/prawo)
  - Cykliczna nawigacja lub komunikat o zakończeniu (w zależności od trybu)
- **Przełączanie trybów:**
  - Tabs lub ToggleGroup dla przełączania między trybem przeglądania a powtórek
  - Przycisk "Rozpocznij sesję powtórek" aktywuje tryb powtórek

## 5. Kluczowe komponenty

### 5.1 Komponenty Shadcn/ui używane globalnie

**Button:**
- Używany dla wszystkich akcji (Accept, Zapisz, Usuń, Nawigacja, Logowanie, Rejestracja)
- Różne warianty: "default" dla akcji głównych, "destructive" dla usuwania, "outline" dla akcji drugorzędnych
- Disabled state podczas loading
- Responsywność: w-full sm:w-auto dla przycisków w formularzach

**Card:**
- Kontener dla kart fiszek (z efektem obrotu)
- Kontener dla formularzy (logowanie, rejestracja)
- Kontener dla statystyk
- Kontener dla empty state
- Responsywność: max-w-md mx-auto w-full sm:w-96 dla kart fiszek

**Input / Textarea:**
- Pola formularzy (logowanie, rejestracja, tworzenie fiszek, edycja)
- Walidacja w czasie rzeczywistym
- Proper labels i error messages
- Licznik znaków dla pól z limitem (source_text)

**Dialog:**
- Formularz edycji fiszki
- Potwierdzenie usunięcia (AlertDialog)
- Focus management i obsługa klawiatury (Escape do zamknięcia)

**Alert:**
- Komunikaty błędów (variant: "destructive")
- Komunikaty sukcesu (variant: "success" lub custom z klasami Tailwind)
- Komunikaty informacyjne (zakończenie sesji powtórek)
- Przycisk "Spróbuj ponownie" dla błędów API

**Toast:**
- Notyfikacje sukcesu/błędu (mniej inwazyjne niż Alert)
- Automatyczne znikanie po kilku sekundach
- Możliwość zamknięcia ręcznego

**Skeleton / Spinner:**
- Placeholder podczas ładowania danych
- Wskaźnik ładowania podczas operacji (zapisywanie, edycja, usuwanie)

**Badge:**
- Statystyki (liczba fiszek)
- Oznaczenia statusu (opcjonalnie)

**Tabs / ToggleGroup:**
- Przełączanie między trybem przeglądania a powtórek w `/study`

### 5.2 Komponenty custom (React)

**FlashcardCard:**
- Karta fiszki z efektem obrotu
- Awers: tekst źródłowy
- Rewers: translacja lub "Brak translacji"
- Obsługa kliknięcia (obrót), swipe gestures, klawiatury
- Przyciski edycji i usuwania
- Aria-labels i focus management

**InteractiveTextArea:**
- Pole tekstowe z interaktywnym obszarem wyboru słów
- Parser tekstu (rozdzielenie na słowa)
- Wizualne wyróżnienie wybranych słów
- Obsługa kliknięcia na słowa
- Przycisk "Utwórz fiszkę z całego tekstu"

**StudySession:**
- Zarządzanie sesją powtórek
- Lokalny stan (aktualna fiszka, pozostałe, zakończone)
- Licznik postępu
- Obsługa zakończenia cyklu
- Integracja z API (GET /api/flashcards?order=random)

**FlashcardForm:**
- Formularz tworzenia/edycji fiszki
- Walidacja (max 200 znaków dla source_text)
- Pole translacji (opcjonalne)
- Przycisk "Accept" / "Zapisz"
- Obsługa loading state i błędów

**ErrorBoundary (opcjonalnie):**
- Obsługa nieoczekiwanych błędów React
- Fallback UI z komunikatem błędu

### 5.3 Komponenty pomocnicze

**CharacterCounter:**
- Licznik znaków dla pól z limitem
- Wyświetlanie: "X / 200"
- Zmiana koloru przy zbliżaniu się do limitu (opcjonalnie)

**LoadingState:**
- Skeleton lub Spinner podczas ładowania
- Używany podczas pobierania listy fiszek, zapisywanie, edycja, usuwanie

**EmptyState:**
- Komunikat gdy brak fiszek
- Link do `/create`
- Używany w `/study` gdy lista jest pusta

**ErrorDisplay:**
- Wyświetlanie błędów API
- Mapowanie kodów błędów na komunikaty po polsku
- Przycisk "Spróbuj ponownie" dla błędów sieciowych
- Używany w Alert lub Toast

### 5.4 Hooks React (custom)

**useFlashcards:**
- Zarządzanie stanem listy fiszek
- Funkcje: fetchFlashcards, createFlashcard, updateFlashcard, deleteFlashcard
- Obsługa optimistic updates
- Obsługa błędów

**useStudySession:**
- Zarządzanie sesją powtórek
- Stan: currentIndex, flashcards, completed
- Funkcje: startSession, nextCard, previousCard, resetSession
- Integracja z API (order=random)

**useSwipe:**
- Obsługa swipe gestures
- Zwraca funkcje: onSwipeLeft, onSwipeRight
- Fallback na przyciski dla użytkowników bez obsługi dotyku

**useFlashcardFlip:**
- Zarządzanie stanem obrotu karty (flipped/unflipped)
- Obsługa kliknięcia i klawiatury (Enter)
- Aria-labels dynamiczne w zależności od stanu

### 5.5 Utility functions

**validation.ts:**
- Walidacja długości tekstu (max 200 znaków)
- Walidacja loginu (min 3 znaki)
- Walidacja hasła (min 6 znaków)
- Trim whitespace

**error-handler.ts:**
- Mapowanie kodów błędów API na komunikaty po polsku
- Obsługa różnych typów błędów (400, 401, 404, 500)
- Formatowanie komunikatów błędów dla użytkownika

**api-client.ts:**
- Funkcje do komunikacji z Astro API routes
- Obsługa autoryzacji (JWT token w headerze)
- Obsługa błędów sieciowych
- Retry logic (opcjonalnie)

## 6. Mapowanie historyjek użytkownika do architektury UI

### US-001: Rejestracja nowego użytkownika
- **Widok**: `/register`
- **Komponenty**: Formularz rejestracji (Input, Button, Alert)
- **Integracja**: POST do Supabase Auth (przez Astro API route, jeśli potrzebne)

### US-002: Logowanie użytkownika
- **Widok**: `/`
- **Komponenty**: Formularz logowania (Input, Button, Alert)
- **Integracja**: POST do Supabase Auth

### US-003: Wylogowanie użytkownika
- **Komponent**: Header (przycisk wylogowania)
- **Integracja**: Supabase Auth signOut

### US-004: Wklejanie tekstu do tworzenia fiszek
- **Widok**: `/create`
- **Komponenty**: Textarea, CharacterCounter, Alert (dla błędów walidacji)

### US-005: Tworzenie fiszki z całego tekstu
- **Widok**: `/create`
- **Komponenty**: Button "Utwórz fiszkę z całego tekstu", Dialog z formularzem, Button "Accept"

### US-006: Tworzenie fiszki z pojedynczego słowa
- **Widok**: `/create`
- **Komponenty**: InteractiveTextArea (klikalne słowa), Dialog z formularzem, Button "Accept"

### US-007: Tworzenie wielu fiszek z różnych słów
- **Widok**: `/create`
- **Komponenty**: InteractiveTextArea, Dialog, Button "Accept"
- **Logika**: Tekst pozostaje w polu po zapisaniu, możliwość kolejnych kliknięć

### US-008: Wyświetlanie fiszek jako karty
- **Widok**: `/study`
- **Komponenty**: FlashcardCard, Card (Shadcn/ui)

### US-009: Obrót karty i wyświetlanie translacji
- **Widok**: `/study`
- **Komponenty**: FlashcardCard z efektem obrotu (Tailwind CSS transforms)
- **Hook**: useFlashcardFlip

### US-010: Przesuwanie kart na bok (swipe)
- **Widok**: `/study`
- **Komponenty**: FlashcardCard z obsługą swipe (react-swipeable), Button fallback (ChevronLeft/ChevronRight)
- **Hook**: useSwipe

### US-011: System powtórek w losowej kolejności
- **Widok**: `/study` (tryb powtórek)
- **Komponenty**: Tabs/ToggleGroup, Button "Rozpocznij sesję powtórek", Alert (zakończenie cyklu)
- **Hook**: useStudySession
- **Integracja**: GET /api/flashcards?order=random

### US-012: Edycja treści i translacji fiszki
- **Widok**: `/study`
- **Komponenty**: Button edycji, Dialog z formularzem (Input, Textarea), Button "Zapisz"
- **Integracja**: PATCH /api/flashcards/:id (optimistic update)

### US-013: Usuwanie fiszki
- **Widok**: `/study`
- **Komponenty**: Button usuwania, AlertDialog (potwierdzenie), Button "Usuń"
- **Integracja**: DELETE /api/flashcards/:id (optimistic update)

### US-014: Walidacja długości tekstu
- **Widoki**: `/create`, `/study` (edycja)
- **Komponenty**: CharacterCounter, Alert (błąd walidacji)
- **Utility**: validation.ts

### US-015: Obsługa błędów API
- **Wszystkie widoki**
- **Komponenty**: Alert (variant: "destructive"), Toast
- **Utility**: error-handler.ts

### US-016: Walidacja danych logowania
- **Widok**: `/`
- **Komponenty**: Formularz logowania, Alert (błędy walidacji)
- **Utility**: validation.ts

### US-017: Walidacja danych rejestracji
- **Widok**: `/register`
- **Komponenty**: Formularz rejestracji, Alert (błędy walidacji)
- **Utility**: validation.ts

### US-018: Przechowywanie fiszek na koncie użytkownika
- **Wszystkie widoki** (automatycznie przez RLS w Supabase)
- **Integracja**: Wszystkie endpointy API wymagają autoryzacji

### US-019: Określanie języka źródłowego i docelowego
- **Status**: Nie obsługiwane w MVP (zgodnie z decyzjami z sesji)

### US-020: Tworzenie fiszki bez translacji
- **Widok**: `/create`
- **Komponenty**: Dialog z formularzem (pole translacji opcjonalne)
- **Logika**: Pole translacji może być puste, "Brak translacji" wyświetlane na rewersie karty

### US-021: Reset cyklu powtórek
- **Widok**: `/study` (tryb powtórek)
- **Komponenty**: Alert (zakończenie cyklu), Button "Rozpocznij nowy cykl"
- **Hook**: useStudySession (resetSession)

### US-022: Dostęp do aplikacji bez logowania
- **Wszystkie widoki**
- **Logika**: Middleware Astro sprawdza autoryzację, przekierowanie do `/` jeśli niezalogowany
- **Komponenty**: Header (ukrycie linków dla niezalogowanych)

## 7. Rozwiązanie punktów bólu użytkownika

### 7.1 Czasochłonne manualne tworzenie fiszek
**Rozwiązanie:**
- Widok `/create` z możliwością wklejania tekstu i szybkiego wyboru słów
- Interaktywny obszar wyboru słów umożliwia szybkie tworzenie wielu fiszek z jednego tekstu
- Tekst pozostaje w polu po zapisaniu, umożliwiając tworzenie kolejnych fiszek bez ponownego wklejania
- Opcja "Utwórz fiszkę z całego tekstu" dla szybkiego tworzenia fiszek z całych fraz

### 7.2 Brak elastyczności w wyborze zakresu treści
**Rozwiązanie:**
- Możliwość wyboru całego tekstu lub pojedynczych słów
- Każde słowo jest klikalne, umożliwiając precyzyjny wybór
- Możliwość utworzenia wielu fiszek z tego samego tekstu
- Możliwość utworzenia wielu fiszek z tego samego słowa (jeśli potrzebne)

### 7.3 Konieczność ręcznego wpisywania translacji
**Rozwiązanie:**
- Pole translacji jest opcjonalne - użytkownik może utworzyć fiszkę bez translacji i dodać ją później
- Edycja fiszki umożliwia dodanie translacji do istniejącej fiszki
- Prosty formularz z jednym polem dla translacji (bez dodatkowych pól)

### 7.4 Brak szybkiego sposobu na przetworzenie tekstu
**Rozwiązanie:**
- Widok `/create` z możliwością wklejania tekstu (Ctrl+V)
- Natychmiastowa walidacja długości (max 200 znaków)
- Interaktywny obszar wyboru słów pojawia się natychmiast po wklejeniu
- Szybkie zapisywanie po kliknięciu "Accept" (optimistic updates dla lepszego UX)

### 7.5 Trudność w nauce z przewidywalnym wzorcem
**Rozwiązanie:**
- Tryb powtórek w `/study` z losową kolejnością fiszek
- Każda sesja powtórek ma inną losową kolejność
- Licznik postępu pokazuje postęp sesji
- Możliwość resetu cyklu i rozpoczęcia nowej sesji

### 7.6 Brak wizualnej atrakcyjności interfejsu
**Rozwiązanie:**
- Karty z efektem obrotu (płynne animacje)
- Swipe gestures dla nawigacji (intuicyjne na urządzeniach dotykowych)
- Responsywny design dostosowany do urządzeń mobilnych
- Shadcn/ui zapewnia spójny, nowoczesny design

## 8. Przypadki brzegowe i stany błędów

### 8.1 Stany błędów API

**401 Unauthorized:**
- Komunikat: "Sesja wygasła. Zaloguj się ponownie."
- Akcja: Przekierowanie do `/` (strona logowania)

**404 Not Found (fiszka):**
- Komunikat: "Fiszka nie została znaleziona."
- Akcja: Usunięcie fiszki z lokalnego stanu (jeśli była w liście), wyświetlenie Toast

**400 Bad Request (walidacja):**
- Komunikat: Szczegółowy komunikat z API (np. "Tekst źródłowy przekracza maksymalną długość 200 znaków")
- Akcja: Wyświetlenie Alert z komunikatem, pozostawienie formularza otwartego do poprawy

**500 Internal Server Error:**
- Komunikat: "Wystąpił błąd serwera. Spróbuj ponownie później."
- Akcja: Wyświetlenie Alert z przyciskiem "Spróbuj ponownie", możliwość retry

**Błąd sieciowy (timeout, brak połączenia):**
- Komunikat: "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
- Akcja: Wyświetlenie Alert z przyciskiem "Spróbuj ponownie", możliwość retry

### 8.2 Stany empty

**Brak fiszek:**
- Widok: `/study`
- Komponent: EmptyState (Card z komunikatem "Nie masz jeszcze fiszek" i linkiem do `/create`)

**Brak wyników wyszukiwania (przyszłość):**
- Nie dotyczy MVP (brak wyszukiwania)

### 8.3 Stany loading

**Ładowanie listy fiszek:**
- Widok: `/study`
- Komponent: Skeleton (placeholder dla kart)

**Zapisywanie fiszki:**
- Widok: `/create`
- Komponent: Spinner na przycisku "Accept", disabled state

**Edycja/usuwanie fiszki:**
- Widok: `/study`
- Komponent: Optimistic update (natychmiastowa aktualizacja UI), Spinner w tle (opcjonalnie)

### 8.4 Przypadki brzegowe walidacji

**Tekst dłuższy niż 200 znaków:**
- Walidacja po stronie klienta przed wysłaniem
- Komunikat: "Tekst jest zbyt długi. Maksymalna długość to 200 znaków."
- Blokada zapisu

**Tekst zawierający tylko białe znaki:**
- Trim whitespace przed walidacją
- Jeśli po trim pusty: komunikat "Tekst źródłowy nie może być pusty"

**Pole translacji z bardzo długim tekstem:**
- Brak limitu dla translacji (TEXT w bazie)
- Możliwość wyświetlenia z przewijaniem na karcie

### 8.5 Przypadki brzegowe sesji powtórek

**Brak fiszek do powtórek:**
- Komunikat: "Nie masz fiszek do powtórek. Utwórz najpierw fiszki."
- Link do `/create`

**Przerwanie sesji powtórek:**
- Stan sesji tylko w pamięci komponentu (nie zapisywany w localStorage w MVP)
- Przejście do innego widoku resetuje sesję
- Możliwość rozszerzenia w przyszłości o zapis w localStorage

**Zakończenie cyklu powtórek:**
- Alert: "Przeszedłeś przez wszystkie fiszki"
- Przycisk "Rozpocznij nowy cykl" → nowa losowa kolejność

### 8.6 Przypadki brzegowe optimistic updates

**Błąd podczas edycji (PATCH):**
- Cofnięcie zmian w UI (przywrócenie poprzednich wartości)
- Wyświetlenie Toast/Alert z komunikatem błędu
- Dialog pozostaje otwarty z możliwością ponowienia próby

**Błąd podczas usuwania (DELETE):**
- Przywrócenie fiszki w UI (dodanie z powrotem do listy)
- Wyświetlenie Toast/Alert z komunikatem błędu
- Możliwość ponowienia próby usunięcia

## 9. Zgodność z planem API

### 9.1 Mapowanie endpointów API do widoków

**GET /api/flashcards:**
- Używany w: `/study`
- Parametry: `order=id|random`, `limit` (opcjonalnie, w MVP bez limitu), `offset` (opcjonalnie, w MVP bez offsetu)
- Obsługa: Pobranie wszystkich fiszek na początku, zarządzanie lokalnie w stanie React

**GET /api/flashcards/:id:**
- Używany w: `/study` (opcjonalnie, dla aktualizacji pojedynczej fiszki)
- Obsługa: Pobranie pojedynczej fiszki (np. po edycji, jeśli potrzebna aktualizacja)

**POST /api/flashcards:**
- Używany w: `/create`
- Body: `{ source_text: string, translation?: string }`
- Obsługa: Zapisywanie nowej fiszki, czekanie na odpowiedź przed aktualizacją UI

**PATCH /api/flashcards/:id:**
- Używany w: `/study` (edycja)
- Body: `{ source_text?: string, translation?: string }`
- Obsługa: Optimistic update, cofnięcie w razie błędu

**DELETE /api/flashcards/:id:**
- Używany w: `/study` (usuwanie)
- Obsługa: Optimistic update, przywrócenie w razie błędu

**GET /api/flashcards/count:**
- Używany w: `/study` (opcjonalnie, dla statystyki)
- Obsługa: Wyświetlenie liczby fiszek w Badge lub Card

### 9.2 Obsługa odpowiedzi API

**Sukces (200/201):**
- Aktualizacja lokalnego stanu React
- Wyświetlenie Toast/Alert sukcesu (opcjonalnie)
- Dla POST: dodanie nowej fiszki do listy (jeśli potrzebne)

**Błąd (400/401/404/500):**
- Mapowanie kodów błędów na komunikaty po polsku (error-handler.ts)
- Wyświetlenie Alert/Toast z komunikatem
- Dla optimistic updates: cofnięcie zmian

### 9.3 Autoryzacja

**JWT Token:**
- W MVP: zarządzanie tokenem zostanie wdrożone w późniejszym etapie
- W przyszłości: token w httpOnly cookies, middleware Astro do weryfikacji
- Wszystkie endpointy wymagają autoryzacji (401 jeśli brak tokenu)

**RLS (Row Level Security):**
- Zapewnia bezpieczeństwo na poziomie bazy danych
- Użytkownicy widzą tylko swoje fiszki
- API automatycznie filtruje po user_id (ustawiane przez trigger)

## 10. Podsumowanie

Architektura UI została zaprojektowana w oparciu o wymagania PRD, plan API i decyzje z sesji planowania. Główne założenia:

- **Separacja widoków**: Osobne widoki dla tworzenia (`/create`) i przeglądania (`/study`)
- **Tryb powtórek jako funkcja**: Sesja powtórek jest trybem w widoku przeglądania
- **Warstwa abstrakcji API**: Komponenty React komunikują się z Astro API routes
- **Optimistic updates**: Natychmiastowa aktualizacja UI dla edycji i usuwania
- **Responsywność i dostępność**: Pełna obsługa urządzeń mobilnych, klawiatury i czytników ekranu
- **Obsługa błędów**: Kompleksowa obsługa wszystkich stanów błędów i przypadków brzegowych

Architektura jest gotowa do implementacji i zapewnia spójne, intuicyjne doświadczenie użytkownika zgodne z wymaganiami produktu.

