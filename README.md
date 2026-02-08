<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1-TSkbbWMibO74uR43EObAMm9QvZvHiIT

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in `.env.local` to your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
3. Run the app:
   `npm run dev`

## Android App (Native)

The Android version of VitalTrack Pro is built using Kotlin and Jetpack Compose.

### Prerequisites
- Android Studio Ladybug or newer
- JDK 21
- Android SDK 35

### Setup
1. Open the `android/` directory in Android Studio.
2. In your `local.properties` file (or as an environment variable), set:
   `GEMINI_API_KEY=your_api_key_here`
3. Sync Gradle and run the `app` configuration.

### Features (Android)
- **Local Persistence**: Powered by Room Database for fast, offline access.
- **AI Insights**: Native Gemini SDK integration.
- **Material 3 UI**: Modern, responsive design matching the web app.
- **Charts**: Custom data visualization for all health metrics.

## Features

- **Multi-profile tracking**: Monitor health vitals for multiple family members.
- **Visual Trends**: Interactive charts for Blood Pressure, Heart Rate, and SpO2.
- **AI Health Insights**: Powered by Gemini 2.0 Flash to analyze health trends and provide helpful summaries.
- **Multi-language support**: Available in English and Italian.
- **Data Portability**: Export your data to CSV format.
- **Secure Sharing**: Share profiles with other users via email.

## Technical Details

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI SDK**: @google/genai (Gemini 2.0)
- **Charts**: Recharts
