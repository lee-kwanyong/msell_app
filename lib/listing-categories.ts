export type ListingTypeOption = {
  value: string;
  label: string;
  logoText: string;
  logoBg: string;
  logoColor: string;
};

export type ListingCategoryGroup = {
  value: string;
  label: string;
  icon: string;
  types: ListingTypeOption[];
};

const RAW_CATEGORY_DATA = String.raw`
Community Platform	Discord Server
Community Platform	Telegram Channel
Community Platform	Telegram Group
Community Platform	Naver Cafe
Community Platform	KakaoTalk Open Chat
Community Platform	KakaoTalk Channel
Community Platform	Facebook Group
Community Platform	Reddit Subreddit
Community Platform	Slack Community
Community Platform	Guilded Server
Community Platform	Line OpenChat
Community Platform	WhatsApp Community
Community Platform	Discourse Forum
Community Platform	Circle Community
Community Platform	Tribe Community
Community Platform	Mighty Networks Community
Community Platform	Skool Community
Community Platform	Vanilla Forum
Community Platform	XenForo Forum
Community Platform	phpBB Forum
Community Platform	Gaming Clan Community
Community Platform	Crypto Community
Community Platform	NFT Community
Community Platform	Creator Fan Community
Community Platform	Membership Community
Community Platform	Local Community Forum
Community Platform	Investor Community
Community Platform	Study Community
Community Platform	Startup Community
Community Platform	Hobby Community
Social Media	Instagram Account
Social Media	Facebook Page
Social Media	X (Twitter) Account
Social Media	TikTok Account
Social Media	Threads Account
Social Media	Pinterest Account
Social Media	LinkedIn Page
Social Media	LinkedIn Profile
Social Media	Snapchat Account
Social Media	Tumblr Blog
Social Media	Mastodon Account
Social Media	Bluesky Account
Social Media	Weibo Account
Social Media	VK Page
Social Media	Douyin Account
Social Media	Kuaishou Account
Social Media	Lemon8 Account
Social Media	Telegram Social Channel
Social Media	Influencer Account
Social Media	Creator Brand Account
Social Media	Fan Page
Social Media	Meme Page
Social Media	Content Creator Account
Social Media	Lifestyle Influencer Account
Social Media	Travel Influencer Account
Social Media	Food Influencer Account
Social Media	Fitness Influencer Account
Social Media	Beauty Influencer Account
Social Media	Gaming Influencer Account
Social Media	Tech Influencer Account
Social Media	Finance Influencer Account
Social Media	Education Influencer Account
Social Media	Music Influencer Account
Social Media	Art Influencer Account
Social Media	Photography Page
Social Media	Comedy Page
Social Media	News Social Channel
Social Media	Business Social Page
Social Media	Motivation Page
Social Media	Quotes Page
Content Platform	YouTube Channel
Content Platform	YouTube Shorts Channel
Content Platform	Twitch Channel
Content Platform	Kick Streaming Channel
Content Platform	AfreecaTV Channel
Content Platform	Naver TV Channel
Content Platform	Vimeo Channel
Content Platform	Dailymotion Channel
Content Platform	Rumble Channel
Content Platform	Spotify Podcast
Content Platform	Apple Podcast
Content Platform	Google Podcast
Content Platform	SoundCloud Channel
Content Platform	Podcast Network
Content Platform	Video Content Library
Content Platform	Shortform Video Channel
Content Platform	Longform Video Channel
Content Platform	Education Channel
Content Platform	Gaming Channel
Content Platform	Tech Channel
Content Platform	Finance Channel
Content Platform	Crypto Channel
Content Platform	Lifestyle Channel
Content Platform	Travel Channel
Content Platform	Food Channel
Content Platform	Fitness Channel
Content Platform	News Channel
Content Platform	Documentary Channel
Content Platform	Interview Channel
Content Platform	Review Channel
Content Platform	Unboxing Channel
Content Platform	Tutorial Channel
Content Platform	DIY Channel
Content Platform	Kids Content Channel
Content Platform	Entertainment Channel
Content Platform	Music Channel
Content Platform	Creator Studio Channel
Content Platform	Creator Network
Content Platform	Multi-Channel Network
Content Platform	Streaming Media Brand
Newsletter / Email	Substack Newsletter
Newsletter / Email	Beehiiv Newsletter
Newsletter / Email	ConvertKit Newsletter
Newsletter / Email	Ghost Newsletter
Newsletter / Email	Mailchimp List
Newsletter / Email	Klaviyo Email List
Newsletter / Email	ActiveCampaign Email List
Newsletter / Email	MailerLite Newsletter
Newsletter / Email	Sendy Email List
Newsletter / Email	HubSpot Email List
Newsletter / Email	Email Marketing List
Newsletter / Email	Daily Newsletter
Newsletter / Email	Weekly Newsletter
Newsletter / Email	Premium Newsletter
Newsletter / Email	Paid Subscriber Newsletter
Newsletter / Email	Finance Newsletter
Newsletter / Email	Crypto Newsletter
Newsletter / Email	Tech Newsletter
Newsletter / Email	Marketing Newsletter
Newsletter / Email	Startup Newsletter
Newsletter / Email	Investment Newsletter
Newsletter / Email	AI Newsletter
Newsletter / Email	SaaS Newsletter
Newsletter / Email	Local Business Newsletter
Newsletter / Email	Creator Economy Newsletter
Newsletter / Email	Media Newsletter
Newsletter / Email	Ecommerce Newsletter
Newsletter / Email	Growth Marketing Newsletter
Newsletter / Email	Affiliate Marketing Newsletter
Newsletter / Email	Niche Audience Newsletter
Website / Blog	WordPress Website
Website / Blog	Shopify Store
Website / Blog	Webflow Website
Website / Blog	Naver Blog
Website / Blog	Tistory Blog
Website / Blog	Medium Publication
Website / Blog	Brunch Blog
Website / Blog	Wix Website
Website / Blog	Squarespace Website
Website / Blog	Notion Website
Website / Blog	Carrd Website
Website / Blog	Affiliate Website
Website / Blog	Review Website
Website / Blog	Comparison Website
Website / Blog	Coupon Website
Website / Blog	SEO Blog
Website / Blog	Authority Website
Website / Blog	Niche Authority Site
Website / Blog	Content Portal
Website / Blog	News Website
Website / Blog	Media Website
Website / Blog	Ecommerce Website
Website / Blog	Lead Generation Website
Website / Blog	Landing Page Network
Website / Blog	Content Network
Website / Blog	Blog Network
Website / Blog	Magazine Website
Website / Blog	Knowledge Base Website
Website / Blog	Tutorial Website
Website / Blog	Educational Website
Website / Blog	Community Blog
Website / Blog	Marketplace Blog
Website / Blog	Startup Blog
Website / Blog	Tech Blog
Website / Blog	Finance Blog
Website / Blog	Crypto Blog
Website / Blog	Travel Blog
Website / Blog	Food Blog
Website / Blog	Lifestyle Blog
Website / Blog	Health Blog
Messenger / Push	Kakao Broadcast List
Messenger / Push	LINE Official Account
Messenger / Push	WhatsApp Broadcast
Messenger / Push	Telegram Broadcast Bot
Messenger / Push	Discord Announcement Channel
Messenger / Push	SMS Marketing List
Messenger / Push	Email Broadcast List
Messenger / Push	Push Notification Subscribers
Messenger / Push	Mobile App Notification Audience
Messenger / Push	Messenger Bot Audience
Messenger / Push	Chatbot Subscriber List
Messenger / Push	WhatsApp Business Audience
Messenger / Push	Telegram Bot Subscribers
Messenger / Push	KakaoTalk CRM List
Messenger / Push	Line CRM Audience
Messenger / Push	Mobile Marketing Audience
Messenger / Push	Notification Subscriber Network
Messenger / Push	Alert Channel
Messenger / Push	Deal Alert Channel
Messenger / Push	VIP Broadcast Channel
Messenger / Push	Promo Broadcast Channel
Messenger / Push	Coupon Broadcast Channel
Messenger / Push	News Alert Channel
Messenger / Push	Community Alert Channel
Messenger / Push	Product Launch Broadcast
Messenger / Push	Event Notification Channel
Messenger / Push	Marketing Push List
Messenger / Push	Customer Notification Channel
Messenger / Push	Subscriber Alert List
Messenger / Push	Membership Notification Channel
SEO / Search Traffic	SEO Website
SEO / Search Traffic	Keyword Blog
SEO / Search Traffic	Affiliate Blog
SEO / Search Traffic	Review SEO Site
SEO / Search Traffic	Comparison SEO Site
SEO / Search Traffic	Coupon SEO Site
SEO / Search Traffic	Authority Domain
SEO / Search Traffic	Expired Domain Traffic Site
SEO / Search Traffic	Backlink Network
SEO / Search Traffic	Content SEO Hub
SEO / Search Traffic	Programmatic SEO Website
SEO / Search Traffic	Long Tail SEO Network
SEO / Search Traffic	Local SEO Site
SEO / Search Traffic	Marketplace SEO Blog
SEO / Search Traffic	Micro Niche Website
SEO / Search Traffic	Lead Generation Website
SEO / Search Traffic	Traffic Arbitrage Site
SEO / Search Traffic	Search Traffic Portal
SEO / Search Traffic	Content Aggregator Site
SEO / Search Traffic	Directory Website
SEO / Search Traffic	Local Business Directory
SEO / Search Traffic	Review Directory
SEO / Search Traffic	Product Directory
SEO / Search Traffic	SaaS Directory
SEO / Search Traffic	Startup Directory
SEO / Search Traffic	Job Listing Website
SEO / Search Traffic	Event Listing Website
SEO / Search Traffic	Classified Listing Website
SEO / Search Traffic	Marketplace Listing Website
SEO / Search Traffic	Community Directory
Ads / Traffic Network	Google Ads Account
Ads / Traffic Network	Facebook Ads Account
Ads / Traffic Network	TikTok Ads Account
Ads / Traffic Network	Naver Ads Account
Ads / Traffic Network	Kakao Ads Account
Ads / Traffic Network	Taboola Traffic Source
Ads / Traffic Network	Outbrain Traffic Source
Ads / Traffic Network	Native Ads Network
Ads / Traffic Network	Display Ads Account
Ads / Traffic Network	Media Buying Account
Ads / Traffic Network	Affiliate Traffic Network
Ads / Traffic Network	Push Ads Traffic Source
Ads / Traffic Network	Pop Ads Network
Ads / Traffic Network	Ad Arbitrage Network
Ads / Traffic Network	Traffic Reselling Network
Ads / Traffic Network	Sponsored Content Network
Ads / Traffic Network	Marketing Funnel
Ads / Traffic Network	Lead Funnel
Ads / Traffic Network	Ad Landing Page Network
Ads / Traffic Network	Performance Marketing Asset
Ads / Traffic Network	CPA Network
Ads / Traffic Network	CPL Network
Ads / Traffic Network	Affiliate Network
Ads / Traffic Network	Influencer Marketing Network
Ads / Traffic Network	Ad Exchange Account
Ads / Traffic Network	DSP Advertising Account
Ads / Traffic Network	SSP Advertising Inventory
Ads / Traffic Network	Retargeting Audience Pool
Ads / Traffic Network	Data Audience List
Ads / Traffic Network	Lookalike Audience Asset
Ads / Traffic Network	Marketing Automation Funnel
Ads / Traffic Network	Email Funnel
Ads / Traffic Network	Webinar Funnel
Ads / Traffic Network	Sales Funnel
Ads / Traffic Network	Ecommerce Funnel
Ads / Traffic Network	Lead Capture Funnel
Ads / Traffic Network	Product Launch Funnel
Ads / Traffic Network	Growth Marketing Funnel
Ads / Traffic Network	Conversion Funnel
Ads / Traffic Network	Ad Creative Library
Ads / Traffic Network	Banner Ad Inventory
Ads / Traffic Network	Sponsored Newsletter Placement
Ads / Traffic Network	Native Content Distribution
Ads / Traffic Network	Brand Partnership Network
Ads / Traffic Network	Advertising Placement Network
Ads / Traffic Network	Paid Media Asset
Ads / Traffic Network	Traffic Marketplace Account
Ads / Traffic Network	Ad Network Publisher Account
Ads / Traffic Network	Sponsored Post Network
Ads / Traffic Network	Paid Promotion Network
Ads / Traffic Network	Affiliate Influencer Network
Ads / Traffic Network	Media Partner Network
Ads / Traffic Network	Creator Sponsorship Network
Ads / Traffic Network	Influencer Sponsorship Network
Ads / Traffic Network	Brand Promotion Network
Ads / Traffic Network	Advertising Distribution Network
Ads / Traffic Network	Promotion Traffic Network
Ads / Traffic Network	Media Buying Network
Ads / Traffic Network	Audience Monetization Network
Ads / Traffic Network	Digital Promotion Network`;

