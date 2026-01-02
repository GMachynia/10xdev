<conversation_summary>
<decisions>
1. Widoki tworzenia i przeglądania fiszek będą osobnymi routes: `/create` dla tworzenia i `/study` lub `/flashcards` dla przeglądania, z możliwością łatwego przełączania przez nawigację.
2. Języki źródłowy i docelowy nie będą obsługiwane w MVP - nie zwracamy uwagi na języki w tym etapie rozwoju.
3. Sesja powtórek będzie trybem w widoku przeglądania (nie osobnym widokiem), aktywowanym przez przycisk i przełączającym na losową kolejność fiszek.
4. Zarządzanie tokenem JWT Supabase zostanie wdrożone w późniejszym etapie - obecnie nie implementujemy pełnej autoryzacji.
5. Każda fiszka będzie zapisywana natychmiast po kliknięciu "Accept" (POST /api/flashcards), tekst źródłowy pozostaje w polu umożliwiając tworzenie kolejnych fiszek.
6. Optimistic updates będą zaimplementowane dla operacji edycji (PATCH) i usuwania (DELETE) dla lepszego UX, z możliwością cofnięcia zmian w razie błędu API.
7. W MVP wszystkie fiszki użytkownika będą pobierane na początku bez paginacji (bez limit/offset), zarządzane lokalnie w stanie React.
8. Komponenty React będą używać Astro API routes jako warstwy abstrakcji między frontendem a Supabase, nie bezpośrednio Supabase client.
9. Stany loading, error i empty state będą zaimplementowane używając komponentów Shadcn/ui (Skeleton, Spinner, Alert, Toast, Card) z klasami Tailwind CSS.
10. Efekt obrotu karty (flip) i swipe gestures będą zaimplementowane używając Tailwind CSS transforms i transitions, z Shadcn/ui Card jako kontenerem, z pełną obsługą dostępności (aria-labels, klawiatura, focus management).
</decisions>

<matched_recommendations>
1. **Osobne widoki dla tworzenia i przeglądania**: Widok tworzenia (`/create`) z Shadcn/ui Textarea (max-w-2xl, mx-auto, p-4), interaktywny obszar wyboru słów (flex flex-wrap gap-2, p-4, rounded-lg border), Shadcn/ui Button "Accept" (variant: "default"). Widok przeglądania (`/study` lub `/flashcards`) z Shadcn/ui Card, Shadcn/ui Tabs lub ToggleGroup dla przełączania trybów.
2. **Sesja powtórek jako tryb**: Shadcn/ui Button (w-full sm:w-auto) aktywujący tryb powtórek z order=random, lokalny stan sesji w komponencie React, Shadcn/ui Alert po zakończeniu cyklu, licznik postępu z Tailwind (flex items-center gap-2, text-sm text-muted-foreground).
3. **Natychmiastowe zapisywanie fiszek**: Shadcn/ui Button z disabled state podczas loading (isLoading prop), Shadcn/ui Skeleton/Spinner (animate-spin), Shadcn/ui Toast/Alert po sukcesie (variant: "success", border-green-500 bg-green-50 text-green-800).
4. **Optimistic updates**: Dla PATCH i DELETE natychmiastowa aktualizacja UI, w razie błędu cofnięcie zmian i Shadcn/ui Toast (variant: "destructive") lub Alert (border-red-500 bg-red-50 text-red-800). Shadcn/ui Dialog dla formularza edycji z Input i Textarea (max-w-md mx-auto).
5. **Pobieranie wszystkich fiszek**: W MVP bez limit/offset, lokalne zarządzanie w React. Endpoint /api/flashcards/count dla statystyki w Shadcn/ui Card (p-4, rounded-lg, border) lub Badge (text-lg font-semibold).
6. **Astro API routes jako warstwa abstrakcji**: Komponenty React wywołują /api/flashcards zamiast bezpośrednio Supabase client, zapewniając spójny interfejs REST, łatwiejsze testowanie i centralną walidację.
7. **Stany UI z Shadcn/ui i Tailwind**: Loading - Shadcn/ui Skeleton (h-32 w-full rounded-lg animate-pulse) lub Spinner (animate-spin h-8 w-8). Error - Shadcn/ui Alert (variant: "destructive") z Button "Spróbuj ponownie" (mt-4) lub Toast. Empty - Shadcn/ui Card (p-8 text-center) z tekstem "Nie masz jeszcze fiszek" i Button linkiem do /create. Mapowanie kodów błędów API na komunikaty po polsku.
8. **Efekt obrotu i swipe z Tailwind i Shadcn/ui**: Tailwind CSS transforms (transform-gpu, perspective-1000, rotate-y-180) z transitions (transition-transform duration-500 ease-in-out), Shadcn/ui Card jako kontener. Swipe przez react-swipeable z Tailwind (touch-pan-x, select-none) lub Hammer.js, fallback na Shadcn/ui Button z ikonami ChevronLeft/ChevronRight (lucide-react). Dostępność: aria-labels, klawiatura (strzałki, Enter), focus management. Responsywność: max-w-md mx-auto w-full sm:w-96, aspect-[3/4], cursor-pointer hover:shadow-lg transition-shadow.
</matched_recommendations>

