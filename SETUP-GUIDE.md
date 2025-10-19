# Google Search Console MCP Server - Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Cloud account with Search Console access
- Your Search Console properties ready

## Step 1: Clone & Install Dependencies

```bash
cd mcp-servers
npm install
```

## Step 2: Get OAuth Credentials from Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the **Google Search Console API**:
   - Click "APIs & Services" → "Library"
   - Search for "Google Search Console API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Choose "Desktop application"
   - Add Authorized redirect URI: `http://localhost:3000/callback`
   - Click "Create"

5. Copy your credentials:
   - You'll see "Client ID" and "Client secret"
   - **DO NOT SHARE THESE - Keep them private!**

## Step 3: Configure Environment

1. Create `.env` file (if not already created):

```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/callback

GSC_CONFIG_PATH=./config/gsc-config.json
GSC_TOKENS_PATH=./config/gsc-tokens.json
AUDIT_LOG_PATH=./logs/audit.log

PORT=3000
LOG_LEVEL=INFO
```

## Step 4: Build the Project

```bash
npm run build
```

## Step 5: Run OAuth Authorization

This is a one-time setup to get your tokens:

```bash
npm run setup:auth
```

What happens:
1. Your browser opens with Google login
2. You authorize the app to access Search Console
3. Tokens are automatically saved
4. Authorization dialog closes

**Note:** If the browser doesn't open, copy the URL shown in terminal and paste it manually.

## Step 6: Configure Your Properties

Edit `./config/gsc-config.json`:

```json
{
  "selectedProperties": [
    "sc-domain:example.com",
    "sc-domain:another-site.com"
  ],
  "role": "admin",
  "auditLogging": true,
  "requireApproval": {
    "writeOperations": true,
    "deleteOperations": true
  }
}
```

**Property URL Formats:**
- Domain property: `sc-domain:example.com`
- HTTPS property: `sc-https://example.com/`
- HTTP property: `sc-http://example.com/`

To find your exact property URLs:
1. Go to Google Search Console
2. Click on your property
3. The URL in your browser shows the property format

## Step 7: Run the MCP Server

```bash
npm run start:gsc
```

You should see:
```
GSC MCP Server started and listening on STDIO
```

## Step 8: Connect to Claude

### Option A: Claude Desktop

1. Edit `~/.config/Claude/claude_desktop_config.json` (on Mac/Linux)
   or `%APPDATA%\Claude\claude_desktop_config.json` (on Windows)

2. Add the MCP server:

```json
{
  "mcpServers": {
    "gsc": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-servers/dist/gsc/server.js"
      ],
      "env": {
        "GSC_CONFIG_PATH": "/absolute/path/to/mcp-servers/config/gsc-config.json"
      }
    }
  }
}
```

3. Restart Claude Desktop
4. You'll see the GSC tools available!

### Option B: This CLI

The MCP server is already connected and you can use it directly through me.

## Troubleshooting

### "OAuth tokens not found" error

Run the authorization setup again:
```bash
npm run setup:auth
```

### "Access denied to property" error

Check your `config/gsc-config.json` and verify:
1. The property URL format is correct
2. Your Google account has access to that property
3. The property is verified in Search Console

### "GOOGLE_CLIENT_ID not set" error

Make sure `.env` file has all required credentials:
```bash
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

If empty, update `.env` file with your credentials.

### Port 3000 already in use

Change the PORT in `.env`:
```env
PORT=3001
GOOGLE_REDIRECT_URI=http://localhost:3001/callback
```

## Testing the Connection

After setup, test with me:

```
Ask me: "What are my Search Console properties?"
```

I'll use the MCP tools to connect and show you your properties.

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git (already in `.gitignore`)
- Never share your Client Secret
- Tokens are stored locally in `./config/gsc-tokens.json`
- All operations are logged in `./logs/audit.log`
- Never expose these files publicly

## Next Steps

Once setup is complete:

1. **List Properties**: "Show me my Search Console properties"
2. **Query Analytics**: "What were my top 10 queries last month?"
3. **Check URLs**: "What's the indexing status of my homepage?"
4. **Manage Sitemaps**: "Submit my sitemap"

## Common Commands

```bash
# Build
npm run build

# Start server
npm run start:gsc

# Run OAuth setup
npm run setup:auth

# View audit logs
tail -f logs/audit.log

# Development mode (with auto-reload)
npm run dev:gsc

# Run tests
npm run test
```

## Architecture

```
Your Query (Claude)
       ↓
   MCP Server (STDIO)
       ↓
OAuth Authentication
       ↓
Google Search Console API
       ↓
Results back to you
```

## Additional Resources

- [Google Search Console API Docs](https://developers.google.com/webmaster-tools)
- [MCP Documentation](https://modelcontextprotocol.io/)
- See `claude.md` for detailed project documentation
- See `GSC-API-REFERENCE.md` for all available API operations

## Support

If you encounter issues:
1. Check the audit logs: `logs/audit.log`
2. Check error output for clear error messages
3. Ensure all .env variables are set correctly
4. Verify your OAuth credentials are valid
5. Make sure your properties are correctly formatted