const GROUP_ICONS: Record<string, string> = {
  "Community Platform": "👥",
  "Social Media": "📱",
  "Content Platform": "🎬",
  "Newsletter / Email": "✉️",
  "Website / Blog": "🌐",
  "Messenger / Push": "🔔",
  "SEO / Search Traffic": "🔎",
  "Ads / Traffic Network": "📈",
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/\(twitter\)/g, "twitter")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildLogoMeta(label: string) {
  const lower = label.toLowerCase();

  const presets: Array<{
    match: string[];
    text: string;
    bg: string;
    color?: string;
  }> = [
    { match: ["instagram"], text: "IG", bg: "#fdf0f7", color: "#b83b7c" },
    { match: ["facebook"], text: "f", bg: "#eef4ff", color: "#1d4ed8" },
    { match: ["x (twitter)", "twitter", "x "], text: "X", bg: "#f3f4f6", color: "#111827" },
    { match: ["tiktok"], text: "TT", bg: "#eefcff", color: "#0f766e" },
    { match: ["threads"], text: "@", bg: "#f3f4f6", color: "#111827" },
    { match: ["pinterest"], text: "P", bg: "#fff1f2", color: "#be123c" },
    { match: ["linkedin"], text: "in", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["snapchat"], text: "SC", bg: "#fffbea", color: "#a16207" },
    { match: ["tumblr"], text: "T", bg: "#eef2ff", color: "#3730a3" },
    { match: ["mastodon"], text: "M", bg: "#eef2ff", color: "#4338ca" },
    { match: ["bluesky"], text: "BS", bg: "#eff6ff", color: "#0369a1" },
    { match: ["weibo"], text: "WB", bg: "#fff1f2", color: "#be123c" },
    { match: ["vk"], text: "VK", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["douyin"], text: "DY", bg: "#f5f3ff", color: "#7c3aed" },
    { match: ["kuaishou"], text: "KS", bg: "#fff7ed", color: "#c2410c" },
    { match: ["lemon8"], text: "L8", bg: "#f7fee7", color: "#4d7c0f" },
    { match: ["discord"], text: "DS", bg: "#eef2ff", color: "#4338ca" },
    { match: ["telegram"], text: "TG", bg: "#eff6ff", color: "#0284c7" },
    { match: ["naver"], text: "N", bg: "#ecfdf5", color: "#15803d" },
    { match: ["kakaotalk", "kakao"], text: "K", bg: "#fffbea", color: "#a16207" },
    { match: ["reddit"], text: "R", bg: "#fff7ed", color: "#c2410c" },
    { match: ["slack"], text: "S", bg: "#faf5ff", color: "#7e22ce" },
    { match: ["guilded"], text: "G", bg: "#f0fdf4", color: "#166534" },
    { match: ["line"], text: "L", bg: "#ecfdf5", color: "#16a34a" },
    { match: ["whatsapp"], text: "WA", bg: "#ecfdf5", color: "#15803d" },
    { match: ["discourse"], text: "D", bg: "#fff7ed", color: "#c2410c" },
    { match: ["circle"], text: "C", bg: "#f5f3ff", color: "#7c3aed" },
    { match: ["tribe"], text: "TB", bg: "#fdf4ff", color: "#a21caf" },
    { match: ["mighty networks"], text: "MN", bg: "#eef2ff", color: "#3730a3" },
    { match: ["skool"], text: "SK", bg: "#fefce8", color: "#854d0e" },
    { match: ["xenforo"], text: "XF", bg: "#f0fdf4", color: "#166534" },
    { match: ["phpbb"], text: "PB", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["youtube"], text: "YT", bg: "#fff1f2", color: "#b91c1c" },
    { match: ["twitch"], text: "TW", bg: "#f5f3ff", color: "#7c3aed" },
    { match: ["kick"], text: "K", bg: "#f7fee7", color: "#3f6212" },
    { match: ["afreecatv"], text: "A", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["vimeo"], text: "V", bg: "#eff6ff", color: "#0369a1" },
    { match: ["dailymotion"], text: "DM", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["rumble"], text: "R", bg: "#f7fee7", color: "#4d7c0f" },
    { match: ["spotify"], text: "SP", bg: "#ecfdf5", color: "#15803d" },
    { match: ["apple"], text: "", bg: "#f3f4f6", color: "#111827" },
    { match: ["google"], text: "G", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["soundcloud"], text: "SC", bg: "#fff7ed", color: "#ea580c" },
    { match: ["substack"], text: "SS", bg: "#fff7ed", color: "#c2410c" },
    { match: ["beehiiv"], text: "BH", bg: "#fefce8", color: "#a16207" },
    { match: ["convertkit"], text: "CK", bg: "#fff7ed", color: "#c2410c" },
    { match: ["ghost"], text: "GH", bg: "#f3f4f6", color: "#111827" },
    { match: ["mailchimp"], text: "MC", bg: "#fffbea", color: "#a16207" },
    { match: ["klaviyo"], text: "KL", bg: "#ecfccb", color: "#4d7c0f" },
    { match: ["activecampaign"], text: "AC", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["mailerlite"], text: "ML", bg: "#ecfdf5", color: "#15803d" },
    { match: ["sendy"], text: "SD", bg: "#f0fdf4", color: "#166534" },
    { match: ["hubspot"], text: "HS", bg: "#fff7ed", color: "#c2410c" },
    { match: ["wordpress"], text: "WP", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["shopify"], text: "SH", bg: "#ecfdf5", color: "#15803d" },
    { match: ["webflow"], text: "WF", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["tistory"], text: "TS", bg: "#fff7ed", color: "#9a3412" },
    { match: ["medium"], text: "M", bg: "#f3f4f6", color: "#111827" },
    { match: ["brunch"], text: "BR", bg: "#f0fdf4", color: "#166534" },
    { match: ["wix"], text: "WX", bg: "#f3f4f6", color: "#111827" },
    { match: ["squarespace"], text: "SQ", bg: "#f3f4f6", color: "#111827" },
    { match: ["notion"], text: "N", bg: "#f3f4f6", color: "#111827" },
    { match: ["carrd"], text: "CD", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["sms"], text: "SMS", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["push"], text: "P", bg: "#eff6ff", color: "#0369a1" },
    { match: ["seo"], text: "SEO", bg: "#f0fdf4", color: "#166534" },
    { match: ["google ads"], text: "GA", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["facebook ads"], text: "FA", bg: "#eef4ff", color: "#1d4ed8" },
    { match: ["tiktok ads"], text: "TA", bg: "#eefcff", color: "#0f766e" },
    { match: ["naver ads"], text: "NA", bg: "#ecfdf5", color: "#15803d" },
    { match: ["kakao ads"], text: "KA", bg: "#fffbea", color: "#a16207" },
    { match: ["taboola"], text: "TB", bg: "#eff6ff", color: "#1d4ed8" },
    { match: ["outbrain"], text: "OB", bg: "#fff7ed", color: "#c2410c" },
  ];

  const matched = presets.find((preset) =>
    preset.match.some((keyword) => lower.includes(keyword))
  );

  if (matched) {
    return {
      text: matched.text,
      bg: matched.bg,
      color: matched.color ?? "#2f2417",
    };
  }

  const words = label
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const text =
    words.length >= 2
      ? `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
      : (words[0] ?? "T").slice(0, 2).toUpperCase();

  return {
    text,
    bg: "#f4ede3",
    color: "#6b4e33",
  };
}

function parseCategoryGroups(): ListingCategoryGroup[] {
  const grouped = new Map<string, ListingTypeOption[]>();

  for (const line of RAW_CATEGORY_DATA.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const [groupLabel, typeLabel] = trimmed.split("\t");
    if (!groupLabel || !typeLabel) continue;

    const logo = buildLogoMeta(typeLabel);

    const option: ListingTypeOption = {
      value: slugify(typeLabel),
      label: typeLabel,
      logoText: logo.text,
      logoBg: logo.bg,
      logoColor: logo.color,
    };

    if (!grouped.has(groupLabel)) {
      grouped.set(groupLabel, []);
    }

    grouped.get(groupLabel)!.push(option);
  }

  return Array.from(grouped.entries()).map(([label, types]) => ({
    value: slugify(label),
    label,
    icon: GROUP_ICONS[label] ?? "📦",
    types,
  }));
}

export const LISTING_CATEGORY_GROUPS = parseCategoryGroups();

export function findGroupByTypeLabel(typeLabel?: string | null) {
  if (!typeLabel) return null;

  for (const group of LISTING_CATEGORY_GROUPS) {
    const found = group.types.find(
      (item) =>
        item.label === typeLabel ||
        item.value === typeLabel ||
        slugify(item.label) === slugify(typeLabel)
    );

    if (found) {
      return {
        group,
        type: found,
      };
    }
  }

  return null;
}

export function getGroupOptions() {
  return LISTING_CATEGORY_GROUPS.map((group) => ({
    value: group.value,
    label: group.label,
    icon: group.icon,
  }));
}

export function getTypesByGroupValue(groupValue?: string | null) {
  const group = LISTING_CATEGORY_GROUPS.find((item) => item.value === groupValue);
  return group?.types ?? [];
}