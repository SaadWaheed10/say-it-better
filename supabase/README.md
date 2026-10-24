# Supabase (SayItBetter)

## What this schema stores

Progress only (for signed-in users):

- `profiles` — account profile
- `user_settings` — tone / theme / reminder prefs
- `user_progress` — placement + daily flags, mistake ids
- `test_attempts` — skill test scores
- `test_badges` — unlocked badges
- `spaced_review_items` — review queue
- `situation_scores` — situation challenge scores

**Not in Supabase (stays in the app):** question bank, drafts, message history, AI models.

## How to apply

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. **SQL Editor** → New query  
3. Paste all of [`migrations/001_progress_schema.sql`](./migrations/001_progress_schema.sql)  
4. **Run**  
5. Confirm under **Table Editor**: tables appear and RLS is on  

## After that

- New sign-ups auto-create `profiles`, `user_settings`, and `user_progress`  
- App sync code (next step) will upsert attempts / review / settings when signed in  

## Privacy note

`situation_scores` can store `user_answer` / `model_answer`. If you want scores only, leave those columns null when syncing from the app.
