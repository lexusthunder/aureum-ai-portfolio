# Aureum CRM — iOS Deployment Guide
> Step-by-step guide to publish on App Store

---

## Prerequisites

- [ ] Mac with macOS 13+ (Ventura or later)
- [ ] Xcode 15+ installed from App Store
- [ ] Apple Developer Account ($99/year) — developer.apple.com
- [ ] Node.js 18+ installed
- [ ] CocoaPods installed (`sudo gem install cocoapods`)

---

## Step 1 — Configure App Store Connect

1. Go to **[appstoreconnect.apple.com](https://appstoreconnect.apple.com)**
2. Click **+** → **New App**
3. Fill in:
   - Platform: **iOS**
   - Name: **Aureum CRM**
   - Primary Language: **English**
   - Bundle ID: **ai.aureum.crm** (register in Certificates, IDs & Profiles first)
   - SKU: **AUREUM-CRM-001**
4. Click **Create**

---

## Step 2 — Register Bundle ID

1. Go to **[developer.apple.com](https://developer.apple.com)** → Certificates, IDs & Profiles
2. Click **Identifiers** → **+**
3. Select **App IDs** → **App**
4. Fill in:
   - Description: **Aureum CRM**
   - Bundle ID (Explicit): **ai.aureum.crm**
5. Enable capabilities: **Push Notifications**, **Sign in with Apple** (optional)
6. Click **Register**

---

## Step 3 — Run Setup Script

```bash
cd /Users/alextwr/Projects/web/aureum-crm
chmod +x setup-apple.sh
./setup-apple.sh
```

This will:
- Install npm dependencies
- Build the React app
- Add iOS platform via Capacitor
- Sync the build to native iOS
- Configure Info.plist

---

## Step 4 — Configure Xcode

```bash
cd frontend
npx cap open ios
```

In Xcode:

1. **Select the App target** (left sidebar → App)
2. **Signing & Capabilities** tab:
   - Team: Select your Apple Developer account
   - Bundle Identifier: `ai.aureum.crm`
   - Signing Certificate: Automatically manage signing ✓
3. **General** tab:
   - Display Name: **Aureum CRM**
   - Version: **1.0.0**
   - Build: **1**
   - Deployment Target: **16.0**
4. **Info** tab — add if not present:
   - `NSCameraUsageDescription` → "Used to capture property photos"
   - `NSPhotoLibraryUsageDescription` → "Used to select property images"

---

## Step 5 — Add App Icons

1. In Xcode, click on **Assets.xcassets** → **AppIcon**
2. Delete the existing empty icon set
3. Copy contents of `AppIcon.appiconset/` into the Xcode AppIcon slot
   
   **OR** drag the entire `AppIcon.appiconset` folder into Assets.xcassets

---

## Step 6 — Test on Simulator

```bash
cd frontend
npx cap run ios --target="iPhone 15 Pro"
```

Test all screens:
- [ ] Login (agent@aureum.ai / aureum2026)
- [ ] Dashboard loads with data
- [ ] Bottom tab bar navigation works
- [ ] All 5 primary tabs accessible
- [ ] "More" drawer opens correctly
- [ ] Safe area / notch handled correctly
- [ ] No text is cut off on edges

---

## Step 7 — Test on Real Device

1. Connect iPhone via USB
2. Trust the computer on your iPhone
3. In Xcode, select your device from the device picker
4. Press **Run** (⌘R)
5. Test everything on real device (camera, push notifications, etc.)

---

## Step 8 — Archive & Upload

1. In Xcode: **Product** → **Destination** → **Any iOS Device (arm64)**
2. **Product** → **Archive**
3. Wait for archive to complete
4. In **Organizer** window → Select the archive → **Distribute App**
5. Choose **App Store Connect** → **Upload**
6. Follow the wizard (all defaults are fine)

---

## Step 9 — App Store Connect Submission

1. Go back to **appstoreconnect.apple.com**
2. Select your app → **iOS App** → **1.0 Prepare for Submission**
3. Fill in all metadata from `APP_STORE_METADATA.md`
4. Upload screenshots (use the HTML screenshot pages or Simulator screenshots)
5. Add **Privacy Policy URL**: https://aureum.ai/privacy
6. Select the build you uploaded in Step 8
7. Click **Submit for Review**

---

## Step 10 — Wait for Review

Apple typically reviews within **24-48 hours** for new apps.
Expedited review available if you have a valid reason.

---

## Common Issues & Fixes

### "No accounts with App Store distribution certificates"
→ Go to Xcode → Preferences → Accounts → Add your Apple ID

### "Bundle identifier is not available"
→ Make sure `ai.aureum.crm` is registered in your developer account (Step 2)

### "ITMS-90078: Missing Push Notification Entitlement"
→ In Xcode, add Push Notifications capability (Signing & Capabilities tab → +)

### White screen on launch
→ Check that `capacitor.config.ts` has correct `webDir: 'dist'`
→ Run `npm run build` then `npx cap sync ios` again

### App crashes on launch
→ Check Xcode console for errors
→ Make sure `Info.plist` has all required usage descriptions

---

## Production Backend Setup

For a live production deployment:

```bash
# Option 1: Railway (recommended, free tier available)
railway login
railway init
railway up

# Option 2: Render
# Connect GitHub repo at render.com

# Option 3: fly.io
fly launch
fly deploy
```

Set environment variables in your hosting platform:
```
ANTHROPIC_API_KEY=your-key
DATABASE_URL=postgresql://...  (upgrade from SQLite for production)
SECRET_KEY=your-secret-key-minimum-32-chars
```

Update `capacitor.config.ts`:
```typescript
server: {
  url: 'https://your-api.railway.app',  // Your production backend
  allowNavigation: ['your-api.railway.app', '*.supabase.co'],
}
```

---

## Useful Commands Reference

```bash
# Build and sync
cd frontend
npm run build
npx cap sync ios

# Open Xcode
npx cap open ios

# Run on simulator
npx cap run ios

# View Xcode logs
npx cap run ios --verbose
```

---

*Generated: April 2026 | Aureum CRM v1.0*