<ui_architecture_planning_summary>
## Główne wymagania dotyczące architektury UI

### Stack technologiczny
- **Framework**: Astro 5 z React 19 dla komponentów dynamicznych
- **Stylowanie**: Tailwind CSS 4 dla utility classes
- **Komponenty UI**: Shadcn/ui jako biblioteka komponentów
- **Backend**: Astro API routes jako warstwa abstrakcji nad Supabase
- **Zarządzanie stanem**: React useState/useEffect dla lokalnego stanu komponentów

### Kluczowe widoki i ekrany

#### 1. Widok tworzenia fiszek (`/create`)
- **Komponenty**: Shadcn/ui Textarea dla pola tekstowego źródłowego, interaktywny obszar wyboru słów, Shadcn/ui Button "Accept"
- **Stylowanie**: Tailwind classes (max-w-2xl, mx-auto, p-4) dla kontenera, (flex flex-wrap gap-2, p-4, rounded-lg border) dla obszaru wyboru słów
- **Funkcjonalność**: Natychmiastowe zapisywanie po "Accept" (POST /api/flashcards), tekst źródłowy pozostaje w polu, wyświetlanie stanu loading (Skeleton/Spinner) i sukcesu (Toast/Alert)

#### 2. Widok przeglądania fiszek (`/study` lub `/flashcards`)
- **Komponenty**: Shadcn/ui Card dla wyświetlania kart, Shadcn/ui Tabs lub ToggleGroup dla przełączania trybów
- **Tryby**:
  - **Tryb przeglądania**: order=id (kolejność według ID)
  - **Tryb powtórek**: order=random (losowa kolejność), aktywowany przez Shadcn/ui Button (w-full sm:w-auto)
- **Efekt obrotu karty**: Tailwind CSS transforms (transform-gpu, perspective-1000, rotate-y-180) z transitions (duration-500 ease-in-out), Shadcn/ui Card jako kontener
- **Swipe gestures**: react-swipeable z Tailwind classes (touch-pan-x, select-none) lub Hammer.js, fallback na Shadcn/ui Button z ikonami ChevronLeft/ChevronRight (lucide-react)
- **Sesja powtórek**: Lokalny stan sesji (aktualna fiszka, pozostałe) w komponencie React, licznik postępu z Tailwind (flex items-center gap-2, text-sm text-muted-foreground), Shadcn/ui Alert po zakończeniu cyklu
- **Responsywność**: max-w-md mx-auto w-full sm:w-96, aspect-[3/4] dla kart

### Strategia integracji z API i zarządzania stanem

#### Integracja z API
- **Architektura**: Komponenty React → Astro API routes (`/api/flashcards`) → Supabase
- **Nie używamy**: Bezpośrednich wywołań Supabase client z komponentów React
- **Korzyści**: Spójny interfejs REST, łatwiejsze testowanie, centralna walidacja, możliwość dodania dodatkowej logiki

#### Zarządzanie stanem
- **Lokalny stan**: React useState/useEffect dla stanu komponentów (sesja powtórek, aktualna fiszka, lista fiszek)
- **Pobieranie danych**: Wszystkie fiszki pobierane na początku (bez paginacji w MVP), zarządzane lokalnie w stanie React
- **Optimistic updates**: Dla PATCH i DELETE natychmiastowa aktualizacja UI, z możliwością cofnięcia w razie błędu
- **Operacje tworzenia**: Czekanie na odpowiedź API przed aktualizacją UI (potrzebne ID fiszki)

#### Obsługa błędów API
- **Struktura błędów**: `{ error: { code, message, details } }` zgodnie z API planem
- **Mapowanie kodów**: Kody błędów API mapowane na komunikaty po polsku w Shadcn/ui Alert
- **Komponenty błędów**: Shadcn/ui Alert (variant: "destructive") z Button "Spróbuj ponownie" (mt-4) lub Shadcn/ui Toast

### Stany UI (loading, error, empty)

#### Loading State
- **Komponenty**: Shadcn/ui Skeleton (h-32 w-full rounded-lg animate-pulse) lub Shadcn/ui Spinner (animate-spin h-8 w-8)
- **Użycie**: Podczas zapisu fiszki, pobierania listy, operacji edycji/usuwania

