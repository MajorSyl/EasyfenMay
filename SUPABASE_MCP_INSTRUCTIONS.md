# Supabase MCP Server Instructions

Instruct the Supabase MCP server to implement the following relational database layout exactly:

## Types & Enums
- Create enum `user_role` ('buyer', 'agent', 'service_provider').
- Create enum `listing_type` ('property', 'service').
- Create enum `listing_status` ('active', 'sold', 'rented', 'inactive').
- Create enum `payment_method` ('orange_money', 'afrimoney', 'card').

## Tables
1. `profiles`: `id` (UUID, PK linked to auth.users), `full_name` (text), `phone_number` (text), `role` (`user_role`), `is_verified` (boolean, default false), `created_at` (timestamp).
2. `listings`: `id` (UUID, PK), `user_id` (UUID, FK to profiles), `listing_type` (`listing_type`), `title` (text), `description` (text), `price` (numeric), `location_name` (text), `images` (text array), `is_premium` (boolean, default false), `views_count` (int, default 0), `inquiries_count` (int, default 0), `status` (`listing_status`, default 'active'), `created_at` (timestamp).
   - *Property-specific fields (nullable):* `category` (text: house/land/commercial), `bedrooms` (int), `bathrooms` (int), `land_size` (text, e.g., "2 town lots").
   - *Service-specific fields (nullable):* `service_type` (text), `rate_type` (text: hourly/daily/project), `years_experience` (int), `license_number` (text).
3. `saved_listings`: `user_id` (UUID, FK to profiles), `listing_id` (UUID, FK to listings), Primary Key is composite (`user_id`, `listing_id`).
4. `inquiries`: `id` (UUID, PK), `listing_id` (UUID, FK), `buyer_id` (UUID, FK), `message` (text), `status` (text), `created_at`.
5. `payments`: `id` (UUID, PK), `user_id` (UUID, FK), `amount` (numeric), `payment_method` (`payment_method`), `payment_status` (text), `transaction_id` (text), `plan_type` (text), `created_at`.

## Storage
- Create a public storage bucket named `listing-images`.

## Row Level Security (RLS) Rules
- Enable RLS on all tables.
- `listings`: Public read access for 'active' status. Insert/Update allowed only if authenticated user's ID matches `user_id`.
- `profiles`: Public read. Update allowed only if authenticated user's ID matches `id`.
- `saved_listings` & `inquiries`: Read/Write isolated strictly to the owner (`user_id` / `buyer_id`).
- `payments`: Read/Write isolated strictly to the owner (`user_id`).
