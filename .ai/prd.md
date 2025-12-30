# Dokument wymagań produktu (PRD) - Aplikacja Fiszki Edukacyjne z AI

## 1. Przegląd produktu

### 1.1 Nazwa produktu
Aplikacja Fiszki Edukacyjne z AI

### 1.2 Cel produktu
Aplikacja webowa umożliwiająca szybkie tworzenie fiszek edukacyjnych poprzez wklejanie tekstu i elastyczny wybór zakresu treści (cały tekst lub wybrane słowa). Produkt rozwiązuje problem czasochłonnego manualnego tworzenia fiszek, oferując intuicyjny interfejs z możliwością tworzenia fiszek z całego tekstu lub pojedynczych słów poprzez interaktywne kliknięcie.

### 1.3 Grupa docelowa
Główną grupą docelową są studenci i osoby uczące się, które potrzebują efektywnego narzędzia do tworzenia fiszek do nauki języków obcych lub innych przedmiotów wymagających zapamiętywania informacji w formie par klucz-wartość.

### 1.4 Platforma
Aplikacja webowa (responsive design), dostępna przez przeglądarkę internetową. W wersji MVP brak dedykowanych aplikacji mobilnych.

### 1.5 Model biznesowy
Wersja MVP jest całkowicie darmowa, bez limitów na liczbę fiszek i generowań. Brak monetyzacji w pierwszej wersji produktu.

## 2. Problem użytkownika

### 2.1 Główny problem
Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition. Użytkownicy potrzebują narzędzia, które pozwoli im szybko przekształcić tekst źródłowy w fiszki gotowe do nauki.

### 2.2 Szczegółowy opis problemu
- Użytkownicy muszą ręcznie przepisywać treść z materiałów źródłowych do formatu fiszek
- Proces wyboru, które fragmenty tekstu powinny stać się fiszkami, jest żmudny i czasochłonny
- Brak elastyczności w wyborze zakresu treści - użytkownicy chcą mieć możliwość tworzenia fiszek zarówno z całych zdań, jak i z pojedynczych słów
- Konieczność ręcznego wpisywania translacji lub znaczeń dla każdej fiszki
- Brak szybkiego sposobu na przetworzenie krótkich fragmentów tekstu w gotowe fiszki

### 2.3 Wartość dla użytkownika
Aplikacja rozwiązuje problem poprzez:
- Umożliwienie wklejania tekstu (do 200 znaków) i szybkiego tworzenia fiszek
- Interaktywny wybór zakresu treści - możliwość kliknięcia na wybrane słowa lub wyboru całego tekstu
- Możliwość dodania translacji/znaczenia podczas tworzenia fiszki
- Prosty, intuicyjny interfejs z kartami, który ułatwia naukę
- Integracja z prostym systemem powtórek w losowej kolejności

## 3. Wymagania funkcjonalne

### 3.1 Tworzenie fiszek

#### 3.1.1 Wklejanie tekstu
- Użytkownik może wkleić tekst do pola tekstowego
- Maksymalna długość tekstu: 200 znaków
- Tekst jest wyświetlany w interaktywnym obszarze, gdzie każde słowo można kliknąć

#### 3.1.2 Wybór zakresu treści
- Użytkownik może wybrać cały tekst jako jedną fiszkę
- Użytkownik może kliknąć na pojedyncze słowa w tekście, aby utworzyć z nich fiszki
- Możliwość wyboru wielu słów poprzez kolejne kliknięcia
- Wybrane słowa są wizualnie wyróżnione

#### 3.1.3 Dodawanie translacji/znaczenia
- Podczas tworzenia fiszki użytkownik może wpisać translację lub znaczenie
- Pole translacji jest opcjonalne, ale zalecane
- Użytkownik sam określa język źródłowy i docelowy (brak automatycznego wykrywania języka)

#### 3.1.4 Akceptacja fiszki
- Po wyborze tekstu i ewentualnym dodaniu translacji, użytkownik musi kliknąć przycisk "Accept", aby zaakceptować fiszkę
- Fiszka jest zapisywana dopiero po kliknięciu "Accept"
- Fiszki nie są automatycznie usuwane po dodaniu - pozostają dostępne do edycji

### 3.2 Przeglądanie fiszek

