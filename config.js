/* Prototypes hub config — edit these and redeploy */
window.PROTOTYPES_CONFIG = {
  siteName: 'High Volume Prototypes',
  siteTagline: 'Click a mock, share the link, leave feedback.',

  // Legacy navigation gate for direct internal URLs. Prefer Designer/Developer role links.
  // Change this anytime to revoke old key-based links.
  internalAccessKey: 'hv-internal-7k9m2xq4',
  // Optional server endpoint for signed Designer/Developer capability links.
  roleAccessUrl: '',

  // Shared feedback store (free Supabase). Feedback is stored per prototype — no email.
  supabaseUrl: 'https://eruyowhibdrnfpnbjwos.supabase.co',
  supabaseAnonKey: 'sb_publishable_ZTFQX_SAjjRV7WkDmCCCzQ_hsWX0wvj',

  // Optional: Microsoft Clarity project ID for heatmaps + session replay
  // https://clarity.microsoft.com
  clarityId: '',

  feedbackIntro: 'What’s working, what’s confusing, what’s missing?',
};
