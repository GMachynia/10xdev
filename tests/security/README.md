# Testy Bezpieczeństwa

## Przegląd

Testy bezpieczeństwa sprawdzają, czy aplikacja jest odporna na popularne ataki i podatności.

## Kategorie testów

### 1. Row Level Security (RLS)

Testy sprawdzające polityki bezpieczeństwa na poziomie wierszy w bazie danych.

#### Scenariusze testowe:
- [x] Użytkownik może widzieć tylko swoje fiszki
- [x] Użytkownik może edytować tylko swoje fiszki
- [x] Użytkownik może usuwać tylko swoje fiszki
- [x] Automatyczne ustawianie `user_id` przez trigger
- [x] Niemożność zmiany `user_id` przez użytkownika

### 2. XSS (Cross-Site Scripting)

Testy sprawdzające, czy aplikacja prawidłowo sanityzuje dane wejściowe.

#### Scenariusze testowe:
- [x] Tekst źródłowy z tagami HTML jest escapowany
- [x] Translacja z tagami HTML jest escapowana
- [x] JavaScript w tekście źródłowym nie jest wykonywany
- [x] Atrybuty HTML w tekście są escapowane
- [x] URL w tekście nie powoduje przekierowania

### 3. CSRF (Cross-Site Request Forgery)

Testy sprawdzające ochronę przed atakami CSRF.

#### Scenariusze testowe:
- [x] API wymaga tokenu autoryzacji w nagłówku
- [x] Tokeny są powiązane z sesją użytkownika
- [x] Same-Site cookies są używane
- [x] Origin header jest walidowany

### 4. SQL Injection

Testy sprawdzające odporność na ataki SQL Injection.

#### Scenariusze testowe:
- [x] Supabase używa parametryzowanych zapytań (built-in)
- [x] Walidacja UUID chroni przed injection
- [x] Parametry query są sanityzowane

### 5. Autoryzacja

Testy sprawdzające poprawność mechanizmów autoryzacji.

#### Scenariusze testowe:
- [x] Endpointy wymagają autoryzacji
- [x] Tokeny JWT są walidowane
- [x] Wygasłe tokeny są odrzucane
- [x] Nieprawidłowe tokeny zwracają 401

## Konfiguracja

```bash
# Zainstaluj narzędzia do testów bezpieczeństwa
npm install --save-dev @testing-library/react @testing-library/user-event

# Uruchom testy
npm run test:security
```

## Narzędzia

### Automatyczne skanowanie

1. **OWASP ZAP** - Skanowanie podatności web
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:4321
```

2. **Snyk** - Skanowanie zależności
```bash
npm install -g snyk
snyk test
```

3. **npm audit** - Sprawdzanie podatności w pakietach
```bash
npm audit
npm audit fix
```

### Manualne testy penetracyjne

Zalecane narzędzia:
- Burp Suite
- OWASP ZAP
- Postman (dla API)

## Metryki

- Brak krytycznych i wysokich podatności
- 100% endpointów z autoryzacją
- 100% danych wejściowych walidowanych
- Wszystkie testy bezpieczeństwa przechodzą

## Checklist

### Przed release'em

- [ ] Uruchom `npm audit` i napraw wszystkie podatności
- [ ] Uruchom testy bezpieczeństwa
- [ ] Zweryfikuj polityki RLS w Supabase
- [ ] Sprawdź konfigurację CORS
- [ ] Sprawdź konfigurację cookies (HttpOnly, Secure, SameSite)
- [ ] Zweryfikuj rate limiting (jeśli zaimplementowany)
- [ ] Sprawdź zabezpieczenia przed brute-force (jeśli zaimplementowane)

## Zasoby

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [React Security Best Practices](https://react.dev/learn/escape-hatches)

