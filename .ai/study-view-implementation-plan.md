# Plan implementacji widoku Przeglądanie i Powtórki Fiszek

## 1. Przegląd

Widok `/study` jest głównym widokiem aplikacji służącym do przeglądania fiszek w formie kart z efektem obrotu oraz prowadzenia sesji powtórek w losowej kolejności. Widok umożliwia użytkownikowi:

- Przeglądanie wszystkich swoich fiszek w formie interaktywnych kart
- Obrót kart w celu zobaczenia translacji (awers/rewers)
- Nawigację między fiszkami za pomocą gestów swipe, przycisków lub klawiatury
- Prowadzenie sesji powtórek w losowej kolejności
- Edycję i usuwanie fiszek z optimistic updates
- Obsługę wszystkich stanów: loading, empty, error

Widok jest chroniony i wymaga zalogowania użytkownika. Wszystkie operacje są wykonywane przez API endpoints z pełną autoryzacją.

## 2. Routing widoku

**Ścieżka:** `/study`

**Plik:** `src/pages/study.astro`

**Ochrona:** Widok wymaga autoryzacji. Próba dostępu bez logowania powinna przekierować do `/` (strona logowania).

**Middleware:** Middleware Astro (`src/middleware/index.ts`) powinien sprawdzać autoryzację przed renderowaniem widoku.

## 3. Struktura komponentów

```
StudyView (Astro Page)
├── StudyViewClient (React Component - client:load)
│   ├── StudyModeSelector (React Component)
│   │   ├── Tabs (Shadcn/ui)
│   │   └── Button "Rozpocznij sesję powtórek" (Shadcn/ui)
│   ├── FlashcardsStats (React Component)
│   │   └── Badge/Card (Shadcn/ui) - liczba fiszek
│   ├── FlashcardsCarousel (React Component)
│   │   ├── FlashcardCard (React Component)
│   │   │   ├── Card (Shadcn/ui) - kontener z efektem obrotu
│   │   │   ├── CardFront (React Component) - awers
│   │   │   ├── CardBack (React Component) - rewers
│   │   │   ├── Button Edit (Shadcn/ui + lucide-react icon)
│   │   │   └── Button Delete (Shadcn/ui + lucide-react icon)
│   │   ├── NavigationButtons (React Component)
│   │   │   ├── Button Previous (ChevronLeft icon)
│   │   │   └── Button Next (ChevronRight icon)
│   │   └── ProgressIndicator (React Component)
│   │       └── Text - "X / Y" (dla trybu powtórek)
│   ├── EditFlashcardDialog (React Component)
│   │   ├── Dialog (Shadcn/ui)
│   │   ├── Input (Shadcn/ui) - source_text
│   │   ├── Textarea (Shadcn/ui) - translation
│   │   ├── CharacterCounter (React Component)
│   │   └── Button "Zapisz" (Shadcn/ui)
│   ├── DeleteFlashcardDialog (React Component)
│   │   ├── AlertDialog (Shadcn/ui)
│   │   └── Button "Usuń" (Shadcn/ui)
│   ├── EmptyState (React Component)
│   │   ├── Card (Shadcn/ui)
│   │   └── Link do /create (Astro/React)
│   ├── LoadingState (React Component)
│   │   └── Skeleton (Shadcn/ui)
│   └── ErrorDisplay (React Component)
│       └── Alert (Shadcn/ui, variant: "destructive")
```

## 4. Szczegóły komponentów

### StudyViewClient

**Opis:** Główny komponent React zarządzający całym widokiem przeglądania i powtórek. Koordynuje pobieranie danych, zarządzanie stanem, przełączanie trybów i obsługę wszystkich interakcji użytkownika.

**Główne elementy:**
- Kontener główny (`div` z klasami Tailwind: `container mx-auto px-4 py-8`)
- Warunkowe renderowanie: `StudyModeSelector`, `FlashcardsStats`, `FlashcardsCarousel`, `EmptyState`, `LoadingState`, `ErrorDisplay`
- Dialogi: `EditFlashcardDialog`, `DeleteFlashcardDialog`

**Obsługiwane zdarzenia:**
- `onMount` - pobranie fiszek przy załadowaniu komponentu
- `onModeChange` - przełączenie między trybem przeglądania a powtórek
- `onFlashcardEdit` - otwarcie dialogu edycji
- `onFlashcardDelete` - otwarcie dialogu usuwania
- `onFlashcardUpdate` - zapisanie zmian po edycji (optimistic update)
- `onFlashcardRemove` - usunięcie fiszki (optimistic update)
- `onSessionReset` - reset sesji powtórek

**Obsługiwana walidacja:**
- Sprawdzenie czy użytkownik jest zalogowany (przed pobraniem danych)
- Walidacja odpowiedzi API (sprawdzenie struktury danych)

**Typy:**
- Props: `{ initialFlashcards?: FlashcardDTO[] }` (opcjonalne, dla SSR)
- Stan: `StudyViewState` (ViewModel)

**Props:**
- `initialFlashcards?: FlashcardDTO[]` - opcjonalne początkowe fiszki (dla SSR/hydration)

### StudyModeSelector

**Opis:** Komponent przełączający między trybem przeglądania (order=id) a trybem powtórek (order=random). Wyświetla Tabs lub ToggleGroup z opcjami trybów.

**Główne elementy:**
- `Tabs` (Shadcn/ui) z dwoma zakładkami: "Przeglądanie" i "Powtórki"
- Przycisk "Rozpocznij sesję powtórek" (tylko gdy tryb powtórek jest wybrany)

