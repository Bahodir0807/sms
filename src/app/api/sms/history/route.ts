import { NextResponse } from 'next/server';

const ESKIZ_API_URL = 'https://notify.eskiz.uz/api';

// Функция получения токена Eskiz
async function getEskizToken() {
  const res = await fetch(`${ESKIZ_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    }),
  });

  if (!res.ok) throw new Error('Eskiz authentication failed');
  const data = await res.json();
  return data.data.token;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    
    // Получаем токен
    const token = await getEskizToken();
    
    // Запрашиваем историю (ограничение до 20 элементов на страницу обычно настраивается на стороне API или уже встроено)
    // Метод для получения истории рассылок (у каждого пользователя может быть разным, но обычно это get-user-messages)
    const response = await fetch(`${ESKIZ_API_URL}/message/sms/get-user-messages?page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
        // Если GET не сработал, попробуем POST, так как Eskiz часто использует POST для всего
        const fallbackResponse = await fetch(`${ESKIZ_API_URL}/message/sms/get-user-messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page })
        });
        
        if (!fallbackResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch from Eskiz' }, { status: fallbackResponse.status });
        }
        
        const fallbackData = await fallbackResponse.json();
        return NextResponse.json(fallbackData);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