#### 3.2.1 Format wyświetlania
- Fiszki wyświetlane są jako karty (card-based UI)
- Na awersie karty wyświetlany jest tekst źródłowy (słowo/fraza)
- Kliknięcie w kartę powoduje obrót i pokazanie rewersu z translacją
- Karty można przesuwać na bok (swipe gesture) w celu nawigacji

#### 3.2.2 Organizacja fiszek
- Wszystkie fiszki są przechowywane w jednym "koszu" (brak organizacji w zestawy/kategorie)
- Brak możliwości tagowania lub kategoryzowania fiszek
- Prosta, płaska struktura danych

### 3.3 Edycja i usuwanie fiszek

#### 3.3.1 Edycja
- Fiszki można edytować w dowolnym momencie podczas przeglądania
- Możliwa jest zmiana zarówno treści źródłowej (słowo/fraza), jak i translacji/znaczenia
- Edycja odbywa się inline (w miejscu wyświetlania)
- Podczas edycji treści źródłowej obowiązuje limit 200 znaków

#### 3.3.2 Usuwanie
- Fiszki można usuwać w dowolnym momencie
- Usunięcie jest trwałe (brak kosza na śmieci w MVP)

### 3.4 System powtórek

#### 3.4.1 Algorytm powtórek
- Prosty system losowej kolejności
- Fiszki wyświetlane są w losowej kolejności
- Fiszki nie powtarzają się, aż użytkownik przejdzie przez wszystkie dostępne fiszki
- Po przejściu przez wszystkie fiszki, cykl się resetuje i rozpoczyna się od nowa w losowej kolejności
- Brak zaawansowanego algorytmu spaced repetition w MVP

### 3.5 System kont użytkowników

#### 3.5.1 Rejestracja
- Minimalistyczny proces rejestracji wymagający tylko loginu i hasła
- Brak weryfikacji email
- Brak dodatkowych pól w formularzu rejestracji

#### 3.5.2 Logowanie
- Logowanie za pomocą loginu i hasła
- Sesja użytkownika jest utrzymywana po zalogowaniu
- Możliwość wylogowania

#### 3.5.3 Przechowywanie danych
- Wszystkie fiszki są przechowywane na koncie użytkownika
- Fiszki są dostępne tylko dla użytkownika, który je utworzył
- Brak możliwości eksportu danych w MVP

### 3.6 Obsługa błędów

#### 3.6.1 Wyświetlanie błędów
- W przypadku wystąpienia błędu, wyświetlany jest komunikat na ekranie z opisem problemu
- Przykładowe komunikaty: "Błąd API", "Nie udało się zapisać fiszki", "Nieprawidłowe dane logowania"
- Komunikaty błędów są czytelne i zrozumiałe dla użytkownika

#### 3.6.2 Walidacja danych
- Walidacja długości tekstu (maksymalnie 200 znaków)
- Walidacja wymaganych pól podczas rejestracji i logowania
- Walidacja formatu danych przed zapisaniem fiszki

### 3.7 Interfejs użytkownika

#### 3.7.1 Responsywność
- Aplikacja działa na urządzeniach mobilnych poprzez responsive web design
- Interfejs dostosowuje się do rozmiaru ekranu
- Swipe gestures działają zarówno na urządzeniach dotykowych, jak i z myszką

#### 3.7.2 Elementy interfejsu
- Pole tekstowe do wklejania tekstu
- Interaktywny obszar wyświetlania tekstu z możliwością klikania słów
- Przycisk "Accept" do akceptacji fiszki
- Karty z efektem obrotu przy kliknięciu
- Przyciski do edycji i usuwania fiszek
- Formularz rejestracji i logowania

## 4. Granice produktu

### 4.1 Funkcjonalności wykluczone z MVP

#### 4.1.1 Zaawansowane algorytmy
- Własny, zaawansowany algorytm spaced repetition (jak SuperMemo, Anki)
- System oceniania trudności fiszek
- Adaptacyjne interwały powtórek

#### 4.1.2 Import i eksport
- Import wielu formatów (PDF, DOCX, TXT, itp.)
- Eksport danych użytkownika (brak możliwości pobrania fiszek)
- Import z innych platform edukacyjnych