**Obsługiwane zdarzenia:**
- `onModeChange(mode: 'browse' | 'study')` - zmiana trybu
- `onStartStudySession()` - rozpoczęcie sesji powtórek

**Obsługiwana walidacja:**
- Sprawdzenie czy istnieją fiszki przed rozpoczęciem sesji powtórek

**Typy:**
- Props: `{ mode: 'browse' | 'study', onModeChange: (mode) => void, onStartStudySession: () => void, hasFlashcards: boolean }`

**Props:**
- `mode: 'browse' | 'study'` - aktualny tryb
- `onModeChange: (mode: 'browse' | 'study') => void` - callback zmiany trybu
- `onStartStudySession: () => void` - callback rozpoczęcia sesji
- `hasFlashcards: boolean` - czy istnieją fiszki do powtórek

### FlashcardsStats

**Opis:** Komponent wyświetlający statystyki - liczbę wszystkich fiszek użytkownika. Opcjonalnie może używać endpointu `/api/flashcards/count`, ale w MVP może używać długości tablicy z lokalnego stanu.

**Główne elementy:**
- `Badge` lub `Card` (Shadcn/ui) z tekstem "Liczba fiszek: X"

**Obsługiwane zdarzenia:**
- Brak (komponent prezentacyjny)

**Obsługiwana walidacja:**
- Brak

**Typy:**
- Props: `{ count: number }`

**Props:**
- `count: number` - liczba fiszek

### FlashcardsCarousel

**Opis:** Komponent karuzeli wyświetlający fiszki jako karty z możliwością nawigacji. Obsługuje swipe gestures, nawigację klawiaturową i przyciskami. Zarządza aktualnie wyświetlaną fiszką i stanem obrotu karty.

**Główne elementy:**
- Kontener z `react-swipeable` lub podobną biblioteką dla swipe gestures
- `FlashcardCard` - karta aktualnej fiszki
- `NavigationButtons` - przyciski nawigacyjne (fallback)
- `ProgressIndicator` - licznik postępu (tylko w trybie powtórek)

**Obsługiwane zdarzenia:**
- `onSwipeLeft()` - przesunięcie w lewo (następna fiszka)
- `onSwipeRight()` - przesunięcie w prawo (poprzednia fiszka)
- `onCardFlip()` - obrót karty
- `onPrevious()` - poprzednia fiszka (przycisk/klawiatura)
- `onNext()` - następna fiszka (przycisk/klawiatura)
- `onEdit()` - edycja aktualnej fiszki
- `onDelete()` - usunięcie aktualnej fiszki
- `onKeyDown` - obsługa klawiatury (strzałki, Enter, Escape)

**Obsługiwana walidacja:**
- Sprawdzenie czy istnieje poprzednia/następna fiszka przed nawigacją
- Sprawdzenie czy sesja powtórek nie jest zakończona

**Typy:**
- Props: `FlashcardsCarouselProps` (ViewModel)

**Props:**
- `flashcards: FlashcardDTO[]` - lista fiszek
- `currentIndex: number` - indeks aktualnej fiszki
- `mode: 'browse' | 'study'` - tryb widoku
- `onCardChange: (index: number) => void` - callback zmiany karty
- `onCardFlip: () => void` - callback obrotu karty
- `onEdit: (flashcard: FlashcardDTO) => void` - callback edycji
- `onDelete: (flashcard: FlashcardDTO) => void` - callback usuwania
- `progress?: { current: number, total: number }` - postęp sesji (opcjonalnie)

### FlashcardCard

**Opis:** Komponent karty fiszki z efektem obrotu 3D. Wyświetla awers (tekst źródłowy) i rewers (translacja). Obsługuje kliknięcie do obrotu oraz przyciski edycji i usuwania.

**Główne elementy:**
- `Card` (Shadcn/ui) z klasami Tailwind dla efektu obrotu (`transform-gpu`, `perspective-1000`, `rotate-y-180`)
- `CardFront` - awers z tekstem źródłowym
- `CardBack` - rewers z translacją lub "Brak translacji"
- Przyciski edycji i usuwania (ikony z lucide-react)

**Obsługiwane zdarzenia:**
- `onClick` - obrót karty (tylko na obszarze karty, nie na przyciskach)
- `onEditClick` - edycja fiszki
- `onDeleteClick` - usunięcie fiszki
- `onKeyDown` - Enter do obrotu, Escape do zamknięcia

**Obsługiwana walidacja:**
- Sprawdzenie czy `translation` nie jest null przed wyświetleniem

**Typy:**
- Props: `FlashcardCardProps`

**Props:**
- `flashcard: FlashcardDTO` - dane fiszki
- `isFlipped: boolean` - czy karta jest obrócona
- `onFlip: () => void` - callback obrotu
- `onEdit: () => void` - callback edycji
- `onDelete: () => void` - callback usuwania

### EditFlashcardDialog

**Opis:** Dialog (modal) do edycji fiszki. Zawiera formularz z polami source_text i translation oraz walidacją długości tekstu.

**Główne elementy:**
- `Dialog` (Shadcn/ui)
- `Input` (Shadcn/ui) dla `source_text` z limitem 200 znaków
- `Textarea` (Shadcn/ui) dla `translation` (bez limitu)
- `CharacterCounter` - licznik znaków dla source_text
- `Button "Zapisz"` (Shadcn/ui) z disabled state podczas loading
- `Button "Anuluj"` (Shadcn/ui)

