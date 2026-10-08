# Color Pop Rush — playable first build

## Play immediately
Open PLAY-NOW.html in a modern browser. All game code and audio are inside it; no installation or internet connection is needed. Audio begins after your first tap. On Android, a downloaded HTML file may open in a file viewer: use the hosted version below for reliable Chrome play.

## Included
8×8 drag-and-place block game, tap-to-place accessibility alternative, simultaneous row/column clears, scoring and combos, original synthesized looping music and placement/clear effects, music/sound/vibration controls, earned coin store, hammer and Rainbow Pop power-ups, four unlockable themes, seven achievements, daily reward streak, date-seeded daily challenge, four lifetime missions, statistics, saved current round and local JSON backup/restore. Daily Challenge disables power-ups and pays its completion reward once per date. Missions are lifetime goals, not rotating daily missions. There is no Rush/timed mode in this first build.

This is a playable first build, not a signed store release. The screenshot concept was inspiration; the implemented design uses lightweight CSS graphics. Progress is local to each browser/app and does not sync across devices. Daily rewards use device time, which is not protected against clock changes. Coins have no cash value.

## GitHub setup
1. Create a repository named color-pop-rush.
2. Upload the contents of this folder to the repository root (not inside an extra folder). Include .github/workflows, www, package.json and capacitor.config.json. If GitHub's web uploader hides .github, create the two workflow files through Add file → Create new file, using their full paths.
3. For online play, go to repository Settings → Pages → Source → GitHub Actions.
4. Go to Actions → Publish playable web game → Run workflow. After success, the deployment link opens the game on your Android phone. Chrome's Add to Home screen may offer installation or a shortcut depending on browser support.

## Android APK for your phone
The supplied workflow builds a DEBUG test APK, not a Play Store release.
1. Actions → Build Android test APK → Run workflow.
2. Wait for the workflow to succeed.
3. Download the Color-Pop-Rush-Android-Test artifact from the completed run.
4. Extract the downloaded ZIP, transfer app-debug.apk to your phone and open it. If Android asks, allow installation from the app you used to open the APK.

The Android workflow is supplied but has not been run on GitHub in this environment. It downloads Capacitor 8 dependencies, generates the Android project, and compiles with Java 21 and Android SDK 36. GitHub Actions must be enabled. A generated Android project is not included in this ZIP. For local development: install Node 22+, Android Studio and Android SDK, then run npm install, npx cap add android, npx cap sync android, npx cap open android. Choose a permanent unique appId before publishing; the current ID is a provisional placeholder.

## Monetization — next integration
The current coin store accepts EARNED COINS ONLY. There are no real ads or real-money purchases, and no dummy transactions pretending to charge users.
Recommended integration:
- Optional rewarded ads for additional hammers or a revive in Classic mode. Grant the reward only when the ad SDK reports a completed reward; never on an ad click or ad dismissal.
- Infrequent interstitials between completed rounds, not during placement.
- A remove-ads purchase and optional cosmetic theme packs through native Play Billing / Apple StoreKit, with restore purchases and receipt verification. Remove-ads should define whether optional rewarded videos remain available.
Before production: create your AdMob app and ad units, connect the native SDK/plugin, implement required consent, use test ads during development, prepare privacy policy and store disclosures based on the actual SDKs, integrate billing, test on real devices, generate release icons/screenshots, create a release keystore, and build/sign the Android App Bundle. Never commit signing keys or account secrets to GitHub. No revenue is promised.

iOS uses the same web game with a Capacitor iOS project, but needs a macOS/Xcode build and Apple signing. An iOS package is not included.

## Audio and art
Music and sound effects are synthesized in game.js with Web Audio, with no sampled commercial tracks. Interface graphics and icon.svg are original programmatic shapes. No third-party image/audio assets are bundled.

## Technical notes
www is the deployable web game. PLAY-NOW.html is a standalone convenience build generated from these files. Edit www sources and regenerate the standalone file when making changes. The service worker caches the HTTPS web version for offline use and is skipped in Capacitor. Web/native exports should be tested on the target phone before a release.

References:
https://capacitorjs.com/docs/getting-started/environment-setup
https://capacitorjs.com/docs/android
https://developers.google.com/admob/android/rewarded
https://support.google.com/admob/answer/7313578

Validation: JavaScript syntax and automated game-logic checks passed (placement/row clearing, scoring, reward idempotency, coin purchases, theme unlocks, deterministic daily sequence, repeated daily wins, collision checks, screen render functions, persistence). Browser visual/device testing and the Android build are pending; browser installation was unavailable in this environment.
