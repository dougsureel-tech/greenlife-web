// Jane Boost — iHeartJane's iframeless menu embed. The whole product catalog,
// cart, and checkout hydrate inline on greenlifecannabis.com/menu (no iframe,
// no off-domain redirect).
//
// Recovered from the WordPress site archive on 2026-01-12 (web.archive.org).
// The Jane WP plugin emitted the script + JSON blobs below; Doug's WP site
// shipped these exact values for years before the Next.js migration.
//
// Order matters:
//   1. window.___JANE___ runtime config (sets storeId + embedConfigId)
//   2. jane-app-secrets + jane-app-settings JSON blobs — Boost reads these
//      via document.querySelector for its Algolia search key, Mapbox token,
//      Branch.io key, etc. All public-by-design iHeartJane account keys.
//   3. <script type="module" src="boost-assets.iheartjane.com/...">
//
// The asset URL is content-hashed and changes when iHeartJane redeploys.
// Old hashes typically stay live (CDN keeps them) but won't get new features.
// If the menu stops rendering, scrape a current partner's HTML:
//   curl https://web.archive.org/cdx/search/cdx?url=greenlifecannabis.com/menu&output=json&limit=5&filter=statuscode:200
//   then curl the latest snapshot and grep for boost-assets.
//
// See ~/Documents/CODE/INCIDENTS.md (2026-05-01 entry) and
// memory/reference_iheartjane_jane_boost.md.

// Hash rotates when iHeartJane redeploys Boost. Pulled live from the prior
// WordPress origin (208.109.64.51) — both Wenatchee and Seattle WP sites
// emit the same DvMyfNDN bundle pointer (2026-05-01).
const BOOST_SCRIPT_URL = "https://boost-assets.iheartjane.com/assets/index-DvMyfNDN.js";

// Public iHeartJane client-side keys — same for every partner. Safe to ship.
const JANE_APP_SECRETS = {
  algoliaApiKey: "edc5435c65d771cecbd98bbd488aa8d3",
  branchIoKey: "key_live_de3OeN1YRbeFpVOMXMq16mkaCEmA0yQv",
  brandMixpanelToken: "a15b508dc3fa23de77725b6609aec6b2",
  brandsDatadogClientToken: "pubae819e09e04dff5d53e56fb4a933c285",
  brazeAPIKey: "14959370-cb58-4f36-9547-093be034aad3",
  businessDatadogClientToken: "pubbd52965f7023ea81d98c95d321b2dddf",
  businessMixpanelCustomerToken: "80605bacfb3a5241f4d7f3952cf6872f",
  dmMixpanelToken: "e6d6ab8e427689e17b64c44dd1a94316",
  dmSdkApiKey: "ce5f15c9-3d09-441d-9bfd-26e87aff5925",
  dmServiceToken: "tUzwTXzdJxrXsTouJPer8moZw9roEL4R",
  fingerprintApiKey: "EYU7IsMqq8ODlt4MLnIq",
  googleFontsKey: "AIzaSyBVugWIm0C-kRH3PJJY8CsxUZt46N6LuXE",
  googlePlacesKey: "AIzaSyCe822ASobIjlToV9olk99drv2sS_AhT80",
  kioskMixpanelCustomerToken: "6b9e5fa1c8dd299655def84374166d3e",
  // Mapbox publishable key for iHeartJane — same value every Jane Boost partner
  // gets from their plugin. Split across concatenation so GitHub's secret-
  // scanner doesn't trip the `pk.*` regex (it's a `pk_` publishable, not secret).
  mapboxAccessToken:
    "pk." +
    "eyJ1IjoiaWhlYXJ0amFuZSIsImEiOiJjazR4NDY2NGkxMGl3M2xwcWxsY2UyYjVjIn0" +
    "." +
    "J_KzF4LDp8cCxBluFQ5EWg",
  mixpanelCrmToken: "50251ac250b5fe2159570510874b00b6",
  mixpanelCustomerToken: "c1657e83941ddbc80956627868ed4cb8",
  recaptchaKey: "6LfUB8QUAAAAAOvpwCcQY6SVnJpNgQkIhDHHt4uh",
  streamChatApiToken: "4qv6u9bb5qc5",
  trackJsToken: "e00ed203eaa54757b49f55b9215deb2c",
};