**Obsługiwane zdarzenia:**
- `onSubmit` - zapisanie zmian (optimistic update)
- `onCancel` - anulowanie edycji
- `onInputChange` - zmiana wartości pól (walidacja w czasie rzeczywistym)

**Obsługiwana walidacja:**
- `source_text`: wymagane, max 200 znaków, trim whitespace
- `translation`: opcjonalne (może być null lub pusty string)
- Wyświetlanie komunikatów błędów walidacji

**Typy:**
- Props: `EditFlashcardDialogProps`

**Props:**
- `flashcard: FlashcardDTO | null` - fiszka do edycji (null = zamknięty)
- `onSave: (id: string, data: UpdateFlashcardCommand) => Promise<void>` - callback zapisu
- `onCancel: () => void` - callback anulowania
- `isOpen: boolean` - czy dialog jest otwarty

### DeleteFlashcardDialog

**Opis:** Dialog potwierdzenia usunięcia fiszki. Używa AlertDialog z Shadcn/ui.

**Główne elementy:**
- `AlertDialog` (Shadcn/ui)
- Tekst potwierdzenia: "Czy na pewno chcesz usunąć tę fiszkę?"
- `Button "Usuń"` (variant: "destructive")
- `Button "Anuluj"`

**Obsługiwane zdarzenia:**
- `onConfirm` - potwierdzenie usunięcia (optimistic update)
- `onCancel` - anulowanie

**Obsługiwana walidacja:**
- Brak (tylko potwierdzenie)

**Typy:**
- Props: `DeleteFlashcardDialogProps`

**Props:**
- `flashcard: FlashcardDTO | null` - fiszka do usunięcia (null = zamknięty)
- `onConfirm: (id: string) => Promise<void>` - callback potwierdzenia
- `onCancel: () => void` - callback anulowania
- `isOpen: boolean` - czy dialog jest otwarty

### EmptyState

**Opis:** Komponent wyświetlany gdy użytkownik nie ma żadnych fiszek. Zawiera komunikat i link do widoku tworzenia.

**Główne elementy:**
- `Card` (Shadcn/ui) z klasami `p-8 text-center`
- Tekst: "Nie masz jeszcze fiszek"
- `Button` lub `Link` do `/create`

**Obsługiwane zdarzenia:**
- `onCreateClick` - przekierowanie do `/create`

**Obsługiwana walidacja:**
- Brak

**Typy:**
- Props: Brak (komponent bez props)

**Props:**
- Brak

### LoadingState

**Opis:** Komponent wyświetlany podczas ładowania danych. Używa Skeleton z Shadcn/ui.

**Główne elementy:**
- `Skeleton` (Shadcn/ui) w kształcie karty fiszki

**Obsługiwane zdarzenia:**
- Brak

**Obsługiwana walidacja:**
- Brak

**Typy:**
- Props: Brak

**Props:**
- Brak

### ErrorDisplay

**Opis:** Komponent wyświetlający błędy API z możliwością ponowienia próby.

**Główne elementy:**
- `Alert` (Shadcn/ui, variant: "destructive")
- Tekst błędu (zmapowany z ErrorResponse)
- `Button "Spróbuj ponownie"` (jeśli możliwe retry)

**Obsługiwane zdarzenia:**
- `onRetry` - ponowienie próby pobrania danych

**Obsługiwana walidacja:**
- Brak

**Typy:**
- Props: `ErrorDisplayProps`

**Props:**
- `error: ErrorResponse | null` - błąd do wyświetlenia
- `onRetry?: () => void` - callback ponowienia próby (opcjonalnie)

### NavigationButtons

**Opis:** Komponent z przyciskami nawigacyjnymi (poprzednia/następna fiszka). Fallback dla użytkowników bez obsługi dotyku.

**Główne elementy:**
- `Button` z ikoną `ChevronLeft` (lucide-react) - poprzednia
- `Button` z ikoną `ChevronRight` (lucide-react) - następna

**Obsługiwane zdarzenia:**
- `onPrevious` - poprzednia fiszka
- `onNext` - następna fiszka

**Obsługiwana walidacja:**
- Disabled state gdy brak poprzedniej/następnej fiszki

**Typy:**
- Props: `NavigationButtonsProps`

**Props:**
- `hasPrevious: boolean` - czy istnieje poprzednia fiszka
- `hasNext: boolean` - czy istnieje następna fiszka
- `onPrevious: () => void` - callback poprzedniej
- `onNext: () => void` - callback następnej

### ProgressIndicator

**Opis:** Komponent wyświetlający postęp sesji powtórek (aktualna fiszka / wszystkie fiszki).

**Główne elementy:**
- Tekst: "X / Y" z klasami `text-sm text-muted-foreground`

**Obsługiwane zdarzenia:**
- Brak

**Obsługiwana walidacja:**
- Brak

**Typy:**
- Props: `ProgressIndicatorProps`

**Props:**
- `current: number` - aktualna fiszka
- `total: number` - wszystkie fiszki

### CharacterCounter

**Opis:** Komponent wyświetlający licznik znaków dla pola z limitem (source_text).

**Główne elementy:**
- Tekst: "X / 200" z dynamicznym kolorem (czerwony gdy przekroczony limit)

**Obsługiwane zdarzenia:**
- Brak

**Obsługiwana walidacja:**
- Brak (tylko prezentacja)

**Typy:**
- Props: `CharacterCounterProps`

