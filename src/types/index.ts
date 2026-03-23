export type UserType = 'brand' | 'bar'

export interface User {
  id: string
  clerk_id: string
  user_type: UserType
  business_name: string
  city: string
  state: string
  description?: string
  logo_url?: string
  created_at: string
}

export interface Product {
  id: string
  brand_id: string
  name: string
  category: 'Beer' | 'Wine' | 'Spirits' | 'RTD'
  subcategory: string
  abv: number
  price_min?: number
  price_max?: number
  description: string
  image_url?: string
  availability: 'Local' | 'Regional' | 'National'
  is_featured: boolean
  created_at: string
  brand?: User
  view_count?: number
}

export interface Request {
  id: string
  bar_id: string
  brand_id: string
  product_id: string
  message: string
  quantity_interest?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  product?: Product
  bar?: User
  brand?: User
}

export interface Conversation {
  id: string
  brand_id: string
  bar_id: string
  created_at: string
  brand?: User
  bar?: User
  last_message?: Message
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: User
}

export interface SavedProduct {
  id: string
  bar_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Subscription {
  id: string
  brand_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
}

export const CATEGORIES = ['Beer', 'Wine', 'Spirits', 'RTD'] as const

export const SUBCATEGORIES: Record<string, string[]> = {
  Beer: ['IPA', 'Hazy IPA', 'Double IPA', 'Lager', 'Pilsner', 'Stout', 'Ale'],
  Spirits: ['Vodka', 'Tequila', 'Whiskey', 'Bourbon', 'Gin', 'Rum'],
  Wine: ['Red', 'White', 'Rosé', 'Sparkling'],
  RTD: ['Canned Cocktail', 'Hard Seltzer', 'Hard Tea', 'Other'],
}

export const AVAILABILITY_OPTIONS = ['Local', 'Regional', 'National'] as const
export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
]
