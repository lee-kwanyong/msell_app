export type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "reserved"
  | "sold"
  | "hidden"
  | "rejected"
  | "archived";

export type DealStatus =
  | "open"
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "closed";

export function getListingStatusLabel(status?: string | null) {
  switch (status) {
    case "draft":
      return "임시저장";
    case "pending_review":
      return "검토대기";
    case "active":
      return "거래가능";
    case "reserved":
      return "예약중";
    case "sold":
      return "거래종료";
    case "hidden":
      return "숨김";
    case "rejected":
      return "반려";
    case "archived":
      return "보관됨";
    default:
      return "알 수 없음";
  }
}

export function getDealStatusLabel(status?: string | null) {
  switch (status) {
    case "open":
      return "문의중";
    case "pending":
      return "조율중";
    case "accepted":
      return "수락됨";
    case "in_progress":
      return "진행중";
    case "completed":
      return "완료";
    case "cancelled":
      return "취소됨";
    case "closed":
      return "종료";
    default:
      return "알 수 없음";
  }
}

export function getStatusTone(status?: string | null) {
  switch (status) {
    case "active":
    case "accepted":
    case "completed":
      return "success";
    case "reserved":
    case "pending_review":
    case "pending":
    case "in_progress":
    case "open":
      return "warning";
    case "sold":
    case "hidden":
    case "archived":
    case "closed":
    case "cancelled":
      return "neutral";
    case "rejected":
      return "danger";
    case "draft":
      return "subtle";
    default:
      return "subtle";
  }
}

export function getListingErrorMessage(error?: string | null) {
  switch (error) {
    case "listing_not_found":
      return "등록글을 찾을 수 없습니다.";
    case "listing_not_available":
      return "현재 거래를 시작할 수 없는 등록글입니다.";
    case "seller_not_found":
      return "판매자 정보를 찾을 수 없습니다.";
    case "cannot_deal_with_own_listing":
      return "본인 등록글에는 거래 문의를 시작할 수 없습니다.";
    case "failed_to_check_existing_deal":
      return "기존 거래방 확인 중 문제가 발생했습니다.";
    case "failed_to_create_deal":
      return "거래방 생성 중 문제가 발생했습니다.";
    case "missing_required_fields":
      return "필수 항목이 누락되었습니다.";
    default:
      return "";
  }
}

export function getDealErrorMessage(error?: string | null) {
  switch (error) {
    case "deal_not_found":
      return "거래방을 찾을 수 없습니다.";
    case "forbidden":
      return "이 거래방에 접근할 수 없습니다.";
    case "missing_required_fields":
      return "메시지를 보내려면 필수 항목을 입력해야 합니다.";
    case "failed_to_send_message":
      return "메시지 전송 중 문제가 발생했습니다.";
    default:
      return "";
  }
}