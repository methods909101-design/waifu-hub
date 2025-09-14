import { createClient } from '../utils/supabase/client'

// Create a single supabase client for interacting with your database
export const supabase = createClient()

// Database types
export interface User {
  id: string
  wallet_address: string
  username: string
  created_at: string
  last_waifu_creation: string | null
  last_vote: string | null
}

export interface Waifu {
  id: string
  user_id: string
  name: string
  personality: string
  style: string
  hair_color: string
  biography: string
  character_profile: any
  video_url: string | null
  is_published: boolean
  likes: number
  dislikes: number
  created_at: string
  published_at: string | null
}

export interface Vote {
  id: string
  user_id: string
  waifu_id: string
  vote_type: 'like' | 'dislike'
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  waifu_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
