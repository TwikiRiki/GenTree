<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sxSg0Dv_sTUY3ao4IkBsNBMcWpmZAAA_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Building the Application

### Desktop Application (Electron)

1.  **Build the application:**
    ```bash
    npm run build
    ```
2.  **Locate the executable:** The executable file for your operating system will be located in the `dist` directory.

### Mobile Application (Capacitor)

1.  **Build the web assets:**
    ```bash
    npm run build
    ```
2.  **Sync the web assets with the native projects:**
    ```bash
    npx cap sync
    ```
3.  **Open the native project in its IDE:**
    *   **iOS:**
        ```bash
        npx cap open ios
        ```
    *   **Android:**
        ```bash
        npx cap open android
        ```
4.  **Build and run the application:** Once the project is open in the IDE (Xcode for iOS, Android Studio for Android), you can build and run the application on a device or emulator.
