import { http, HttpResponse } from 'msw';

// Example API handlers for testing
export const handlers = [
  // Mock flashcards API
  http.get('/api/flashcards', () => {
    return HttpResponse.json([
      {
        id: '1',
        front: 'Test front',
        back: 'Test back',
        created_at: new Date().toISOString(),
      },
    ]);
  }),

  // Mock create flashcard
  http.post('/api/flashcards', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: '2',
        ...(body as object),
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Mock auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ success: true }, { status: 200 });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),
];