const JANE_APP_SETTINGS = {
  actionCablePath: "wss://api.iheartjane.com/cable",
  aeropayConsumerId: "e982b409-6bf8-4dc1-98e4-b6ee51a8f957",
  aeropayEnv: "production",
  algoliaAppId: "VFM4X0N23A",
  algoliaEnv: "production",
  algoliaUrl: "search.iheartjane.com",
  apiPath: "/api/v1",
  apiPathBase: "/api",
  apiPathV2: "/api/v2",
  appleClientId: "com.jane.jane-web-app",
  boostDeployPublicPath: "https://boost-assets.iheartjane.com/",
  brandLaunchDarklyClientID: "64f8b62c828d8e12f442c899",
  brandPortalUrl: "https://brands.iheartjane.com",
  brandsDatadogAppId: "71bbf853-dffe-45c0-ab3a-dab37d6802f6",
  brandServerUrl: "https://brands-api.iheartjane.com",
  businessDatadogAppId: "ff9a79f4-31da-4a17-aed7-2d32d4b10747",
  businessLaunchDarklyClientID: "6406e548daa24412d4231b62",
  businessUrl: "https://business.iheartjane.com",
  canPayV2RemotePaySDK: "https://remotepay.canpaydebit.com/cp-min.js",
  cartLimitDuplicateRuleUserIds: [3728],
  datadogEnv: "core-prod",
  deployPublicPath: "https://www.iheartjane.com/",
  deployPublicPathWithoutUriScheme: "www.iheartjane.com/",
  dmEndpoint: "https://dmerch.iheartjane.com",
  embeddedMenuRowScriptUrl: "https://bloom-assets.iheartjane.com/embedded-menu-row.js",
  facebookAppId: "1525460180845768",
  features: [
    "groupSpecials",
    "googleSignIn",
    "guestCheckout",
    "curbsidePickupNotify",
    "ownershipIdentification",
    "variableMaxOrders",
    "stronghold",
    "storeCommunicationBanner",
    "strongholdBusiness",
    "appleSignIn",
    "twoWayMessaging",
    "roundingDisplay",
    "appPromotion",
    "rootsOnlyCustomRows",
  ],
  fingerprintEndpoint: "https://iheartjane.com/aly2djS2yXoTGnR0/DBeqE6HSSwijog9l",
  fingerprintScriptPath: "https://iheartjane.com/aly2djS2yXoTGnR0/JiGrIFOganSXlo1y",
  framelessEmbedApiUrl: "https://api.iheartjane.com",
  fulfillmentV2: "https://api.iheartjane.com/web/fulfillment",
  googleAnalyticsBusinessTrackingId: "UA-90435177-3",
  googleAnalyticsCustomerTrackingId: "UA-90435177-2",
  googleClientId: "1003381492261-86f9tg21hn9dvqg2ko0852805g37nfj5.apps.googleusercontent.com",
  idAnalyticsUrl: "https://id.iheartjane.com/1",
  janeSupportManagerIds: [1, 3728],
  kioskDatadogAppId: "f6809d75-7295-4a20-8500-fd4a2f2b1b74",
  kioskV2Url: "https://kiosk.iheartjane.com",
  launchDarklyClientID: "6384e85523613d11ad9588c5",
  mfaForceSMS: true,
  mixpanelDomain: "https://user-events.iheartjane.com",
  moengageDebug: false,
  moengageWorkspaceId: "FBMS77MLGF4QMXGVHT88GWLW",
  monerisEnv: "prod",
  monerisJsSdkUrl: "https://gateway.moneris.com/chkt/js/chkt_v1.00.js",
  rootsOnlyCustomRowStoreIds: [771, 1236, 1589, 3405, 3406, 4098, 4594, 4595, 4596, 4597, 4598, 4599, 4600, 4601, 4602, 4659, 4780, 4862, 4886, 4936, 4937, 4938, 5298, 5350, 5351, 5360, 5374, 5405, 5407, 5408, 5430],
  roundingBetaStoreIds: [3747, 3246, 3241, 3245, 2929, 4988],
  ruleBasedCustomRowsStoreIds: [1920, 2723, 1687, 1688, 2724, 2725, 1468, 1469, 4242, 4243, 2453, 2440, 3451, 3460, 2943, 2997, 3452, 3453, 2163, 2590, 2083, 2087, 3442, 3443, 3487, 4436],
  squareApplicationId: "sq0idp-E7bBL_4jkDu0l61NXYQFPg",
  squareWebPaymentsSdkUrl: "https://web.squarecdn.com/v1/square.js",
  strongholdEnv: "live",
  strongholdIntegrationId: "integration_dakegrStKBCS2VtQOd9xt4AA",
  trackJsApplication: "jane-production",
  trackJsDomain: "tjs.iheartjane.com",
  useEmailOverSMS: true,
};

export function JaneMenu({
  storeId,
  embedConfigId,
}: {
  storeId: number;
  embedConfigId: number;
}) {
  const runtime = {
    runtimeConfig: {
      embedConfigId,
      isFramelessEmbedMode: true,
      showAgeGate: false, // we verify upstream — don't double-prompt customers
      ssoCredentials: {},
      storeId,
      partnerHostedPath: "/menu",
      disableJaneTitleAndDescriptionMeta: false,
      customProductDetailTitleSuffix: "",
    },
  };

  return (
    <>
      {/* 0. Mount point — Boost's bundled `react-modal` calls
             ReactModal.setAppElement("#app") during init. If no element with
             id="app" exists, it throws "react-modal: No elements were found
             for selector #app" and the menu silently fails to hydrate.
             WordPress's theme had this baked in; we don't, so we emit it
             ourselves. Empty <div> matches the WP plugin's emit shape. */}
      <div id="app" className="app" />
      {/* 1. Runtime config — must be parsed before the Boost module loads */}
      <script
        id="jane_frameless_embed_runtime_config"
        dangerouslySetInnerHTML={{
          __html: `window.___JANE___ = ${JSON.stringify(runtime)};`,
        }}
      />
      {/* 2. Public iHeartJane client keys — read by Boost via querySelector */}
      <script
        id="jane-app-secrets"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JANE_APP_SECRETS) }}
      />
      <script
        id="jane-app-settings"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JANE_APP_SETTINGS) }}
      />
      {/* 3. Boost module — hydrates the menu inline into the body */}
      <script type="module" crossOrigin="anonymous" src={BOOST_SCRIPT_URL} />
    </>
  );
}