**Props:**
- `current: number` - aktualna liczba znaków
- `max: number` - maksymalna liczba znaków (200)

## 5. Typy

### Typy z API (DTO)

**FlashcardDTO:**
```typescript
type FlashcardDTO = {
  id: string; // UUID
  source_text: string; // max 200 znaków
  translation: string | null; // opcjonalne
}
```

**ListFlashcardsResponse:**
```typescript
type ListFlashcardsResponse = {
  data: FlashcardDTO[];
  count: number;
}
```

**UpdateFlashcardCommand:**
```typescript
type UpdateFlashcardCommand = {
  source_text?: string; // max 200 znaków, opcjonalne
  translation?: string | null; // opcjonalne
}
```

**UpdateFlashcardResponse:**
```typescript
type UpdateFlashcardResponse = {
  data: FlashcardDTO;
}
```

**DeleteFlashcardResponse:**
```typescript
type DeleteFlashcardResponse = {
  message: string;
}
```

**ErrorResponse:**
```typescript
type ErrorResponse = {
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR' | 'DATABASE_ERROR';
    message: string;
    details?: ErrorDetails;
  };
}
```

### ViewModel Types (nowe typy dla widoku)

**StudyViewState:**
```typescript
type StudyViewState = {
  // Dane
  flashcards: FlashcardDTO[];
  currentIndex: number;
  
  // Tryb
  mode: 'browse' | 'study';
  isStudySessionActive: boolean;
  
  // Stan sesji powtórek
  studySession: {
    flashcards: FlashcardDTO[]; // losowa kolejność
    currentIndex: number;
    completed: Set<string>; // ID zakończonych fiszek
  } | null;
  
  // Stan UI
  isLoading: boolean;
  error: ErrorResponse | null;
  
  // Dialogi
  editingFlashcard: FlashcardDTO | null;
  deletingFlashcard: FlashcardDTO | null;
  
  // Stan karty
  isCardFlipped: boolean;
}
```

**FlashcardsCarouselProps:**
```typescript
type FlashcardsCarouselProps = {
  flashcards: FlashcardDTO[];
  currentIndex: number;
  mode: 'browse' | 'study';
  onCardChange: (index: number) => void;
  onCardFlip: () => void;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcard: FlashcardDTO) => void;
  progress?: {
    current: number;
    total: number;
  };
}
```

**FlashcardCardProps:**
```typescript
type FlashcardCardProps = {
  flashcard: FlashcardDTO;
  isFlipped: boolean;
  onFlip: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

**EditFlashcardDialogProps:**
```typescript
type EditFlashcardDialogProps = {
  flashcard: FlashcardDTO | null;
  onSave: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}
```

**DeleteFlashcardDialogProps:**
```typescript
type DeleteFlashcardDialogProps = {
  flashcard: FlashcardDTO | null;
  onConfirm: (id: string) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}
