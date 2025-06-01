# HTTPS Development Setup

This project is configured to run with HTTPS for mobile testing.

## Current Setup
- Uses `mkcert` for generating trusted local certificates
- Certificates include localhost and your local IP addresses
- Server runs on `https://localhost:3001` (or next available port)

## For Mobile Testing
Use any of these URLs from your phone (make sure you're on the same network):
- `https://100.64.181.233:3001/`
- `https://192.168.137.1:3001/`
- `https://192.168.56.1:3001/`

## Regenerating Certificates
If you change networks or need new certificates:

1. Get your current IP addresses:
   ```cmd
   ipconfig | findstr IPv4
   ```

2. Generate new certificates (replace IPs with your current ones):
   ```cmd
   mkcert localhost 127.0.0.1 ::1 0.0.0.0 [YOUR_IP_1] [YOUR_IP_2] [etc...]
   ```

3. Update `vite.config.ts` to use the new certificate files

4. Restart the dev server: `yarn dev`

## Notes
- Certificates are valid for 2+ years
- Certificate files (*.pem) are ignored by git
- `mkcert -install` only needs to be run once per machine 