export type AssetType =
  | "channel_community"
  | "social_account"
  | "web_app";

export type TransferMethod =
  | "owner_transfer"
  | "admin_transfer"
  | "domain_transfer"
  | "asset_purchase_agreement"
  | "other";

export type PlatformId =
  // 1) 채널·커뮤니티
  | "youtube"
  | "naver_cafe"
  | "kakao_openchat"
  | "discord"
  | "telegram"
  | "naver_band"
  | "facebook_group"
  | "reddit_sub"
  | "community_forum"
  // 2) SNS
  | "instagram"
  | "tiktok"
  | "x"
  | "threads"
  | "facebook_page"
  | "linkedin_page"
  // 3) 웹/앱
  | "website"
  | "domain"
  | "hosting_cloud"
  | "app_bundle"
  | "ops_db_templates";

export type PlatformSpec = {
  id: PlatformId;
  /** ✅ 셀렉트에 그대로 보일 텍스트(요청 문구 반영) */
  label: string;
  asset_type: AssetType;
  transfer_default: TransferMethod;
  policy_risk: "low" | "medium" | "high";
  required_metrics: string[];
  required_proofs: string[];
  asset_ref_hint: string;
};

export const PLATFORM_SPECS: PlatformSpec[] = [
  // =========================
  // 1) 채널·커뮤니티 “소유권” 유형
  // =========================
  {
    id: "youtube",
    label: "YouTube 채널 소유권(브랜드 계정 관리자/소유자 이전)",
    asset_type: "channel_community",
    transfer_default: "owner_transfer",
    policy_risk: "medium",
    required_metrics: ["subs", "views_mo", "revenue_mo"],
    required_proofs: ["YouTube Studio 스크린샷", "수익/애널리틱스 캡처"],
    asset_ref_hint: "채널 URL",
  },
  {
    id: "naver_cafe",
    label: "네이버 카페 소유권(카페 매니저/운영권 이전) (약관/정책 이슈 가능)",
    asset_type: "channel_community",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["members", "posts_mo"],
    required_proofs: ["회원수/활동 지표 캡처", "매니저/운영권 화면 캡처"],
    asset_ref_hint: "카페 URL",
  },
  {
    id: "kakao_openchat",
    label: "카카오톡 오픈채팅방 운영권/방장 권한 이전 (정책 이슈 가능, 실무에선 ‘운영권/관리권’ 명칭 사용)",
    asset_type: "channel_community",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["members", "messages_day"],
    required_proofs: ["참여자 수 캡처", "방장/운영자 화면 캡처"],
    asset_ref_hint: "오픈채팅 링크",
  },
  {
    id: "discord",
    label: "디스코드 서버 소유권(Owner 이전)",
    asset_type: "channel_community",
    transfer_default: "owner_transfer",
    policy_risk: "medium",
    required_metrics: ["members"],
    required_proofs: ["Owner 권한 화면 캡처", "서버 인사이트(있으면)"],
    asset_ref_hint: "초대 링크",
  },
  {
    id: "telegram",
    label: "텔레그램 채널/그룹 소유권(Owner/관리자 이전)",
    asset_type: "channel_community",
    transfer_default: "owner_transfer",
    policy_risk: "medium",
    required_metrics: ["members"],
    required_proofs: ["멤버수/인사이트 캡처"],
    asset_ref_hint: "채널/그룹 링크",
  },
  {
    id: "naver_band",
    label: "네이버 밴드(BAND) 운영권",
    asset_type: "channel_community",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["members"],
    required_proofs: ["멤버수 캡처", "운영자 화면 캡처"],
    asset_ref_hint: "밴드 링크",
  },
  {
    id: "facebook_group",
    label: "페이스북 그룹 관리자 권한(관리자 추가/권한 이전) (정책 이슈 가능)",
    asset_type: "channel_community",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["members"],
    required_proofs: ["그룹 인사이트 캡처", "관리자 화면 캡처"],
    asset_ref_hint: "그룹 링크",
  },
  {
    id: "reddit_sub",
    label: "Reddit 서브레딧 mod 권한(권한 이전 형태) (정책 이슈 가능)",
    asset_type: "channel_community",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["members"],
    required_proofs: ["mod 권한/설정 캡처"],
    asset_ref_hint: "서브레딧 링크",
  },
  {
    id: "community_forum",
    label: "커뮤니티 포럼(자체 사이트) 운영권(도메인+서버+DB 포함)",
    asset_type: "channel_community",
    transfer_default: "asset_purchase_agreement",
    policy_risk: "low",
    required_metrics: ["traffic_mo"],
    required_proofs: ["도메인/서버 소유 증빙", "GA/GSC 캡처"],
    asset_ref_hint: "사이트 URL",
  },

  // =========================
  // 2) SNS 계정/페이지 “운영권” 유형
  // =========================
  {
    id: "instagram",
    label: "인스타그램 계정 운영권 (정책 이슈 가능, ‘브랜딩 자산/컨텐츠 채널’로 표현)",
    asset_type: "social_account",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["followers", "reach_mo"],
    required_proofs: ["인사이트 캡처"],
    asset_ref_hint: "프로필 URL",
  },
  {
    id: "tiktok",
    label: "틱톡 계정 운영권 (정책 이슈 가능)",
    asset_type: "social_account",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["followers", "views_mo"],
    required_proofs: ["애널리틱스 캡처"],
    asset_ref_hint: "프로필 URL",
  },
  {
    id: "x",
    label: "X(트위터) 계정 운영권 (정책 이슈 가능)",
    asset_type: "social_account",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["followers", "impressions_mo"],
    required_proofs: ["애널리틱스 캡처"],
    asset_ref_hint: "프로필 URL",
  },
  {
    id: "threads",
    label: "스레드(Threads) 계정 운영권 (정책 이슈 가능)",
    asset_type: "social_account",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["followers"],
    required_proofs: ["프로필/지표 캡처"],
    asset_ref_hint: "프로필 URL",
  },
  {
    id: "facebook_page",
    label: "페이스북 페이지 운영권",
    asset_type: "social_account",
    transfer_default: "admin_transfer",
    policy_risk: "high",
    required_metrics: ["followers"],
    required_proofs: ["페이지 인사이트 캡처"],
    asset_ref_hint: "페이지 링크",
  },
  {
    id: "linkedin_page",
    label: "링크드인 페이지 운영권(기업/브랜드 페이지)",
    asset_type: "social_account",
    transfer_default: "admin_transfer",
    policy_risk: "medium",
    required_metrics: ["followers"],
    required_proofs: ["페이지 관리자 화면 캡처"],
    asset_ref_hint: "페이지 링크",
  },

  // =========================
  // 3) 웹/앱 자산(가장 “합법·거래 친화적”)
  // =========================
  {
    id: "website",
    label: "웹사이트(콘텐츠 사이트/커뮤니티/툴) 소유권",
    asset_type: "web_app",
    transfer_default: "asset_purchase_agreement",
    policy_risk: "low",
    required_metrics: ["traffic_mo", "revenue_mo"],
    required_proofs: ["GA/GSC 캡처", "도메인/서버 소유 증빙"],
    asset_ref_hint: "사이트 URL",
  },
  {
    id: "domain",
    label: "도메인 소유권",
    asset_type: "web_app",
    transfer_default: "domain_transfer",
    policy_risk: "low",
    required_metrics: [],
    required_proofs: ["레지스트라 소유 화면 캡처"],
    asset_ref_hint: "도메인",
  },
  {
    id: "hosting_cloud",
    label: "호스팅/서버/클라우드 계정 이전(또는 소유자 변경)",
    asset_type: "web_app",
    transfer_default: "admin_transfer",
    policy_risk: "medium",
    required_metrics: [],
    required_proofs: ["계정 소유/결제 증빙"],
    asset_ref_hint: "서비스/계정 식별(예: AWS, GCP, NCP)",
  },
  {
    id: "app_bundle",
    label: "앱(iOS/Android) + 소스코드 + 스토어 계정 이전(또는 앱 이전)",
    asset_type: "web_app",
    transfer_default: "asset_purchase_agreement",
    policy_risk: "low",
    required_metrics: ["downloads_mo", "revenue_mo"],
    required_proofs: ["스토어 콘솔 캡처", "리포지토리/소스코드 접근 증빙"],
    asset_ref_hint: "앱 링크/패키지명/번들ID",
  },
  {
    id: "ops_db_templates",
    label: "노션/에어테이블/구글시트 기반 운영 DB(템플릿+운영권)",
    asset_type: "web_app",
    transfer_default: "asset_purchase_agreement",
    policy_risk: "low",
    required_metrics: [],
    required_proofs: ["템플릿/DB 샘플", "권리/공유 권한 증빙"],
    asset_ref_hint: "미리보기/공유 링크",
  },
];

export const PLATFORM_GROUPS: Array<{ group: string; items: PlatformSpec[] }> = [
  {
    group: "1) 채널·커뮤니티 “소유권” 유형",
    items: PLATFORM_SPECS.filter((x) => x.asset_type === "channel_community"),
  },
  {
    group: "2) SNS 계정/페이지 “운영권” 유형",
    items: PLATFORM_SPECS.filter((x) => x.asset_type === "social_account"),
  },
  {
    group: "3) 웹/앱 자산(가장 “합법·거래 친화적”)",
    items: PLATFORM_SPECS.filter((x) => x.asset_type === "web_app"),
  },
];

export function getPlatformSpec(id: string) {
  return PLATFORM_SPECS.find((p) => p.id === id);
}