import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string ?? 'https://nxsvtpnyyblrsdooebwy.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Зворотна сумісність
export type CarAd = Car;
export type OrderType = 'buyback' | 'selection';
export interface Order {
  id: string;
  user_id?: string;
  type: OrderType;
  phone: string;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  details?: any;
  created_at: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Currency = 'USD' | 'UAH' | 'EUR';
export type EngineType = 'бензин' | 'дизель' | 'газ' | 'електро' | 'гібрид';
export type Transmission = 'механіка' | 'автомат' | 'варіатор' | 'робот';
export type DriveType = 'передній' | 'задній' | 'повний';
export type CarStatus = 'draft' | 'moderation' | 'active' | 'paused' | 'sold' | 'hidden' | 'archived' | 'rejected';
export type CarBadge = 'нове' | 'вигідно' | 'терміново' | 'ексклюзив' | null;
export type LeadType = 'підбір' | 'викуп' | 'покупка' | 'консультація';
export type LeadScore = 'гарячий' | 'теплий' | 'холодний';
export type LeadStatus = 'новий' | 'в роботі' | 'закрито';

export interface Car {
  id: number;
  title: string;
  price: number;
  currency: Currency;
  brand: string;
  model: string;
  generation?: string;
  year: number;
  body_type?: string;
  engine_volume?: number;
  engine_type?: EngineType;
  power_hp?: number;
  transmission?: Transmission;
  drive_type?: DriveType;
  fuel_consumption?: number;
  mileage: number;
  condition?: string;
  vin?: string;
  owners_count?: number;
  service_history?: boolean;
  trust_score?: number;
  city: string;
  region?: string;
  country?: string;
  description?: string;
  description_raw?: string;
  is_checked?: boolean;
  is_top?: boolean;
  is_urgent?: boolean;
  is_exchange?: boolean;
  is_credit?: boolean;
  badge?: CarBadge;
  seller_name?: string;
  seller_phone?: string;
  seller_telegram?: string;
  views_count?: number;
  clicks_call?: number;
  clicks_message?: number;
  seo_title?: string;
  seo_description?: string;
  seo_slug?: string;
  status: CarStatus;
  created_at: string;
  updated_at: string;
  // joined
  car_images?: CarImage[];
  // legacy fields (old schema compatibility)
  images?: string[];
  phone?: string;
  telegram?: string;
  number_of_owners?: number;
  exchange?: boolean;
  credit?: boolean;
}

export interface CarImage {
  id: number;
  car_id: number;
  url: string;
  url_webp?: string;
  alt?: string;
  is_cover?: boolean;
  sort_order?: number;
}

export interface CarPriceHistory {
  id: number;
  car_id: number;
  price: number;
  currency: string;
  date: string;
}

export interface Lead {
  id: number;
  type: LeadType;
  name: string;
  phone: string;
  budget?: string;
  car_id?: number;
  message?: string;
  source?: string;
  score?: LeadScore;
  status: LeadStatus;
  notes?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  phone?: string;
  name?: string;
  telegram_chat?: string;
  favorites?: number[];
  viewed?: number[];
  subscriptions?: object[];
  created_at: string;
}

export interface SeoPage {
  id: number;
  slug: string;
  h1: string;
  seo_title: string;
  seo_desc: string;
  content?: string;
  params?: object;
  is_indexed?: boolean;
  created_at: string;
}