#### 4.1.3 Organizacja i współdzielenie
- Organizowanie fiszek w zestawy/kategorie/decki
- Tagowanie fiszek
- Współdzielenie zestawów fiszek między użytkownikami
- Funkcje społecznościowe

#### 4.1.4 Integracje
- Integracje z innymi platformami edukacyjnymi
- Integracja z kalendarzami
- API dla zewnętrznych aplikacji

#### 4.1.5 Multimedia
- Obrazy w fiszkach
- Audio w fiszkach
- Wideo w fiszkach
- Tylko format tekstowy w MVP

#### 4.1.6 Zaawansowane funkcje AI
- Automatyczne wykrywanie języka tekstu źródłowego i docelowego
- Automatyczne generowanie translacji bez interwencji użytkownika
- Sugestie kontekstowe dla translacji

#### 4.1.7 Aplikacje mobilne
- Dedykowane aplikacje mobilne (iOS, Android)
- W MVP tylko aplikacja webowa z responsive design

#### 4.1.8 Weryfikacja i bezpieczeństwo
- Weryfikacja email podczas rejestracji
- Dwuskładnikowe uwierzytelnianie
- Reset hasła przez email

#### 4.1.9 Statystyki i analityka
- Zaawansowane statystyki nauki
- Wykresy postępu
- Raporty efektywności nauki
- W MVP brak szczegółowych statystyk (możliwa podstawowa liczba fiszek)

#### 4.1.10 Wyszukiwanie i filtrowanie
- Wyszukiwanie fiszek wśród wszystkich
- Filtrowanie fiszek według różnych kryteriów
- Sortowanie fiszek

### 4.2 Ograniczenia techniczne

#### 4.2.1 Limity
- Maksymalna długość tekstu wejściowego: 200 znaków
- Brak limitów na liczbę fiszek (nieograniczona)
- Brak limitów na liczbę generowań przez AI

#### 4.2.2 Platforma
- Tylko aplikacja webowa (brak aplikacji natywnych)
- Wymagana nowoczesna przeglądarka internetowa
- Brak wsparcia dla przeglądarek starszych niż 2 lata

## 5. Historyjki użytkowników

### US-001: Rejestracja nowego użytkownika
Tytuł: Rejestracja konta użytkownika

Opis: Jako nowy użytkownik chcę zarejestrować konto, aby móc korzystać z aplikacji i przechowywać swoje fiszki.

Kryteria akceptacji:
- Użytkownik może wejść na stronę rejestracji
- Formularz rejestracji zawiera tylko pola: login i hasło
- Użytkownik może wprowadzić login (minimalna długość: 3 znaki)
- Użytkownik może wprowadzić hasło (minimalna długość: 6 znaków)
- Po wypełnieniu formularza i kliknięciu przycisku rejestracji, konto jest tworzone
- Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany
- W przypadku błędu (np. login już istnieje) wyświetlany jest odpowiedni komunikat
- Brak wymagania weryfikacji email

### US-002: Logowanie użytkownika
Tytuł: Logowanie do konta

Opis: Jako zarejestrowany użytkownik chcę zalogować się do swojego konta, aby uzyskać dostęp do swoich fiszek.

Kryteria akceptacji:
- Użytkownik może wejść na stronę logowania
- Formularz logowania zawiera pola: login i hasło
- Użytkownik może wprowadzić swój login
- Użytkownik może wprowadzić swoje hasło
- Po wprowadzeniu poprawnych danych i kliknięciu przycisku logowania, użytkownik jest zalogowany
- Po zalogowaniu użytkownik jest przekierowany do głównego widoku aplikacji
- W przypadku nieprawidłowych danych wyświetlany jest komunikat błędu: "Nieprawidłowy login lub hasło"
- Sesja użytkownika jest utrzymywana po zalogowaniu

### US-003: Wylogowanie użytkownika
Tytuł: Wylogowanie z konta

Opis: Jako zalogowany użytkownik chcę móc wylogować się z konta, aby zabezpieczyć swoje dane na współdzielonym urządzeniu.

