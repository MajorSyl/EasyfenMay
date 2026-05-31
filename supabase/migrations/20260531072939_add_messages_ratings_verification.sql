/*
  # Add messages, ratings, and verification request tables

  1. New Tables
    - `conversations` - Pairs of users chatting about a specific listing
      - `id` (uuid, pk)
      - `listing_id` (uuid, fk listings)
      - `buyer_id` (uuid, fk profiles)
      - `agent_id` (uuid, fk profiles)
      - `last_message_at` (timestamptz)
      - `created_at` (timestamptz)
    - `messages` - Individual chat messages in a conversation
      - `id` (uuid, pk)
      - `conversation_id` (uuid, fk conversations)
      - `sender_id` (uuid, fk profiles)
      - `body` (text)
      - `created_at` (timestamptz)
    - `ratings` - Star ratings left by buyers on agent/provider listings
      - `id` (uuid, pk)
      - `listing_id` (uuid, fk listings)
      - `rater_id` (uuid, fk profiles) - the user leaving the rating
      - `rated_user_id` (uuid, fk profiles) - the agent/provider being rated
      - `stars` (smallint 1-5)
      - `comment` (text)
      - `created_at` (timestamptz)
    - `verification_requests` - Users applying for the verified badge
      - `id` (uuid, pk)
      - `user_id` (uuid, fk profiles, unique)
      - `id_type` (text) - national_id, passport, drivers_license
      - `id_number` (text)
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)

  2. Functions/RPC
    - `increment_listing_views(item_id uuid)` - safely increment views_count

  3. Security
    - RLS enabled on all new tables
    - Conversations: readable by participants only
    - Messages: readable by conversation participants only
    - Ratings: public read, authenticated insert (one per listing per user)
    - Verification requests: owner read/insert
*/

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(listing_id, buyer_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

CREATE POLICY "Buyers can start conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update last_message_at"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = agent_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = agent_id);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can read messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

-- Ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  rater_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rated_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stars smallint NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(listing_id, rater_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are publicly visible"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can leave a rating"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can update their own rating"
  ON public.ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = rater_id)
  WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can delete their own rating"
  ON public.ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = rater_id);

-- Verification Requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  id_type text NOT NULL DEFAULT 'national_id',
  id_number text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification request"
  ON public.verification_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit a verification request"
  ON public.verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RPC: increment listing views atomically
CREATE OR REPLACE FUNCTION public.increment_listing_views(item_id uuid)
RETURNS void AS $$
  UPDATE public.listings SET views_count = views_count + 1 WHERE id = item_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON public.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ratings_listing ON public.ratings(listing_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user ON public.ratings(rated_user_id);
