#!/bin/bash
# ============================================================
# AUREUM CRM — iOS Launch Script (Mandachi Edition)
# Rulează asta pe Mac pentru a publica pe App Store
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
GOLD='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${GOLD}${BOLD}"
echo "╔══════════════════════════════════════════════════╗"
echo "║                                                  ║"
echo "║         ✦  AUREUM CRM  ✦                        ║"
echo "║    Luxury Real Estate CRM — iOS Launch           ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Prerequisites ────────────────────────────────────────────
echo -e "${YELLOW}[1/6] Verificare prerequisites...${NC}"

if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"; exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v xcode-select &>/dev/null; then
  echo -e "${RED}❌ Xcode missing. Install from App Store${NC}"; exit 1
fi
echo "✅ Xcode tools: $(xcode-select -p)"

if ! command -v pod &>/dev/null; then
  echo -e "${YELLOW}⚠️  CocoaPods not found. Se instalează...${NC}"
  sudo gem install cocoapods
fi
echo "✅ CocoaPods: $(pod --version)"

# ── Install dependencies ─────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/6] Install npm dependencies...${NC}"
cd frontend
npm install --silent
echo "✅ Dependencies installed"

# ── Production build ─────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/6] Building React app for production...${NC}"
npm run build
echo "✅ Build complet ($(du -sh dist | cut -f1) total)"

# ── Capacitor iOS ────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/6] Setup Capacitor iOS...${NC}"

if [ ! -d "ios" ]; then
  echo "   Adăugând platforma iOS..."
  npx cap add ios
  echo "✅ iOS platform adăugat"
else
  echo "✅ iOS platform deja existent"
fi

# ── Sync ─────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/6] Sync build → iOS native...${NC}"
npx cap sync ios
echo "✅ Sync complet"

# ── Configure Info.plist ─────────────────────────────────────
echo ""
echo -e "${YELLOW}[6/6] Configurare iOS project...${NC}"

PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 'Aureum CRM'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string 'Aureum CRM'" "$PLIST"

  /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString '1.0.0'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :CFBundleShortVersionString string '1.0.0'" "$PLIST"

  /usr/libexec/PlistBuddy -c "Set :CFBundleVersion '1'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :CFBundleVersion string '1'" "$PLIST"

  /usr/libexec/PlistBuddy -c "Set :MinimumOSVersion '16.0'" "$PLIST" 2>/dev/null || true

  /usr/libexec/PlistBuddy -c "Set :NSCameraUsageDescription 'Aureum CRM uses the camera to capture property photos for listings and AI captions.'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'Aureum CRM uses the camera to capture property photos for listings and AI captions.'" "$PLIST"

  /usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryUsageDescription 'Aureum CRM needs photo library access to select and upload property images.'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string 'Aureum CRM needs photo library access to select and upload property images.'" "$PLIST"

  /usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryAddUsageDescription 'Aureum CRM saves processed property photos to your library.'" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryAddUsageDescription string 'Aureum CRM saves processed property photos to your library.'" "$PLIST"

  echo "✅ Info.plist configurat"
fi

# ── Copy AppIcons ─────────────────────────────────────────────
ICON_DEST="ios/App/App/Assets.xcassets/AppIcon.appiconset"
ICON_SRC="../AppIcon.appiconset"
if [ -d "$ICON_SRC" ] && [ -d "$ICON_DEST" ]; then
  cp -f "$ICON_SRC"/*.png "$ICON_DEST/" 2>/dev/null || true
  cp -f "$ICON_SRC/Contents.json" "$ICON_DEST/" 2>/dev/null || true
  echo "✅ App Icons copiate în Xcode"
fi

cd ..

# ── Done ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  AUREUM CRM — GATA PENTRU APP STORE!            ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
echo "║  PASUL URMĂTOR:                                      ║"
echo "║                                                      ║"
echo "║  1. Deschide Xcode:                                  ║"
echo "║     cd frontend && npx cap open ios                 ║"
echo "║                                                      ║"
echo "║  2. Xcode → Product → Archive                       ║"
echo "║                                                      ║"
echo "║  3. Organizer → Distribute → App Store Connect      ║"
echo "║                                                      ║"
echo "║  4. appstoreconnect.apple.com → Submit for Review   ║"
echo "║                                                      ║"
echo "║  LOGIN DEMO: agent@aureum.ai / aureum2026           ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${GOLD}✦ Aureum CRM — Built to close luxury deals${NC}"
echo ""
