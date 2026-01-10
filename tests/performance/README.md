# Testy Wydajnościowe

## Przegląd

Testy wydajnościowe sprawdzają, czy aplikacja spełnia wymagania dotyczące czasów odpowiedzi i może obsługiwać oczekiwane obciążenie.

## Wymagania wydajnościowe

### Czasy odpowiedzi API

- **Bardzo szybkie operacje** (< 100ms): Proste zapytania z indeksami
- **Normalne operacje** (< 500ms): Typowe operacje CRUD
- **Wolne operacje** (< 1000ms): Złożone zapytania
- **Operacje zbiorcze** (< 2000ms): Wielokrotne równoczesne żądania

### Czasy ładowania stron

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## Uruchamianie testów

### Testy wydajności API

```bash
npm run test:performance
```

### Testy wydajności frontendu (Lighthouse)

```bash
# Zainstaluj Lighthouse CLI
npm install -g @lh ci/cli

# Uruchom aplikację
npm run dev

# Uruchom Lighthouse
lhci autorun
```

### Testy obciążeniowe (k6)

```bash
# Zainstaluj k6
# Windows: choco install k6
# macOS: brew install k6
# Linux: https://k6.io/docs/getting-started/installation/

# Uruchom testy obciążeniowe
k6 run tests/performance/load-test.js
```

## Struktura testów

- `api.performance.test.ts` - Testy wydajności API endpoints
- `load-test.js` - Testy obciążeniowe (k6)
- `lighthouse-config.json` - Konfiguracja Lighthouse CI
- `README.md` - Dokumentacja testów wydajnościowych

## Metryki wydajnościowe

### API Performance

| Endpoint | Operacja | Czas (target) | Status |
|----------|----------|---------------|--------|
| GET /api/flashcards | Lista (10 items) | < 500ms | ✅ |
| GET /api/flashcards | Lista (wszystkie) | < 1000ms | ✅ |
| POST /api/flashcards | Tworzenie | < 500ms | ✅ |
| PATCH /api/flashcards/:id | Aktualizacja | < 500ms | ✅ |
| DELETE /api/flashcards/:id | Usuwanie | < 500ms | ✅ |

### Load Testing

| Scenariusz | Concurrent Users | Success Rate | Avg Response Time |
|------------|------------------|--------------|-------------------|
| GET requests | 50 | > 90% | < 1000ms |
| Mixed operations | 40 | > 87.5% | < 2000ms |

### Database Performance

- Index na `user_id`: Zapytania < 100ms
- Order by `id`: Zapytania < 500ms
- RLS policies: Minimalne obciążenie (< 10ms overhead)

## Optymalizacje

### Zaimplementowane

- ✅ Indeks na kolumnie `user_id`
- ✅ Row Level Security (RLS) policies
- ✅ Paginacja (limit/offset)
- ✅ Astro Static Site Generation (SSG) dla stron statycznych
- ✅ React lazy loading dla komponentów

### Planowane

- ⏳ Cache dla częstych zapytań
- ⏳ CDN dla statycznych zasobów
- ⏳ Database connection pooling
- ⏳ Kompresja odpowiedzi (gzip/brotli)
- ⏳ Image optimization
- ⏳ Bundle size optimization

## Monitoring

### Narzędzia

- **Lighthouse CI**: Automatyczne testy wydajności frontendu
- **k6**: Testy obciążeniowe API
- **Vitest**: Testy wydajności w jednostkach
- **Supabase Dashboard**: Monitoring zapytań do bazy danych

### Alerty

Konfiguracja alertów dla:
- Czas odpowiedzi API > 1000ms
- Error rate > 5%
- Database connections > 80% puli
- Memory usage > 85%

## Best Practices

1. **Zawsze testuj na produkcyjnym sprzęcie** - Lokalne testy mogą być mylące
2. **Testuj pod obciążeniem** - Pojedyncze żądania nie pokazują prawdziwej wydajności
3. **Monitoruj bazę danych** - Często to tam jest wąskie gardło
4. **Optymalizuj od przyczyny** - Używaj profilerów zamiast zgadywać
5. **Testuj regularnie** - Wydajność może się pogarszać z czasem

## Troubleshooting

### Wolne zapytania do bazy danych

1. Sprawdź plan wykonania zapytania (EXPLAIN ANALYZE)
2. Dodaj odpowiednie indeksy
3. Rozważ denormalizację dla często wykonywanych zapytań

### Wolne czasy ładowania stron

1. Sprawdź rozmiar bundle (npm run build)
2. Użyj code splitting
3. Zoptymalizuj obrazy
4. Włącz cache dla statycznych zasobów

### Wysokie użycie pamięci

1. Sprawdź wycieki pamięci (Chrome DevTools)
2. Optymalizuj duże listy (wirtualizacja)
3. Zwiększ limity pamięci dla Node.js

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- [Web.dev Performance](https://web.dev/performance/)

