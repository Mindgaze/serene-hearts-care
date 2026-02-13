import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getPlanSlugByProductId, type PlanSlug } from "@/config/stripe";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Plan = Tables<"plans">;
type AppRole = "titular" | "dependente" | "admin";

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  planSlug: PlanSlug | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  plan: Plan | null;
  role: AppRole | null;
  isLoading: boolean;
  isTitular: boolean;
  isDependente: boolean;
  isAdmin: boolean;
  subscription: SubscriptionStatus;
  isSubscriptionLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const defaultSubscription: SubscriptionStatus = {
  subscribed: false,
  productId: null,
  priceId: null,
  planSlug: null,
  subscriptionEnd: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>(defaultSubscription);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      setProfile(profileData);
      setRole(profileData.role as AppRole);

      if (profileData.plan_id) {
        const { data: planData } = await supabase
          .from("plans")
          .select("*")
          .eq("id", profileData.plan_id)
          .single();

        setPlan(planData);
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const checkSubscription = useCallback(async () => {
    if (!session) return;
    setIsSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }
      const planSlug = data.product_id ? getPlanSlugByProductId(data.product_id) : null;
      setSubscription({
        subscribed: data.subscribed ?? false,
        productId: data.product_id ?? null,
        priceId: data.price_id ?? null,
        planSlug,
        subscriptionEnd: data.subscription_end ?? null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsSubscriptionLoading(false);
    }
  }, [session]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await checkSubscription();
    }
  };

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setPlan(null);
          setRole(null);
          setSubscription(defaultSubscription);
        }

        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }

      setIsLoading(false);
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  // Check subscription on session change
  useEffect(() => {
    if (session) {
      checkSubscription();
    }
  }, [session, checkSubscription]);

  // Periodic subscription check every 60 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setPlan(null);
    setRole(null);
    setSubscription(defaultSubscription);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    plan,
    role,
    isLoading,
    isTitular: role === "titular",
    isDependente: role === "dependente",
    isAdmin: role === "admin",
    subscription,
    isSubscriptionLoading,
    signOut,
    refreshProfile,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
