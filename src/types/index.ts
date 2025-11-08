export interface Session {
  id: string;
  token: string;
  expires_at: string;
}

export interface Response {
  success: boolean;
  message: string;
  data: unknown;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
}

export interface Hub {
  id: string;
  name: string;
  location: string;
  description: string;
  contact_phone: string;
}

export interface Profile {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  password?: string;
  role: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  session?: string;
}

export interface SensorReading {
  id: string;
  hub_id: string;
  temperature: number;
  humidity: number;
  recorded_at: string;
  created_at: string;
}
