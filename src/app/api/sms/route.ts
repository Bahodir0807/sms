import { NextResponse } from 'next/server';
import { SmsPayload, SmsMessage } from '@/types/sms';

const ESKIZ_API_URL = 'https://notify.eskiz.uz/api';

// Временное хранение токена в памяти (Node.js инстанс)
let cachedToken: string | null = null;

// Функция получения/обновления JWT-токена Eskiz
async function getEskizToken() {
  if (cachedToken) return cachedToken;

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
  cachedToken = data.data.token;
  return cachedToken;
}

export async function POST(request: Request) {
  try {
    const { phones, text }: SmsPayload = await request.json();

    if (!phones?.length || !text) {
      return NextResponse.json({ error: 'Заполните поля' }, { status: 400 });
    }

    const token = await getEskizToken();

    // Eskiz хавает номера в формате 998901234567 (без знака +)
    const sanitizedPhones = phones.map(p => p.replace('+', ''));

    const results: SmsMessage[] = [];

    const requests = sanitizedPhones.map(async (phone) => {
      try {
        const response = await fetch(`${ESKIZ_API_URL}/message/sms/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile_phone: phone,
            message: text,
            from: '4546', // Дефолтное альфа-имя Eskiz. Если есть свое — впиши сюда.
          }),
        });

        const resData = await response.json();

        return {
          id: resData.id || `sms_${Math.random().toString(36).substring(2, 7)}`,
          phone: `+${phone}`,
          text,
          status: response.ok && resData.status === 'waiting' ? 'sent' : 'failed' as const,
          createdAt: new Date().toISOString(),
        };
      } catch (err) {
        return {
          id: `sms_${Math.random().toString(36).substring(2, 7)}`,
          phone: `+${phone}`,
          text,
          status: 'failed' as const,
          createdAt: new Date().toISOString(),
        };
      }
    });

    const settledRequests = await Promise.all(requests);
    return NextResponse.json(settledRequests);

  } catch (error) {
    console.error('Eskiz API Error:', error);
    // Если токен протух, сбрасываем кэш, чтобы следующий запрос обновил его
    cachedToken = null; 
    return NextResponse.json({ error: 'Ошибка при отправке через Eskiz' }, { status: 500 });
  }
}