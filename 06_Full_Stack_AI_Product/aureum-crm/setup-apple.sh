#!/bin/bash
# ============================================================
# AUREUM CRM — Apple App Setup Script
# Rulează asta o singură dată pentru a configura iOS + macOS
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔══════════════════════════════════════╗"
echo "║     AUREUM CRM — Apple App Setup     ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── Prerequisites check ──────────────────────────────────────
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"; exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v xcode-select &>/dev/null; then
  echo -e "${RED}❌ Xcode Command Line Tools missing. Run: xcode-select --install${NC}"; exit 1
fi
echo "✅ Xcode tools found"

if ! command -v pod &>/dev/null; then
  echo -e "${YELLOW}⚠️  CocoaPods not found. Installing...${NC}"
  sudo gem install cocoapods
fi
echo "✅ CocoaPods ready"

# ── Install npm deps ─────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/6] Installing npm dependencies...${NC}"
cd frontend
npm install

# ── Build web app ────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/6] Building web app...${NC}"
npm run build

# ── Init Capacitor (if not already done) ────────────────────
echo ""
echo -e "${YELLOW}[4/6] Initializing Capacitor...${NC}"
if [ ! -d "ios" ]; then
  npx cap add ios
  echo "✅ iOS platform added"
else
  echo "✅ iOS platform already exists"
fi

# ── Sync web build to native ─────────────────────────────────
echo ""
echo -e "${YELLOW}[5/6] Syncing web build to native...${NC}"
npx cap sync ios

# ── Update iOS bundle ID + display name ─────────────────────
echo ""
echo -e "${YELLOW}[6/6] Configuring iOS project...${NC}"

PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  # Set display name
  /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 'Aureum CRM'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string 'Aureum CRM'" "$PLIST"

  # Set minimum iOS version
  /usr/libexec/PlistBuddy -c "Set :MinimumOSVersion '16.0'" "$PLIST" 2>/dev/null || true

  # Camera usage (pentru photo upload)
  /usr/libexec/PlistBuddy -c "Set :NSCameraUsageDescription 'Used to capture property photos'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'Used to capture property photos'" "$PLIST"

  # Photo library
  /usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryUsageDescription 'Used to select property images'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string 'Used to select property images'" "$PLIST"

  echo "✅ Info.plist configured"
fi

cd ..

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅  SETUP COMPLET!                              ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Deschide Xcode:                                 ║"
echo "║    cd frontend && npx cap open ios               ║"
echo "║                                                  ║"
echo "║  Sau rulează direct pe simulator:                ║"
echo "║    cd frontend && npm run cap:run:ios            ║"
echo "║                                                  ║"
echo "║  Pentru macOS (Mac Catalyst):                    ║"
echo "║    În Xcode → Targets → App → Destinations:     ║"
echo "║    Activează 'Mac (Mac Catalyst)'                ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"
