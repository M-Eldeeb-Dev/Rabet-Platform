import React from "react";
import { Offline, Online } from "react-detect-offline";
import { WifiOff, Wifi } from "lucide-react";

/**
 * GlobalOfflineAlert component
 * Displays a fixed alert at the bottom of the screen when the user loses internet connection.
 * Also wraps the application to ensure it only renders when online if strict mode is desired,
 * but usually we want to show the app + the offline message.
 *
 * For this implementation, we will use it to show a toaster/banner.
 */
const OfflineAlert = () => {
  return (
    <>
      <Offline>
        <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg animate-slide-up">
          <WifiOff className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-bold text-sm">لا يوجد اتصال بالإنترنت</span>
            <span className="text-xs text-red-100">
              يرجى التحقق من الشبكة الخاصة بك.
            </span>
          </div>
        </div>
      </Offline>
      {/* <Online>
        Optional: We could show a "Back Online" message briefly, but react-detect-offline
        doesn't support "briefly" out of the box without extra state.
        For now, we just rely on the offline message disappearing.
      </Online> */}
    </>
  );
};

export default OfflineAlert;
