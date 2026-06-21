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
    
    // Формируем даты для запроса (Eskiz требует формат YYYY-MM-DD HH:MM)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // История за последние 30 дней
    
    // Формат 2006-01-02 15:04 (без секунд)
    const formatStr = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    
    const sDate = formatStr(startDate);
    const eDate = formatStr(endDate);

    // Делаем POST запрос, так как GET возвращает 404
    const formData = new URLSearchParams();
    formData.append('start_date', sDate);
    formData.append('end_date', eDate);
    // Для Eskiz иногда page должен передаваться в URL, а иногда в body. 
    // Обычно для GET это URL, а для POST может быть и так и так.
    
    const response = await fetch(`${ESKIZ_API_URL}/message/sms/get-user-messages?page=${page}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });
    
    if (!response.ok) {
        // Читаем текст ошибки напрямую от Eskiz, чтобы понять что именно им не нравится
        const errText = await response.text();
        console.error('Eskiz 400 Error Body:', errText);
        return NextResponse.json({ error: 'Eskiz API error', details: errText }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Internal Server Error', msg: error.message }, { status: 500 });
  }
}
