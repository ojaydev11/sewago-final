export const pricing = {
  currency: 'NPR',
  currency_symbol: 'Rs',
  bookingFee: 39,
  booking_fee: 39,
  commissionPct: 0.1,
  commission_pct: 0.10,
  expressAddon: {
    price: 149,
    providerSharePct: 0.5
  },
  express_addon: { price: 149, provider_share_pct: 0.5 },
  warrantyAddon: { price: 99 },
  warranty_addon: { price: 99 },
  coins: {
    signupBonus: 100,
    referralBoth: 50,
    referral_both: 50,
    maxRedeemPctOnLabour: 0.1,
    max_redeem_pct_on_labour: 0.10,
    expiryDays: 7
  },
  travel: { free_km: 5, per_km: 15, provider_share_pct: 1.0 },
  services: {
    plumber: { base30: 599, extra15: 150 },
    electrician: { base30: 599, extra15: 150 },
    ac_service: { base30: 1499, extra15: 200 },
    appliance: { base30: 649, extra15: 150 },
    water_filter: { base30: 899, extra15: 200 },
    bathroom_clean: { baseFlat: 999 },
    deep_clean_1bhk: { baseFlat: 2499, suppliesHandlingPct: 0.05 },
    pest_basic: { baseFlat: 1999 },
    handyman: { base30: 649, extra15: 150 },
    // legacy keys used elsewhere
    cleaning_pest_fixed: { baseFlat: 1999 }
  },
  membership: {
    monthly: {
      price: 299,
      perks: ['no_booking_fee', '10pct_labour_off', 'priority', 'warranty_plus']
    },
    yearly: {
      price: 1999,
      perks: ['no_booking_fee', '10pct_labour_off', 'priority', 'warranty_plus']
    }
  }
};
