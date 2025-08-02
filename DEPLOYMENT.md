# Deployment Guide - Vercel

This guide will help you deploy your portfolio site to Vercel at the domain `jasperhall.work`.

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Domain**: Have access to `jasperhall.work` domain

## Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your portfolio site

## Step 2: Configure Project Settings

### Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `portfolio-site` (if your Next.js app is in a subdirectory)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables
No environment variables are required for this project.

## Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be available at a Vercel-provided URL

## Step 4: Configure Custom Domain

1. Go to your project dashboard in Vercel
2. Navigate to "Settings" → "Domains"
3. Add your domain: `jasperhall.work`
4. Configure DNS settings as instructed by Vercel

### DNS Configuration

Add these records to your domain's DNS settings:

```
Type: A
Name: @
Value: 76.76.19.19
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 5: Automatic Deployments

Once configured, Vercel will automatically deploy your site whenever you push changes to your main branch.

### Manual Deployment

To deploy manually:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Step 6: Performance Optimization

### Enable Analytics (Optional)
1. Go to project settings
2. Enable Vercel Analytics
3. Add analytics code to your app

### Image Optimization
- Images are automatically optimized by Next.js
- External images from `freight.cargo.site` are configured in `next.config.js`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Image Loading Issues**
   - Ensure external domains are added to `next.config.js`
   - Check image URLs are accessible

3. **Domain Issues**
   - Verify DNS settings are correct
   - Wait for DNS propagation (can take up to 48 hours)

### Performance Monitoring

Monitor your site's performance using:
- Vercel Analytics
- Google PageSpeed Insights
- WebPageTest

## Maintenance

### Regular Updates
- Keep Next.js and dependencies updated
- Monitor for security vulnerabilities
- Test locally before deploying

### Backup Strategy
- Your code is backed up in GitHub
- Vercel provides automatic backups
- Consider backing up any custom assets

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Contact Vercel support if needed

For code issues:
1. Test locally first
2. Check TypeScript compilation
3. Review browser console for errors 