#### Error State
- **Komponenty**: Shadcn/ui Alert (variant: "destructive") z Button "Spróbuj ponownie" (mt-4) lub Shadcn/ui Toast (variant: "destructive")
- **Stylowanie**: Tailwind classes (border-red-500 bg-red-50 text-red-800) dla Alert
- **Obsługa**: Mapowanie kodów błędów API na komunikaty po polsku

#### Empty State
- **Komponenty**: Shadcn/ui Card (p-8 text-center) z tekstem "Nie masz jeszcze fiszek" i Shadcn/ui Button z linkiem do /create
- **Użycie**: Gdy lista fiszek jest pusta

#### Success State
- **Komponenty**: Shadcn/ui Toast (variant: "success") lub Shadcn/ui Alert z klasami Tailwind (border-green-500 bg-green-50 text-green-800)
- **Użycie**: Po pomyślnym zapisaniu, edycji lub usunięciu fiszki

### Kwestie dotyczące responsywności, dostępności i bezpieczeństwa

#### Responsywność
- **Karty fiszek**: max-w-md mx-auto w-full sm:w-96, aspect-[3/4] dla zachowania proporcji
- **Kontenery**: max-w-2xl mx-auto dla widoku tworzenia, max-w-md mx-auto dla formularzy edycji
- **Przyciski**: w-full sm:w-auto dla responsywności na mobile i desktop
- **Obszary interaktywne**: flex flex-wrap gap-2 dla elastycznego układu

#### Dostępność (a11y)
- **Efekt obrotu karty**: aria-labels dla opisów, obsługa klawiatury (strzałki do nawigacji, Enter do obrotu), focus management
- **Swipe gestures**: Fallback na przyciski nawigacyjne z ikonami ChevronLeft/ChevronRight (lucide-react) dla użytkowników bez obsługi dotyku
- **Komponenty Shadcn/ui**: Zapewniają domyślną dostępność (aria-attributes, keyboard navigation)
- **Formularze**: Proper labels, error messages, focus states

#### Bezpieczeństwo
- **Autoryzacja**: JWT token będzie wdrożony w późniejszym etapie - obecnie MVP działa bez pełnej autoryzacji
- **Walidacja**: Centralna walidacja w Astro API routes przed zapisem do bazy
- **RLS**: Row Level Security w Supabase zapewnia dodatkową warstwę bezpieczeństwa na poziomie bazy danych
- **Sanityzacja danych**: Trim whitespace, walidacja długości (max 200 znaków dla source_text)

### Komponenty i wzorce UI

#### Komponenty Shadcn/ui do użycia
- **Textarea**: Pole tekstowe źródłowe w widoku tworzenia
- **Button**: Przyciski akcji (Accept, nawigacja, tryby)
- **Card**: Kontener dla fiszek i statystyk
- **Tabs/ToggleGroup**: Przełączanie między trybem przeglądania a powtórek
- **Dialog**: Formularz edycji fiszki
- **Input**: Pole edycji w formularzu
- **Alert**: Komunikaty błędów, sukcesu, zakończenia sesji
- **Toast**: Notyfikacje sukcesu/błędu
- **Skeleton**: Placeholder podczas ładowania
- **Spinner**: Wskaźnik ładowania
- **Badge**: Statystyki (liczba fiszek)

#### Wzorce interakcji
- **Tworzenie fiszek**: Tekst źródłowy → wybór słów → Accept → natychmiastowe zapisanie → tekst pozostaje w polu
- **Przeglądanie**: Lista fiszek → kliknięcie/klawiatura → obrót karty → nawigacja (swipe/przyciski)
- **Sesja powtórek**: Aktywacja trybu → losowa kolejność → nawigacja przez fiszki → licznik postępu → zakończenie z Alert
- **Edycja**: Dialog z formularzem → optimistic update → aktualizacja UI → obsługa błędu
- **Usuwanie**: Potwierdzenie → optimistic update → usunięcie z UI → obsługa błędu

### Nierozwiązane kwestie techniczne

#### Języki źródłowy i docelowy
- **Status**: Nie będą obsługiwane w MVP
- **Uzasadnienie**: Nie są krytyczne dla funkcjonalności MVP
- **Przyszłość**: Możliwość rozszerzenia schematu API o pola source_language i target_language w tabeli flashcards

#### Paginacja
- **Status**: W MVP pobieranie wszystkich fiszek bez paginacji
- **Uzasadnienie**: Dla małych kolekcji (<1000 fiszek) wystarczające
- **Przyszłość**: Dla większych kolekcji rozważyć lazy loading, infinite scroll lub paginację z Shadcn/ui Pagination component