Kryteria akceptacji:
- Zalogowany użytkownik widzi przycisk/opcję wylogowania
- Po kliknięciu wylogowania użytkownik jest wylogowany
- Po wylogowaniu użytkownik jest przekierowany do strony logowania
- Sesja użytkownika jest zakończona
- Po wylogowaniu użytkownik nie ma dostępu do swoich fiszek bez ponownego zalogowania

### US-004: Wklejanie tekstu do tworzenia fiszek
Tytuł: Wklejanie tekstu źródłowego

Opis: Jako zalogowany użytkownik chcę wkleić tekst, aby móc z niego utworzyć fiszki.

Kryteria akceptacji:
- Użytkownik widzi pole tekstowe do wklejania tekstu
- Użytkownik może wkleić tekst do pola (Ctrl+V lub prawy przycisk myszy)
- Maksymalna długość tekstu to 200 znaków
- Jeśli użytkownik wklei tekst dłuższy niż 200 znaków, wyświetlany jest komunikat błędu: "Tekst jest zbyt długi. Maksymalna długość to 200 znaków"
- Po wklejeniu tekstu, tekst jest wyświetlany w interaktywnym obszarze poniżej pola tekstowego
- Każde słowo w wyświetlonym tekście jest klikalne

### US-005: Tworzenie fiszki z całego tekstu
Tytuł: Utworzenie fiszki z całego wklejonego tekstu

Opis: Jako użytkownik chcę utworzyć fiszkę z całego wklejonego tekstu, aby móc uczyć się całych fraz lub zdań.

Kryteria akceptacji:
- Po wklejeniu tekstu użytkownik widzi przycisk "Utwórz fiszkę z całego tekstu" lub podobny
- Po kliknięciu przycisku, użytkownik widzi formularz z polem na translację/znaczenie
- Pole translacji jest opcjonalne (użytkownik może je pominąć)
- Użytkownik może wpisać translację lub znaczenie
- Użytkownik może określić język źródłowy i docelowy (np. przez wybór z listy)
- Po kliknięciu "Accept" fiszka jest zapisywana
- Po zapisaniu fiszka jest dostępna w liście fiszek użytkownika
- Tekst źródłowy pozostaje w polu tekstowym (nie jest usuwany)

### US-006: Tworzenie fiszki z pojedynczego słowa
Tytuł: Utworzenie fiszki z pojedynczego słowa poprzez kliknięcie

Opis: Jako użytkownik chcę kliknąć na pojedyncze słowo w tekście, aby utworzyć z niego fiszkę.

Kryteria akceptacji:
- Po wklejeniu tekstu, każde słowo w interaktywnym obszarze jest klikalne
- Po kliknięciu na słowo, słowo jest wizualnie wyróżnione (np. podświetlone)
- Po kliknięciu na słowo, użytkownik widzi formularz z wybranym słowem i polem na translację
- Pole translacji jest opcjonalne
- Użytkownik może wpisać translację lub znaczenie
- Użytkownik może określić język źródłowy i docelowy
- Po kliknięciu "Accept" fiszka jest zapisywana z wybranym słowem jako tekst źródłowy
- Po zapisaniu fiszka jest dostępna w liście fiszek
- Słowo pozostaje klikalne, można utworzyć kolejną fiszkę z tego samego słowa

### US-007: Tworzenie wielu fiszek z różnych słów
Tytuł: Utworzenie wielu fiszek poprzez kolejne kliknięcia na różne słowa

Opis: Jako użytkownik chcę utworzyć wiele fiszek z różnych słów w tekście poprzez kolejne kliknięcia.

Kryteria akceptacji:
- Użytkownik może kliknąć na pierwsze słowo i utworzyć z niego fiszkę
- Po zapisaniu pierwszej fiszki, użytkownik może kliknąć na kolejne słowo
- Każde słowo może być użyte do utworzenia osobnej fiszki
- Można utworzyć wiele fiszek z tego samego tekstu źródłowego
- Każda fiszka jest niezależna i zapisywana osobno
- Tekst źródłowy pozostaje dostępny do dalszego tworzenia fiszek

### US-008: Wyświetlanie fiszek jako karty
Tytuł: Przeglądanie fiszek w formie kart

Opis: Jako użytkownik chcę przeglądać moje fiszki w formie kart, aby móc je łatwo przeglądać i uczyć się.

