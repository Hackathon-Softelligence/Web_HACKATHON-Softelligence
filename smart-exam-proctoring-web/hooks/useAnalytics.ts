import { useEffect, useState } from "react";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { app } from "../lib/firebase";

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const analyticsSupported = await isSupported();
        if (analyticsSupported) {
          const analyticsInstance = getAnalytics(app);
          setAnalytics(analyticsInstance);
        }
      } catch (error) {
        console.warn("Analytics not supported:", error);
      }
    };

    initAnalytics();
  }, []);

  return analytics;
};
