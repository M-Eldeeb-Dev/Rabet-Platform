import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase/client";
import useAuthStore from "../store/authStore";

// Helper: wrap a promise with a timeout
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms),
    ),
  ]);

// Helper: Fetch profile or create from metadata, with timeout
const fetchOrCreateProfile = async (sessionUser) => {
  try {
    const result = await withTimeout(
      supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle(),
      5000,
    );

    // Network/Database error or Timeout
    if (result.error) {
      console.warn("Profile fetch error:", result.error.message);
      return null; // Return null, DO NOT try to create/overwrite
    }

    // Success - Profile found
    if (result.data) {
      return result.data;
    }

    // Success - No profile found (result.data is null, result.error is null)
    // Only THEN do we try to create one
    if (sessionUser.user_metadata) {
      try {
        const meta = sessionUser.user_metadata;
        const upsertResult = await withTimeout(
          supabase
            .from("profiles")
            .upsert(
              {
                id: sessionUser.id,
                full_name: meta.full_name || "User",
                email: sessionUser.email,
                role: meta.role || "entrepreneur",
              },
              { onConflict: "id" },
            )
            .select()
            .single(),
          5000,
        );
        if (upsertResult.data) return upsertResult.data;
      } catch (err) {
        console.warn("Profile creation failed:", err.message);
      }
    }
  } catch (err) {
    console.warn("Profile fetch timed out/failed:", err.message);
    return null; // Return null on timeout/exception
  }

  return null;
};

export const useAuth = () => {
  const { user, profile, loading, setUser, setProfile, setLoading } =
    useAuthStore();
  const profileFetchedRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let authListener = null;

    // Safety timeout — guarantee loading=false within 6 seconds max
    const safetyTimer = setTimeout(() => {
      if (useAuthStore.getState().loading) {
        console.warn("useAuth: safety timeout reached, forcing loading=false");
        setLoading(false);
      }
    }, 6000);

    const initAuth = async () => {
      try {
        // 1. Get initial session
        const {
          data: { session },
        } = await withTimeout(supabase.auth.getSession(), 4000).catch(() => ({
          data: { session: null },
        }));

        if (!mountedRef.current) return;

        if (session?.user) {
          setUser(session.user);

          // 2. Fetch profile if we have a user
          if (profileFetchedRef.current !== session.user.id) {
            profileFetchedRef.current = session.user.id;
            const profileData = await fetchOrCreateProfile(session.user);
            if (mountedRef.current && profileData) {
              setProfile(profileData);
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // 3. Listen for subsequent changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return;

      const currentUser = useAuthStore.getState().user;

      // Only update if user actually changed to allow initAuth to handle initial load
      if (session?.user?.id !== currentUser?.id) {
        setUser(session?.user ?? null);
        profileFetchedRef.current = null;
        setLoading(true); // Reset loading on user change

        if (session?.user) {
          profileFetchedRef.current = session.user.id;
          const profileData = await fetchOrCreateProfile(session.user);
          if (mountedRef.current) {
            setProfile(profileData || null);
            setLoading(false);
          }
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });
    authListener = subscription;

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      if (authListener) authListener.unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  return { user, profile, loading };
};