Kryteria akceptacji:
- Fiszki są wyświetlane jako karty (card-based UI)
- Na awersie karty widoczny jest tekst źródłowy (słowo/fraza)
- Karty są wyświetlane jedna na raz lub w układzie karuzeli
- Karty mają czytelny design i są łatwe do odczytania
- Wszystkie fiszki użytkownika są dostępne do przeglądania

### US-009: Obrót karty i wyświetlanie translacji
Tytuł: Odwrócenie karty, aby zobaczyć translację

Opis: Jako użytkownik chcę kliknąć w kartę, aby zobaczyć translację na rewersie.

Kryteria akceptacji:
- Po kliknięciu w kartę, karta obraca się (efekt obrotu/flip)
- Po obrocie na rewersie karty widoczna jest translacja/znaczenie
- Jeśli fiszka nie ma translacji, rewers pokazuje informację "Brak translacji" lub pozostaje pusty
- Kliknięcie ponownie obraca kartę z powrotem do awersu
- Efekt obrotu jest płynny i wizualnie przyjemny

### US-010: Przesuwanie kart na bok (swipe)
Tytuł: Nawigacja między fiszkami poprzez przesuwanie

Opis: Jako użytkownik chcę przesuwać karty na bok, aby przejść do następnej fiszki.

Kryteria akceptacji:
- Użytkownik może przesunąć kartę w lewo lub w prawo (swipe gesture)
- Po przesunięciu karty, wyświetlana jest następna fiszka
- Swipe działa zarówno na urządzeniach dotykowych (palec), jak i z myszką (przeciągnięcie)
- Przesunięcie karty jest płynne i responsywne
- Po przesunięciu ostatniej karty, wyświetlana jest pierwsza (cykliczna nawigacja) lub komunikat o zakończeniu

### US-011: System powtórek w losowej kolejności
Tytuł: Przeglądanie fiszek w losowej kolejności

Opis: Jako użytkownik chcę przeglądać moje fiszki w losowej kolejności, aby uczyć się bez przewidywalnego wzorca.

Kryteria akceptacji:
- Po rozpoczęciu sesji powtórek, fiszki są wyświetlane w losowej kolejności
- Kolejność jest różna przy każdym uruchomieniu sesji powtórek
- Fiszki nie powtarzają się w ramach jednej sesji, aż użytkownik przejdzie przez wszystkie
- Po przejściu przez wszystkie fiszki, cykl się resetuje i rozpoczyna się od nowa w nowej losowej kolejności
- Użytkownik widzi informację o liczbie pozostałych fiszek w sesji (opcjonalnie)

### US-012: Edycja treści i translacji fiszki
Tytuł: Zmiana treści źródłowej i translacji istniejącej fiszki

Opis: Jako użytkownik chcę edytować zarówno treść źródłową, jak i translację fiszki, aby poprawić lub zaktualizować informacje.

Kryteria akceptacji:
- Podczas przeglądania fiszek użytkownik widzi przycisk/ikonę edycji
- Po kliknięciu edycji, użytkownik może zmienić treść źródłową (słowo/fraza)
- Po kliknięciu edycji, użytkownik może zmienić translację/znaczenie
- Użytkownik może edytować zarówno treść źródłową, jak i translację w tym samym formularzu edycji
- Podczas edycji treści źródłowej obowiązuje limit 200 znaków
- Jeśli użytkownik wprowadzi treść źródłową dłuższą niż 200 znaków, wyświetlany jest komunikat błędu
- Edycja odbywa się inline (w miejscu wyświetlania) lub w formularzu modalnym
- Po zapisaniu zmian, zaktualizowana treść źródłowa i translacja są widoczne na karcie
- Zmiany są zapisywane natychmiast po kliknięciu "Zapisz" lub podobnego przycisku

### US-013: Usuwanie fiszki
Tytuł: Usunięcie niepotrzebnej fiszki

Opis: Jako użytkownik chcę usunąć fiszkę, której już nie potrzebuję.

Kryteria akceptacji:
- Podczas przeglądania fiszek użytkownik widzi przycisk/ikonę usuwania
- Po kliknięciu usuwania, wyświetlany jest dialog potwierdzenia: "Czy na pewno chcesz usunąć tę fiszkę?"
- Użytkownik może potwierdzić lub anulować usunięcie
- Po potwierdzeniu, fiszka jest trwale usunięta
- Usunięta fiszka znika z listy i nie jest już dostępna
- Brak możliwości przywrócenia usuniętej fiszki w MVP

