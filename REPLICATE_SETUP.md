# Replicate API Setup for Local Development

## The Problem
When running locally, Replicate's servers cannot access your `localhost:3000` URLs to fetch uploaded images. This results in "Connection refused" errors.

## Solutions

### Option 1: Use ngrok (Recommended for Testing)
1. Install ngrok:
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok
   ```

2. Start your Next.js app:
   ```bash
   npm run dev
   ```

3. In another terminal, expose your local server:
   ```bash
   ngrok http 3000
   ```

4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

5. Update your `.env.local`:
   ```
   NEXT_PUBLIC_URL=https://abc123.ngrok.io
   BASE_URL=https://abc123.ngrok.io
   ```

6. Restart your Next.js app

### Option 2: Deploy to Vercel
1. Push your code to GitHub
2. Deploy to Vercel
3. Use the production URL

### Option 3: Use Public Image URLs
Instead of uploading images locally, you can:
1. Upload images to a service like Imgur, Cloudinary, or AWS S3
2. Use the public URLs directly in the application

## Environment Variables

```bash
# Required for Replicate API
REPLICATE_API_TOKEN=your_token_here

# For local development with ngrok
NEXT_PUBLIC_URL=https://your-ngrok-url.ngrok.io

# For unlimited credits in dev mode (optional)
DEV_UNLIMITED_CREDITS=true
INITIAL_USER_CREDITS=50
```

## Testing Without Replicate API

If you want to test the UI without setting up Replicate:

1. Remove `REPLICATE_API_TOKEN` from `.env.local`
2. The app will show an error when trying to generate previews
3. This is useful for UI development only

## Troubleshooting

### "Connection refused" error
- You're using localhost URLs with Replicate API
- Solution: Use ngrok or deploy to production

### "REPLICATE_API_TOKEN is not configured"
- Add your Replicate API token to `.env.local`
- Get your token from: https://replicate.com/account/api-tokens

### Credits not working
- Check `DEV_UNLIMITED_CREDITS=true` in `.env.local` for unlimited credits in dev
- Or set `INITIAL_USER_CREDITS=50` for initial credit amount