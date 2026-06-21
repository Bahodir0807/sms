export interface SmsMessage {
  id: string;
  phone: string;
  text: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
}

export interface SmsPayload {
  phones: string[];
  text: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}