### US-014: Walidacja długości tekstu
Tytuł: Sprawdzanie maksymalnej długości tekstu

Opis: Jako system chcę walidować długość wklejanego tekstu, aby zapewnić zgodność z limitami.

Kryteria akceptacji:
- System sprawdza długość tekstu przed akceptacją
- Jeśli tekst ma więcej niż 200 znaków, wyświetlany jest komunikat błędu: "Tekst jest zbyt długi. Maksymalna długość to 200 znaków"
- Użytkownik nie może zapisać fiszki z tekstem dłuższym niż 200 znaków
- Komunikat błędu jest wyświetlany natychmiast po próbie wklejenia zbyt długiego tekstu
- Pole tekstowe może wyświetlać licznik znaków (opcjonalnie)

### US-015: Obsługa błędów API
Tytuł: Wyświetlanie błędów związanych z integracją AI

Opis: Jako użytkownik chcę otrzymać informację, gdy wystąpi błąd podczas korzystania z funkcji AI lub zapisywania danych.

Kryteria akceptacji:
- W przypadku błędu API (np. problem z integracją AI) wyświetlany jest komunikat: "Błąd API. Spróbuj ponownie później"
- W przypadku błędu zapisu fiszki wyświetlany jest komunikat: "Nie udało się zapisać fiszki. Spróbuj ponownie"
- Komunikaty błędów są wyświetlane w widocznym miejscu na ekranie
- Komunikaty błędów są czytelne i zrozumiałe dla użytkownika
- Użytkownik może zamknąć komunikat błędu i spróbować ponownie

### US-016: Walidacja danych logowania
Tytuł: Sprawdzanie poprawności danych podczas logowania

Opis: Jako system chcę walidować dane logowania, aby zapewnić bezpieczeństwo kont użytkowników.

Kryteria akceptacji:
- System sprawdza, czy pole login nie jest puste
- System sprawdza, czy pole hasło nie jest puste
- Jeśli któreś pole jest puste, wyświetlany jest komunikat: "Wypełnij wszystkie pola"
- System sprawdza, czy login i hasło są poprawne
- W przypadku nieprawidłowych danych wyświetlany jest komunikat: "Nieprawidłowy login lub hasło"
- Komunikaty błędów są wyświetlane natychmiast po próbie logowania z nieprawidłowymi danymi

### US-017: Walidacja danych rejestracji
Tytuł: Sprawdzanie poprawności danych podczas rejestracji

Opis: Jako system chcę walidować dane rejestracji, aby zapewnić poprawność kont użytkowników.

Kryteria akceptacji:
- System sprawdza, czy login ma co najmniej 3 znaki
- System sprawdza, czy hasło ma co najmniej 6 znaków
- Jeśli login jest za krótki, wyświetlany jest komunikat: "Login musi mieć co najmniej 3 znaki"
- Jeśli hasło jest za krótkie, wyświetlany jest komunikat: "Hasło musi mieć co najmniej 6 znaków"
- System sprawdza, czy login nie jest już zajęty
- Jeśli login jest zajęty, wyświetlany jest komunikat: "Ten login jest już zajęty. Wybierz inny"
- Komunikaty błędów są wyświetlane natychmiast po próbie rejestracji z nieprawidłowymi danymi

### US-018: Przechowywanie fiszek na koncie użytkownika
Tytuł: Zapis fiszek przypisanych do konta użytkownika

Opis: Jako zalogowany użytkownik chcę, aby moje fiszki były zapisane na moim koncie i dostępne po ponownym zalogowaniu.

Kryteria akceptacji:
- Wszystkie fiszki utworzone przez użytkownika są zapisywane na jego koncie
- Fiszki są dostępne tylko dla użytkownika, który je utworzył
- Po wylogowaniu i ponownym zalogowaniu, wszystkie fiszki użytkownika są nadal dostępne
- Fiszki są przechowywane w sposób trwały (nie są tracone po zamknięciu przeglądarki)
- Użytkownik widzi tylko swoje własne fiszki, nie ma dostępu do fiszek innych użytkowników

