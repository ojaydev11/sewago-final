export const pricing = {
  currency: 'NPR',
  bookingFee: 39,
  commissionPct: 0.1,
  expressAddon: {
    price: 149,
    providerSharePct: 0.5
  },
  warrantyAddon: {
    price: 99
  },
  coins: {
    signupBonus: 100,
    referralBoth: 50,
    maxRedeemPctOnLabour: 0.1,
    expiryDays: 90
  },
  services: {
    plumber: {
      base30: 599,
      extra15: 150
    },
    electrician: {
      base30: 599,
      extra15: 150
    },
    ac_service: {
      baseFlat: 1499
    },
    cleaning_pest_fixed: {
      baseFlat: 1999
    }
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
