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
    
    // Формируем даты для запроса (Eskiz требует start_date и end_date для истории)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // История за последние 30 дней
    
    const formatStr = (d: Date) => d.toISOString().split('T')[0] + ' 00:00:00';
    const sDate = formatStr(startDate);
    const eDate = endDate.toISOString().split('T')[0] + ' 23:59:59';
    
    const params = new URLSearchParams({
      page: page,
      start_date: sDate,
      end_date: eDate
    });

    const response = await fetch(`${ESKIZ_API_URL}/message/sms/get-user-messages?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
        // Если GET не сработал, пробуем POST с параметрами в body
        const fallbackResponse = await fetch(`${ESKIZ_API_URL}/message/sms/get-user-messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              page: parseInt(page),
              start_date: sDate,
              end_date: eDate
            })
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
