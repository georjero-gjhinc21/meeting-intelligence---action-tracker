<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b9016349-3130-4453-b953-289ac8be92b3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database Setup

This application uses Supabase for data persistence. To set up the database:

1. Create a Supabase project at https://supabase.com
2. Copy the SQL from `supabase/migrations/0001_initial.sql`
3. Paste it into the SQL editor in your Supabase dashboard and run it
4. This will create the `meetings` and `action_items` tables with Row Level Security enabled
5. (Optional) Generate TypeScript types by running `npx supabase gen types typescript --linked > src/types/database.ts`

## Environment Variables

Create a `.env.local` file based on `.env.example` with:
- `GEMINI_API_KEY`: Your Gemini API key (for local development with `vercel dev`)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Development Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript type checking