### US-019: Określanie języka źródłowego i docelowego
Tytuł: Ręczne ustawienie języków dla fiszki

Opis: Jako użytkownik chcę określić język źródłowy i docelowy dla mojej fiszki, ponieważ aplikacja nie wykrywa języka automatycznie.

Kryteria akceptacji:
- Podczas tworzenia fiszki użytkownik widzi pola/selecty do wyboru języka źródłowego i docelowego
- Użytkownik może wybrać język źródłowy z listy dostępnych języków
- Użytkownik może wybrać język docelowy z listy dostępnych języków
- Języki są zapisywane wraz z fiszką
- Brak automatycznego wykrywania języka - użytkownik musi zawsze określić języki ręcznie
- Języki mogą być różne dla różnych fiszek

### US-020: Tworzenie fiszki bez translacji
Tytuł: Utworzenie fiszki z samym tekstem źródłowym

Opis: Jako użytkownik chcę utworzyć fiszkę bez translacji, jeśli chcę dodać ją później lub używać fiszki w inny sposób.

Kryteria akceptacji:
- Pole translacji podczas tworzenia fiszki jest opcjonalne
- Użytkownik może kliknąć "Accept" bez wpisania translacji
- Fiszka jest zapisywana z pustym polem translacji
- Podczas przeglądania, fiszka bez translacji wyświetla na rewersie informację "Brak translacji" lub pozostaje pusta
- Użytkownik może później edytować fiszkę i dodać translację

### US-021: Reset cyklu powtórek
Tytuł: Rozpoczęcie nowego cyklu po przejściu przez wszystkie fiszki

Opis: Jako użytkownik chcę, aby po przejściu przez wszystkie fiszki, cykl powtórek się resetował i rozpoczynał od nowa.

Kryteria akceptacji:
- Po przejściu przez wszystkie fiszki w sesji, wyświetlany jest komunikat: "Przeszedłeś przez wszystkie fiszki"
- Po zakończeniu cyklu, użytkownik może rozpocząć nowy cykl powtórek
- Nowy cykl rozpoczyna się w nowej losowej kolejności
- Wszystkie fiszki są ponownie dostępne w nowym cyklu
- Brak automatycznego rozpoczęcia nowego cyklu - użytkownik musi to zrobić ręcznie (opcjonalnie, w zależności od implementacji)

### US-022: Dostęp do aplikacji bez logowania
Tytuł: Ograniczenie dostępu do funkcji wymagających konta

Opis: Jako system chcę wymagać logowania do korzystania z głównych funkcji aplikacji, aby zapewnić bezpieczeństwo danych użytkowników.

Kryteria akceptacji:
- Użytkownik nie zalogowany może zobaczyć stronę główną/logowania
- Użytkownik nie zalogowany nie ma dostępu do funkcji tworzenia fiszek
- Użytkownik nie zalogowany nie ma dostępu do przeglądania fiszek
- Próba dostępu do chronionych funkcji bez logowania przekierowuje użytkownika do strony logowania
- Po zalogowaniu użytkownik otrzymuje dostęp do wszystkich funkcji aplikacji

## 6. Metryki sukcesu

### 6.1 Metryki produktowe

#### 6.1.1 Akceptacja fiszek wygenerowanych przez AI
Cel: 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika

Definicja: Fiszka jest uznana za zaakceptowaną, gdy użytkownik doda ją i kliknie "Accept". Metryka mierzy stosunek liczby zaakceptowanych fiszek do liczby wszystkich fiszek utworzonych przez użytkownika.

Pomiar:
- Liczba fiszek utworzonych przez użytkownika (wszystkie fiszki z kliknięciem "Accept")
- Stosunek zaakceptowanych fiszek do wszystkich utworzonych
- Docelowa wartość: minimum 75%

#### 6.1.2 Wykorzystanie AI do tworzenia fiszek
Cel: Użytkownicy tworzą 75% fiszek z wykorzystaniem AI

Definicja: Metryka mierzy, jaki procent wszystkich fiszek użytkownika został utworzony z wykorzystaniem funkcji AI (wklejanie tekstu i tworzenie fiszek) w stosunku do manualnego tworzenia.

