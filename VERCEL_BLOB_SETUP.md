# Vercel Blob Setup for Local Development

This guide will help you set up Vercel Blob storage for image uploads, which solves the localhost issue with Replicate API.

## Quick Setup

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Link Your Project to Vercel
```bash
vercel link
```
Follow the prompts to:
- Select your scope (personal or team)
- Link to existing project or create new one

### 3. Create a Blob Store
```bash
vercel blob add
```
This will:
- Create a new blob store
- Automatically add the token to your project

### 4. Get Your Token (if needed)
If the token wasn't added automatically:
1. Go to https://vercel.com/dashboard/stores
2. Click on your blob store
3. Go to the ".env.local" tab
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 5. Add to `.env.local`
```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# Replicate API
REPLICATE_API_TOKEN=r8_xxxxxxxxxx

# Optional: Development settings
DEV_UNLIMITED_CREDITS=true
INITIAL_USER_CREDITS=50
```

### 6. Restart Your Dev Server
```bash
npm run dev
```

## How It Works

1. When you upload an image, it goes to Vercel Blob storage
2. Vercel Blob returns a public URL (like `https://xxxxx.public.blob.vercel-storage.com/tattoo-previews/...`)
3. This URL is sent to Replicate API
4. Replicate can access the image from anywhere
5. Preview generation works! 🎉

## Testing

1. Go to http://localhost:3000/studio
2. Upload a body photo
3. Upload a tattoo design
4. Click "Generate Preview"
5. Check console logs to see the Vercel Blob URLs being used

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not configured"
- Make sure you've added the token to `.env.local`
- Restart your dev server after adding the token

### "Failed to upload image"
- Check that your Vercel Blob store is active
- Verify the token is correct
- Check Vercel dashboard for storage usage/limits

### Images still showing localhost URLs
- Clear your browser cache
- Make sure the upload actually completed (check network tab)
- Verify the response contains a URL starting with `https://`

## Benefits

✅ Works locally without ngrok  
✅ Images are publicly accessible  
✅ Works with Replicate API  
✅ Same setup works in production  
✅ Free tier includes 1GB storage  

## Costs

- **Free Tier**: 1GB storage, 1GB bandwidth per month
- **Pro**: $20/month for 100GB storage
- Images are automatically deleted after 30 days on free tier (configurable)

## Alternative: Use Public URLs Directly

If you don't want to set up Vercel Blob, you can:
1. Upload images to services like:
   - Imgur (free, no account needed)
   - Cloudinary (free tier available)
   - AWS S3 (pay as you go)
2. Use those URLs directly in the app instead of uploading files