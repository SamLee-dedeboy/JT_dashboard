# Render Deployment Guide for JT Dashboard API

This guide explains how to deploy the JT Dashboard FastAPI server on Render.

## Prerequisites

- Render account (https://render.com/)
- GitHub repository with the code
- OpenAI API key (for AI features)

## Deployment Options

### Option 1: Using the Render Dashboard (Recommended)

1. **Connect your GitHub repository:**
   - Log into Render
   - Click "New +" and select "Web Service"
   - Connect your GitHub account and select this repository

2. **Configure the service:**
   - **Name:** `jt-dashboard-api`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty (will use root)
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`

3. **Set environment variables:**
   - Go to the "Environment" tab
   - Add the following variables:
     - `PYTHONUNBUFFERED` = `1`
     - `PORT` = `10000` (Render will override this automatically)
     - `OPENAI_API_KEY` = `your-openai-api-key-here`

4. **Configure auto-deployment:**
   - Enable auto-deploy from GitHub
   - The service will redeploy on every push to main branch

### Option 2: Using render.yaml (Infrastructure as Code)

If you have a `render.yaml` file in your repository root:

1. **Create a Blueprint:**
   - In Render dashboard, click "New +" and select "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file

2. **Set the OPENAI_API_KEY:**
   - After deployment, go to the service settings
   - Add `OPENAI_API_KEY` in the Environment tab
   - The value should be your OpenAI API key

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for AI features | Yes |
| `PYTHONUNBUFFERED` | Ensures Python output isn't buffered | Yes |
| `PORT` | Port for the service (auto-set by Render) | No |

## Health Check

The API includes a health check endpoint at `/health` that Render will use to monitor the service.

## Expected Deployment Time

- Initial deployment: 5-10 minutes
- Subsequent deployments: 3-5 minutes

## Service URLs

Once deployed, your API will be available at:
- **Base URL:** `https://your-service-name.onrender.com`
- **Health Check:** `https://your-service-name.onrender.com/health`
- **API Documentation:** `https://your-service-name.onrender.com/docs`

## File Structure for Deployment

Your repository should have this structure:
```
/
├── Dockerfile                 # Docker configuration
├── render.yaml               # Render service configuration (optional)
├── .dockerignore             # Files to exclude from Docker build
├── server/
│   ├── app.py                # Main FastAPI application
│   ├── requirements.txt      # Python dependencies
│   ├── routers/              # API route modules
│   └── [data directories]    # Application data
└── [other frontend files]    # Will be ignored during deployment
```

## Troubleshooting

### Common Issues

1. **Build fails with dependency errors:**
   - Check that all dependencies are in `server/requirements.txt`
   - Ensure version compatibility

2. **Service fails to start:**
   - Check the logs in Render dashboard
   - Verify `OPENAI_API_KEY` is set correctly
   - Ensure port binding is correct (app should bind to `0.0.0.0`)

3. **Health check fails:**
   - Verify `/health` endpoint is accessible
   - Check if the service is binding to the correct port

### Viewing Logs

1. Go to your service in Render dashboard
2. Click on "Logs" tab
3. Monitor real-time logs for errors

### Manual Deployment Trigger

If auto-deploy is disabled:
1. Go to your service in Render dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

## Production Considerations

### Performance
- Consider upgrading from Starter plan for production use
- Monitor resource usage in Render dashboard

### Security
- Store OpenAI API key securely in Render environment variables
- Consider implementing rate limiting
- Enable HTTPS (automatic with Render)

### Monitoring
- Set up notifications for deployment failures
- Monitor service uptime and response times
- Use Render's built-in metrics

### Scaling
- Render automatically handles scaling within plan limits
- Consider upgrading plan for higher traffic

## Cost Estimation

- **Starter Plan:** Free tier available (limited hours)
- **Standard Plan:** ~$7/month for basic production use
- **Pro Plan:** ~$20/month for higher resource needs

## Support

For deployment issues:
- Check Render documentation: https://render.com/docs
- Render community forum: https://community.render.com/
- Contact Render support for service-specific issues