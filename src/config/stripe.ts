// Stripe plan tiers mapping - links DB plan slugs to Stripe product/price IDs
export const STRIPE_PLANS = {
  individual: {
    product_id: "prod_TyP66AyJG9ksDT",
    price_id: "price_1T0SIVEM9T1iOXHkOrjHpvoh",
  },
  familiar: {
    product_id: "prod_TyP7Xv4oJdibIv",
    price_id: "price_1T0SIqEM9T1iOXHkHppxyFIu",
  },
  gold: {
    product_id: "prod_TyP7QGMOHn6oSy",
    price_id: "price_1T0SJ5EM9T1iOXHkw2KkkpZ4",
  },
  platinum: {
    product_id: "prod_TyP8lup92j0tqu",
    price_id: "price_1T0SKJEM9T1iOXHkMQmNYg5e",
  },
} as const;

export type PlanSlug = keyof typeof STRIPE_PLANS;

// Reverse lookup: product_id -> plan slug
export function getPlanSlugByProductId(productId: string): PlanSlug | null {
  for (const [slug, config] of Object.entries(STRIPE_PLANS)) {
    if (config.product_id === productId) return slug as PlanSlug;
  }
  return null;
}