```

**ErrorDisplayProps:**
```typescript
type ErrorDisplayProps = {
  error: ErrorResponse | null;
  onRetry?: () => void;
}
```

**NavigationButtonsProps:**
```typescript
type NavigationButtonsProps = {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}
```

**ProgressIndicatorProps:**
```typescript
type ProgressIndicatorProps = {
  current: number;
  total: number;
}
```

**CharacterCounterProps:**
```typescript
type CharacterCounterProps = {
  current: number;
  max: number;
}
```

## 6. Zarządzanie stanem

Widok używa React hooks do zarządzania stanem. Główny komponent `StudyViewClient` zarządza kompleksowym stanem widoku.

### Custom Hook: useStudyView

**Cel:** Centralizacja logiki zarządzania stanem widoku, pobierania danych, obsługi trybów i sesji powtórek.

**Zwracany stan:**
```typescript
{
  // Stan
  state: StudyViewState;
  
  // Akcje
  fetchFlashcards: (order?: 'id' | 'random') => Promise<void>;
  setMode: (mode: 'browse' | 'study') => void;
  startStudySession: () => void;
  resetStudySession: () => void;
  navigateToCard: (index: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  flipCard: () => void;
  openEditDialog: (flashcard: FlashcardDTO) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (flashcard: FlashcardDTO) => void;
  closeDeleteDialog: () => void;
  updateFlashcard: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  retry: () => void;
}
```

**Logika:**
- Pobieranie fiszek z API (`GET /api/flashcards?order=id|random`)
- Zarządzanie trybem przeglądania vs powtórek
- Zarządzanie sesją powtórek (losowa kolejność, postęp)
- Optimistic updates dla edycji i usuwania
- Obsługa błędów z możliwością retry
- Reset stanu karty przy zmianie fiszki

### Stan lokalny w komponentach

**FlashcardCard:**
- `isFlipped: boolean` - stan obrotu karty (może być zarządzany przez rodzica)

**EditFlashcardDialog:**
- `formData: { source_text: string, translation: string }` - dane formularza
- `validationErrors: { source_text?: string }` - błędy walidacji
- `isSubmitting: boolean` - stan podczas zapisywania

## 7. Integracja API

### GET /api/flashcards

**Użycie:** Pobieranie listy wszystkich fiszek użytkownika.

**Typ żądania:**
- Query params: `{ order?: 'id' | 'random', limit?: number, offset?: number }`
- Headers: `Authorization: Bearer <token>` (automatycznie przez fetch)

**Typ odpowiedzi:** `ListFlashcardsResponse`

**Obsługa:**
```typescript
const response = await fetch(`/api/flashcards?order=${order}`, {
  headers: {
    'Authorization': `Bearer ${token}` // jeśli potrzebne
  }
});
const data: ListFlashcardsResponse = await response.json();
```

**Błędy:**
- `401 Unauthorized` - przekierowanie do `/`
- `500 Internal Server Error` - wyświetlenie ErrorDisplay z możliwością retry

### PATCH /api/flashcards/:id

**Użycie:** Aktualizacja fiszki (edycja).

**Typ żądania:**
- Path params: `{ id: string }`
- Body: `UpdateFlashcardCommand`
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`

**Typ odpowiedzi:** `UpdateFlashcardResponse`

**Obsługa (optimistic update):**
1. Natychmiastowa aktualizacja UI (zmiana w lokalnym stanie)
2. Wysłanie żądania PATCH
3. W razie sukcesu: potwierdzenie zmian
4. W razie błędu: cofnięcie zmian, wyświetlenie komunikatu błędu

**Błędy:**
- `400 Bad Request` - walidacja (source_text > 200 znaków) - wyświetlenie w dialogu
- `401 Unauthorized` - przekierowanie do `/`
- `404 Not Found` - fiszka nie istnieje - wyświetlenie Toast
- `500 Internal Server Error` - cofnięcie optimistic update, wyświetlenie Toast

### DELETE /api/flashcards/:id

**Użycie:** Usunięcie fiszki.

**Typ żądania:**
- Path params: `{ id: string }`
- Headers: `Authorization: Bearer <token>`

**Typ odpowiedzi:** `DeleteFlashcardResponse`

**Obsługa (optimistic update):**
1. Natychmiastowe usunięcie z UI
2. Wysłanie żądania DELETE
3. W razie sukcesu: potwierdzenie
4. W razie błędu: przywrócenie fiszki w UI, wyświetlenie Toast

**Błędy:**
- `401 Unauthorized` - przekierowanie do `/`
- `404 Not Found` - fiszka już usunięta - ignorowanie (już usunięta w UI)
- `500 Internal Server Error` - przywrócenie fiszki, wyświetlenie Toast

### GET /api/flashcards/count (opcjonalnie)

**Użycie:** Pobranie liczby fiszek (dla statystyki).

**Typ żądania:**
- Headers: `Authorization: Bearer <token>`

**Typ odpowiedzi:** `GetFlashcardsCountResponse`

**Obsługa:** Opcjonalnie - w MVP można użyć długości tablicy z lokalnego stanu.

## 8. Interakcje użytkownika

### Nawigacja między fiszkami

**Swipe w lewo:**
- Akcja: Przejście do następnej fiszki
- Obsługa: `react-swipeable` lub podobna biblioteka
- Warunek: Sprawdzenie czy istnieje następna fiszka
- Rezultat: Zmiana `currentIndex`, reset `isCardFlipped` na `false`

**Swipe w prawo:**
- Akcja: Przejście do poprzedniej fiszki
- Obsługa: `react-swipeable`
- Warunek: Sprawdzenie czy istnieje poprzednia fiszka
- Rezultat: Zmiana `currentIndex`, reset `isCardFlipped` na `false`

**Przyciski nawigacyjne:**
- Akcja: Kliknięcie ChevronLeft/ChevronRight
- Obsługa: `onClick` na przyciskach
- Warunek: Disabled state gdy brak poprzedniej/następnej
- Rezultat: Jak wyżej

**Klawiatura:**
- `ArrowLeft`: Poprzednia fiszka
- `ArrowRight`: Następna fiszka
- Obsługa: `useEffect` z `window.addEventListener('keydown')`
- Warunek: Sprawdzenie czy focus nie jest w input/textarea

### Obrót karty

**Kliknięcie w kartę:**
- Akcja: Obrót karty (awers ↔ rewers)
- Obsługa: `onClick` na `FlashcardCard` (nie na przyciskach)
- Rezultat: Zmiana `isCardFlipped` na przeciwny

**Klawiatura:**
- `Enter`: Obrót karty
- Obsługa: `onKeyDown` w `FlashcardCard`
- Warunek: Focus na karcie

### Rozpoczęcie sesji powtórek

**Kliknięcie "Rozpocznij sesję powtórek":**
- Akcja: Przełączenie do trybu powtórek
- Obsługa: `onStartStudySession()` w `StudyModeSelector`
- Warunek: Sprawdzenie czy istnieją fiszki
- Rezultat:
  1. Zmiana `mode` na `'study'`
  2. Pobranie fiszek z `order=random`
  3. Inicjalizacja `studySession` z losową kolejnością
  4. Reset `currentIndex` na 0

### Zakończenie sesji powtórek

**Przejście przez wszystkie fiszki:**
- Warunek: `currentIndex >= studySession.flashcards.length`
- Akcja: Wyświetlenie `Alert` z komunikatem "Przeszedłeś przez wszystkie fiszki"
- Opcje: Przycisk "Rozpocznij nowy cykl" → reset sesji z nową losową kolejnością

### Edycja fiszki

**Kliknięcie przycisku edycji:**
- Akcja: Otwarcie `EditFlashcardDialog`
- Obsługa: `onEdit(flashcard)` w `FlashcardCard`
- Rezultat: Ustawienie `editingFlashcard` w stanie

**Wypełnienie formularza:**
- Akcja: Wpisywanie w pola `source_text` i `translation`
- Obsługa: `onChange` w `Input`/`Textarea`
- Walidacja: Sprawdzenie długości `source_text` (max 200) w czasie rzeczywistym
- Rezultat: Aktualizacja `formData` i `validationErrors`

**Kliknięcie "Zapisz":**
- Akcja: Zapisanie zmian
- Obsługa: `onSave(id, data)` w `EditFlashcardDialog`
- Walidacja: Sprawdzenie przed wysłaniem (source_text max 200, trim)
- Rezultat:
  1. Optimistic update w UI
  2. Wysłanie `PATCH /api/flashcards/:id`
  3. W razie sukcesu: zamknięcie dialogu, potwierdzenie
  4. W razie błędu: cofnięcie zmian, wyświetlenie błędu w dialogu

**Kliknięcie "Anuluj":**
- Akcja: Zamknięcie dialogu bez zapisu
- Obsługa: `onCancel()` w `EditFlashcardDialog`
- Rezultat: Reset `editingFlashcard` na `null`

### Usuwanie fiszki

**Kliknięcie przycisku usuwania:**
- Akcja: Otwarcie `DeleteFlashcardDialog`
- Obsługa: `onDelete(flashcard)` w `FlashcardCard`
- Rezultat: Ustawienie `deletingFlashcard` w stanie

**Kliknięcie "Usuń" w dialogu:**
- Akcja: Potwierdzenie i usunięcie
- Obsługa: `onConfirm(id)` w `DeleteFlashcardDialog`
- Rezultat:
  1. Optimistic update (usunięcie z UI)
  2. Wysłanie `DELETE /api/flashcards/:id`
  3. W razie sukcesu: zamknięcie dialogu, nawigacja do następnej fiszki (jeśli możliwe)
  4. W razie błędu: przywrócenie fiszki, wyświetlenie Toast

**Kliknięcie "Anuluj":**
- Akcja: Zamknięcie dialogu bez usunięcia
- Obsługa: `onCancel()` w `DeleteFlashcardDialog`
- Rezultat: Reset `deletingFlashcard` na `null`

### Obsługa błędów

**Kliknięcie "Spróbuj ponownie":**
- Akcja: Ponowienie próby pobrania danych
- Obsługa: `onRetry()` w `ErrorDisplay`
- Rezultat: Wywołanie `fetchFlashcards()` ponownie

## 9. Warunki i walidacja

### Walidacja po stronie klienta

**source_text (w EditFlashcardDialog):**
- Warunek: Wymagane (nie może być pusty po trim)
- Warunek: Maksymalna długość: 200 znaków
- Walidacja: W czasie rzeczywistym podczas wpisywania
- Komunikat błędu: "Tekst źródłowy nie może być pusty" / "Tekst źródłowy przekracza maksymalną długość 200 znaków"
- Wpływ na UI: Wyświetlenie komunikatu pod polem, disabled state przycisku "Zapisz"

**translation (w EditFlashcardDialog):**
- Warunek: Opcjonalne (może być null lub pusty string)
- Walidacja: Brak (bez limitu długości)
- Wpływ na UI: Brak

### Warunki funkcjonalne

**Rozpoczęcie sesji powtórek:**
- Warunek: `flashcards.length > 0`
- Wpływ na UI: Disabled state przycisku "Rozpocznij sesję powtórek" gdy brak fiszek

**Nawigacja do poprzedniej fiszki:**
- Warunek: `currentIndex > 0` (tryb przeglądania) lub `studySession.currentIndex > 0` (tryb powtórek)
- Wpływ na UI: Disabled state przycisku "Poprzednia"

**Nawigacja do następnej fiszki:**
- Warunek: `currentIndex < flashcards.length - 1` (tryb przeglądania) lub `studySession.currentIndex < studySession.flashcards.length - 1` (tryb powtórek)
- Wpływ na UI: Disabled state przycisku "Następna"

**Zakończenie sesji powtórek:**
- Warunek: `studySession.currentIndex >= studySession.flashcards.length`
- Wpływ na UI: Wyświetlenie `Alert` z komunikatem i przyciskiem "Rozpocznij nowy cykl"

**Wyświetlenie rewersu karty:**
- Warunek: Sprawdzenie czy `translation !== null`
- Wpływ na UI: Wyświetlenie translacji lub "Brak translacji"

### Warunki API

**Autoryzacja:**
- Warunek: Użytkownik musi być zalogowany (token JWT w headerze)
- Wpływ na UI: Przekierowanie do `/` jeśli 401

**Dostęp do fiszki:**
- Warunek: Fiszka musi należeć do użytkownika (RLS)
- Wpływ na UI: 404 jeśli próba edycji/usunięcia cudzej fiszki (nie powinno się zdarzyć)

## 10. Obsługa błędów

### Błędy pobierania danych (GET /api/flashcards)

**401 Unauthorized:**
- Scenariusz: Token wygasł lub nieprawidłowy
- Obsługa: Przekierowanie do `/` (strona logowania)
- UI: Automatyczne przekierowanie, brak komunikatu

**500 Internal Server Error:**
- Scenariusz: Błąd serwera lub bazy danych
- Obsługa: Wyświetlenie `ErrorDisplay` z komunikatem "Wystąpił błąd serwera. Spróbuj ponownie później."
- UI: `Alert` (variant: "destructive") z przyciskiem "Spróbuj ponownie"
- Akcja użytkownika: Kliknięcie "Spróbuj ponownie" → ponowne pobranie danych

**Błąd sieciowy (timeout, brak połączenia):**
- Scenariusz: Brak połączenia z serwerem
- Obsługa: Wyświetlenie `ErrorDisplay` z komunikatem "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
- UI: `Alert` z przyciskiem "Spróbuj ponownie"

### Błędy edycji (PATCH /api/flashcards/:id)

**400 Bad Request (walidacja):**
- Scenariusz: `source_text` przekracza 200 znaków (nie powinno się zdarzyć po walidacji klienta)
- Obsługa: Wyświetlenie komunikatu błędu w `EditFlashcardDialog`
- UI: Komunikat pod polem `source_text`, pozostawienie dialogu otwartego
- Cofnięcie optimistic update: Tak (przywrócenie poprzednich wartości)

**401 Unauthorized:**
- Scenariusz: Token wygasł podczas edycji
- Obsługa: Cofnięcie optimistic update, przekierowanie do `/`
- UI: Automatyczne przekierowanie

**404 Not Found:**
- Scenariusz: Fiszka została usunięta przez innego klienta (nie powinno się zdarzyć w MVP)
- Obsługa: Cofnięcie optimistic update, wyświetlenie Toast "Fiszka nie została znaleziona"
- UI: Toast z komunikatem, zamknięcie dialogu

**500 Internal Server Error:**
- Scenariusz: Błąd serwera podczas zapisu
- Obsługa: Cofnięcie optimistic update, wyświetlenie Toast "Nie udało się zapisać fiszki. Spróbuj ponownie."
- UI: Toast z komunikatem, pozostawienie dialogu otwartego (możliwość ponowienia próby)

### Błędy usuwania (DELETE /api/flashcards/:id)

**401 Unauthorized:**
- Scenariusz: Token wygasł podczas usuwania
- Obsługa: Przywrócenie fiszki w UI, przekierowanie do `/`
- UI: Automatyczne przekierowanie

**404 Not Found:**
- Scenariusz: Fiszka już została usunięta (race condition)
- Obsługa: Ignorowanie błędu (fiszka już usunięta w UI)
- UI: Brak komunikatu (sukces)

**500 Internal Server Error:**
- Scenariusz: Błąd serwera podczas usuwania
- Obsługa: Przywrócenie fiszki w UI, wyświetlenie Toast "Nie udało się usunąć fiszki. Spróbuj ponownie."
- UI: Toast z komunikatem, możliwość ponowienia próby

### Przypadki brzegowe

**Brak fiszek (empty state):**
- Scenariusz: Użytkownik nie ma żadnych fiszek
- Obsługa: Wyświetlenie `EmptyState` zamiast karuzeli
- UI: `Card` z komunikatem "Nie masz jeszcze fiszek" i linkiem do `/create`

**Sesja powtórek przerwana:**
- Scenariusz: Użytkownik przełącza tryb lub odświeża stronę podczas sesji
- Obsługa: Reset sesji (stan tylko w pamięci komponentu, nie zapisywany w localStorage w MVP)
- UI: Powrót do trybu przeglądania, utrata postępu sesji

**Fiszka bez translacji:**
- Scenariusz: `translation === null`
- Obsługa: Wyświetlenie "Brak translacji" na rewersie karty
- UI: Tekst "Brak translacji" zamiast pustego pola

**Cykliczna nawigacja:**
- Scenariusz: Próba przejścia do następnej fiszki po ostatniej (w trybie przeglądania)
- Obsługa: Opcjonalnie - cykliczna nawigacja (powrót do pierwszej) lub disabled state
- UI: Zgodnie z wymaganiami PRD - cykliczna nawigacja lub komunikat o zakończeniu

## 11. Kroki implementacji

### Krok 1: Utworzenie struktury plików

1. Utworzyć plik `src/pages/study.astro` - główny plik widoku Astro
2. Utworzyć katalog `src/components/study/` dla komponentów widoku
3. Utworzyć pliki komponentów:
   - `src/components/study/StudyViewClient.tsx` - główny komponent React
   - `src/components/study/StudyModeSelector.tsx`
   - `src/components/study/FlashcardsStats.tsx`
   - `src/components/study/FlashcardsCarousel.tsx`
   - `src/components/study/FlashcardCard.tsx`
   - `src/components/study/EditFlashcardDialog.tsx`
   - `src/components/study/DeleteFlashcardDialog.tsx`
   - `src/components/study/EmptyState.tsx`
   - `src/components/study/LoadingState.tsx`
   - `src/components/study/ErrorDisplay.tsx`
   - `src/components/study/NavigationButtons.tsx`
   - `src/components/study/ProgressIndicator.tsx`
   - `src/components/study/CharacterCounter.tsx`

### Krok 2: Utworzenie typów ViewModel

1. Utworzyć plik `src/types/study.types.ts` (lub dodać do `src/types.ts`)
2. Zdefiniować typy ViewModel:
   - `StudyViewState`
   - `FlashcardsCarouselProps`
   - `FlashcardCardProps`
   - `EditFlashcardDialogProps`
   - `DeleteFlashcardDialogProps`
   - `ErrorDisplayProps`
   - `NavigationButtonsProps`
   - `ProgressIndicatorProps`
   - `CharacterCounterProps`

### Krok 3: Utworzenie custom hook useStudyView

1. Utworzyć plik `src/hooks/useStudyView.ts` (lub `src/components/study/useStudyView.ts`)
2. Zaimplementować hook z:
   - Stanem `StudyViewState` (useState)
   - Funkcją `fetchFlashcards`
   - Funkcjami zarządzania trybem i sesją
   - Funkcjami nawigacji
   - Funkcjami optimistic updates (edycja, usuwanie)
   - Obsługą błędów

### Krok 4: Utworzenie utility functions

1. Utworzyć plik `src/lib/utils/api-client.ts` (jeśli nie istnieje)
2. Zaimplementować funkcje do komunikacji z API:
   - `fetchFlashcards(order?: 'id' | 'random'): Promise<ListFlashcardsResponse>`
   - `updateFlashcard(id: string, data: UpdateFlashcardCommand): Promise<UpdateFlashcardResponse>`
   - `deleteFlashcard(id: string): Promise<DeleteFlashcardResponse>`
3. Utworzyć plik `src/lib/utils/error-handler.ts` (jeśli nie istnieje)
4. Zaimplementować mapowanie błędów API na komunikaty po polsku

### Krok 5: Implementacja komponentów pomocniczych

1. Zaimplementować `CharacterCounter` - prosty komponent prezentacyjny
2. Zaimplementować `ProgressIndicator` - wyświetlanie postępu
3. Zaimplementować `NavigationButtons` - przyciski nawigacyjne
4. Zaimplementować `EmptyState` - komunikat gdy brak fiszek
5. Zaimplementować `LoadingState` - skeleton podczas ładowania
6. Zaimplementować `ErrorDisplay` - wyświetlanie błędów

### Krok 6: Implementacja komponentów głównych

1. Zaimplementować `FlashcardsStats` - statystyki liczby fiszek
2. Zaimplementować `StudyModeSelector` - przełącznik trybów
3. Zaimplementować `FlashcardCard` - karta z efektem obrotu:
   - Efekt obrotu 3D (Tailwind CSS transforms)
   - Awers i rewers
   - Przyciski edycji i usuwania
4. Zaimplementować `FlashcardsCarousel` - karuzela z:
   - Integracją `react-swipeable` dla swipe gestures
   - Obsługą klawiatury (strzałki, Enter)
   - Nawigacją między fiszkami

### Krok 7: Implementacja dialogów

1. Zaimplementować `EditFlashcardDialog`:
   - Formularz z polami `source_text` i `translation`
   - Walidacja w czasie rzeczywistym (max 200 znaków)
   - `CharacterCounter` dla `source_text`
   - Obsługa optimistic update
2. Zaimplementować `DeleteFlashcardDialog`:
   - `AlertDialog` z potwierdzeniem
   - Obsługa optimistic update

### Krok 8: Implementacja głównego komponentu StudyViewClient

1. Zaimplementować `StudyViewClient`:
   - Użycie hooka `useStudyView`
   - Warunkowe renderowanie komponentów (loading, error, empty, carousel)
   - Integracja wszystkich komponentów
   - Obsługa wszystkich interakcji użytkownika

### Krok 9: Implementacja strony Astro study.astro

1. Utworzyć plik `src/pages/study.astro`:
   - Import `StudyViewClient` z `client:load`
   - Layout strony (opcjonalnie)
   - Integracja z middleware (sprawdzenie autoryzacji)

### Krok 10: Integracja z Shadcn/ui

1. Zainstalować brakujące komponenty Shadcn/ui:
   - `Tabs` lub `ToggleGroup`
   - `Dialog`
   - `AlertDialog`
   - `Skeleton`
   - `Badge`
   - `Alert`
   - `Toast` (jeśli używany)
2. Sprawdzić czy wszystkie komponenty są poprawnie skonfigurowane

### Krok 11: Integracja z biblioteką swipe

1. Zainstalować `react-swipeable` lub podobną bibliotekę
2. Zintegrować z `FlashcardsCarousel`
3. Przetestować na urządzeniach dotykowych

### Krok 12: Stylowanie i animacje

1. Dodać klasy Tailwind dla efektu obrotu karty:
   - `transform-gpu`, `perspective-1000`, `rotate-y-180`
   - `transition-transform duration-500 ease-in-out`
2. Stylować wszystkie komponenty zgodnie z designem
3. Przetestować responsywność (mobile, tablet, desktop)

### Krok 13: Obsługa dostępności

1. Dodać `aria-labels` do wszystkich interaktywnych elementów
2. Zaimplementować obsługę klawiatury (strzałki, Enter, Escape)
3. Dodać `focus management` w dialogach
4. Przetestować z czytnikiem ekranu

### Krok 14: Testowanie

1. Przetestować wszystkie interakcje użytkownika:
   - Nawigacja między fiszkami (swipe, przyciski, klawiatura)
   - Obrót karty
   - Edycja fiszki (z walidacją)
   - Usuwanie fiszki
   - Przełączanie trybów
   - Sesja powtórek
2. Przetestować wszystkie stany:
   - Loading
   - Empty
   - Error
   - Sukces
3. Przetestować optimistic updates:
   - Edycja z sukcesem
   - Edycja z błędem (cofnięcie)
   - Usuwanie z sukcesem
   - Usuwanie z błędem (przywrócenie)
4. Przetestować przypadki brzegowe:
   - Brak fiszek
   - Fiszka bez translacji
   - Zakończenie sesji powtórek
   - Błędy API

### Krok 15: Weryfikacja linterów

1. Uruchomić lintery (ESLint, TypeScript)
2. Naprawić wszystkie błędy i ostrzeżenia
3. Sprawdzić zgodność z coding practices projektu

### Krok 16: Code review i optymalizacja

1. Przeprowadzić code review
2. Zoptymalizować wydajność (jeśli potrzebne)
3. Sprawdzić zgodność z PRD i user stories
4. Weryfikacja zgodności z planem API