#### JWT i autoryzacja
- **Status**: Zostanie wdrożone w późniejszym etapie
- **Uzasadnienie**: MVP może działać bez pełnej autoryzacji dla celów prototypowania
- **Przyszłość**: Supabase Auth SDK w komponentach React, middleware Astro do weryfikacji, token w httpOnly cookies

### Metryki i statystyki

#### Endpoint statystyk
- **Endpoint**: GET /api/flashcards/count
- **Wyświetlanie**: Shadcn/ui Card (p-4, rounded-lg, border) lub Shadcn/ui Badge (text-lg font-semibold)
- **Użycie**: Statystyka liczby fiszek użytkownika w widoku przeglądania

### Przepływy użytkownika

#### Przepływ tworzenia fiszek
1. Użytkownik wchodzi na `/create`
2. Wprowadza tekst źródłowy w Shadcn/ui Textarea
3. Wybiera słowa w interaktywnym obszarze (flex flex-wrap gap-2)
4. Klika "Accept" (Shadcn/ui Button)
5. Wyświetla się stan loading (Skeleton/Spinner)
6. Fiszka zapisuje się przez POST /api/flashcards
7. Wyświetla się Toast/Alert sukcesu
8. Tekst źródłowy pozostaje w polu, możliwość tworzenia kolejnych fiszek

#### Przepływ przeglądania fiszek
1. Użytkownik wchodzi na `/study` lub `/flashcards`
2. Pobierane są wszystkie fiszki (GET /api/flashcards?order=id)
3. Wyświetlane są w Shadcn/ui Card
4. Użytkownik może przełączyć na tryb powtórek (Shadcn/ui Button)
5. Pobierane są fiszki w losowej kolejności (GET /api/flashcards?order=random)
6. Nawigacja przez fiszki (swipe/przyciski/klawiatura)
7. Obrót karty (kliknięcie/Enter) pokazuje tłumaczenie
8. Licznik postępu pokazuje postęp sesji
9. Po zakończeniu wyświetla się Shadcn/ui Alert z możliwością nowego cyklu

#### Przepływ edycji fiszki
1. Użytkownik otwiera formularz edycji (Shadcn/ui Dialog)
2. Wypełnia pola (Shadcn/ui Input, Textarea)
3. Klika "Zapisz"
4. Optimistic update - UI aktualizuje się natychmiast
5. Wysyłane jest żądanie PATCH /api/flashcards/:id
6. W razie błędu: cofnięcie zmian, wyświetlenie Toast/Alert błędu
7. W razie sukcesu: potwierdzenie przez Toast/Alert

#### Przepływ usuwania fiszki
1. Użytkownik klika "Usuń" (z potwierdzeniem)
2. Optimistic update - fiszka znika z UI natychmiast
3. Wysyłane jest żądanie DELETE /api/flashcards/:id
4. W razie błędu: przywrócenie fiszki, wyświetlenie Toast/Alert błędu
5. W razie sukcesu: potwierdzenie przez Toast/Alert
</ui_architecture_planning_summary>

<unresolved_issues>
1. **Szczegóły implementacji wyboru słów w widoku tworzenia**: Nie określono dokładnego mechanizmu wyboru słów z tekstu źródłowego - czy będzie to automatyczne podświetlanie, czy ręczny wybór przez użytkownika, czy parser tekstu.
2. **Zarządzanie sesją powtórek**: Nie określono, czy sesja powtórek powinna być trwała (zapisana w localStorage) czy tylko w pamięci komponentu React, oraz jak obsługiwać przerwanie sesji.
3. **Limit liczby fiszek dla pobierania wszystkich**: Nie określono górnego limitu liczby fiszek, przy którym należy rozważyć paginację - wspomniano >1000, ale nie jest to formalne wymaganie.
4. **Szczegóły dostępności dla efektu obrotu**: Wymieniono aria-labels i obsługę klawiatury, ale nie określono dokładnych wartości aria-label ani szczegółów implementacji focus management.
5. **Obsługa błędów sieciowych**: Nie określono strategii retry dla błędów sieciowych ani timeoutów dla żądań API.
6. **Cache'owanie danych**: Nie określono, czy dane fiszek powinny być cache'owane lokalnie (localStorage/sessionStorage) czy zawsze pobierane z API.
7. **Walidacja po stronie klienta**: Nie określono, czy walidacja długości source_text (max 200 znaków) powinna być również po stronie klienta przed wysłaniem żądania.
8. **Format wyświetlania tłumaczenia**: Nie określono, jak wyświetlać tłumaczenie gdy jest null - czy pokazywać placeholder, czy ukrywać pole.
</unresolved_issues>
</conversation_summary>