Pomiar:
- Liczba fiszek utworzonych z wykorzystaniem wklejania tekstu i interaktywnego wyboru
- Liczba wszystkich fiszek użytkownika
- Stosunek fiszek utworzonych z AI do wszystkich fiszek
- Docelowa wartość: minimum 75%

### 6.2 Metryki użyteczności

#### 6.2.1 Czas tworzenia fiszki
Cel: Zmniejszenie czasu potrzebnego na utworzenie jednej fiszki

Definicja: Średni czas od momentu wklejenia tekstu do momentu kliknięcia "Accept" dla utworzonej fiszki.

Pomiar:
- Średni czas tworzenia fiszki przez użytkownika
- Porównanie z czasem manualnego tworzenia (benchmark)
- Docelowa wartość: redukcja czasu o minimum 50% w stosunku do manualnego tworzenia

#### 6.2.2 Wskaźnik retencji użytkowników
Cel: Utrzymanie aktywnych użytkowników

Definicja: Procent użytkowników, którzy wracają do aplikacji w ciągu 7 dni od pierwszej rejestracji.

Pomiar:
- Liczba użytkowników, którzy zalogowali się ponownie w ciągu 7 dni
- Liczba wszystkich zarejestrowanych użytkowników
- Stosunek użytkowników wracających do wszystkich
- Docelowa wartość: minimum 40% retencji 7-dniowej

### 6.3 Metryki techniczne

#### 6.3.1 Czas odpowiedzi aplikacji
Cel: Szybkie działanie interfejsu

Definicja: Średni czas odpowiedzi aplikacji na akcje użytkownika (kliknięcia, zapisywanie, ładowanie).

Pomiar:
- Średni czas odpowiedzi na akcje użytkownika
- Czas ładowania strony
- Czas zapisu fiszki
- Docelowa wartość: wszystkie akcje poniżej 2 sekund

#### 6.3.2 Wskaźnik błędów
Cel: Minimalizacja błędów w aplikacji

Definicja: Procent akcji użytkownika, które kończą się błędem.

Pomiar:
- Liczba błędów (API, walidacja, zapis)
- Liczba wszystkich akcji użytkownika
- Stosunek błędów do akcji
- Docelowa wartość: mniej niż 2% akcji kończy się błędem

### 6.4 Metryki biznesowe (dla przyszłości)

#### 6.4.1 Liczba aktywnych użytkowników
Cel: Wzrost bazy użytkowników

Definicja: Liczba unikalnych użytkowników, którzy zalogowali się w ciągu ostatnich 30 dni.

Pomiar:
- Liczba unikalnych użytkowników aktywnych w ciągu 30 dni
- Trend wzrostowy miesiąc do miesiąca
- Docelowa wartość: wzrost o minimum 20% miesiąc do miesiąca (dla MVP)

#### 6.4.2 Liczba fiszek na użytkownika
Cel: Zaangażowanie użytkowników

Definicja: Średnia liczba fiszek utworzonych przez jednego użytkownika.

Pomiar:
- Całkowita liczba fiszek w systemie
- Liczba aktywnych użytkowników
- Średnia liczba fiszek na użytkownika
- Docelowa wartość: minimum 10 fiszek na użytkownika w pierwszym miesiącu

### 6.5 Definicje i sposób pomiaru

#### 6.5.1 Okres pomiaru
- Metryki są zbierane w czasie rzeczywistym
- Raporty są generowane codziennie, tygodniowo i miesięcznie
- Okres oceny MVP: 3 miesiące od launchu

#### 6.5.2 Narzędzia pomiarowe
- Analytics do śledzenia akcji użytkowników
- Logi serwera do monitorowania błędów
- Baza danych do zliczania fiszek i użytkowników
- Narzędzia do pomiaru wydajności (czas odpowiedzi)

#### 6.5.3 Kiedy metryka jest uznana za spełnioną
- Metryka jest uznana za spełnioną, gdy osiąga docelową wartość przez minimum 2 tygodnie z rzędu
- Dla metryk procentowych: średnia z 2 tygodni musi być równa lub wyższa niż docelowa wartość
- Dla metryk czasowych: 90 percentyl musi być poniżej docelowej wartości

