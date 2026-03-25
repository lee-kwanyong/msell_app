"use client";

import { useActionState, useMemo, useState } from "react";
import { signupAction } from "./actions";

const initialState = {
  error: "",
  success: "",
};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [smsError, setSmsError] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const normalizedPhone = useMemo(
    () => phoneNumber.replace(/\D/g, ""),
    [phoneNumber]
  );

  async function sendCode() {
    setSmsLoading(true);
    setSmsMessage("");
    setSmsError("");

    try {
      const response = await fetch("/api/phone/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: normalizedPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setSmsError(data.error || "인증번호 발송에 실패했습니다.");
        return;
      }

      setSmsMessage(data.message || "인증번호를 발송했습니다.");
    } catch {
      setSmsError("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setSmsLoading(false);
    }
  }

  async function verifyCode() {
    setSmsLoading(true);
    setSmsMessage("");
    setSmsError("");

    try {
      const response = await fetch("/api/phone/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: normalizedPhone,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setVerified(false);
        setSmsError(data.error || "인증 확인에 실패했습니다.");
        return;
      }

      setVerified(true);
      setSmsMessage(data.message || "휴대폰 인증이 완료되었습니다.");
    } catch {
      setVerified(false);
      setSmsError("인증 확인 중 오류가 발생했습니다.");
    } finally {
      setSmsLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 16px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(47,36,23,0.08)",
          border: "1px solid #eadfcf",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: "#2f2417",
            }}
          >
            회원가입
          </h1>
          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#6b5b45",
            }}
          >
            이름, 성별, 연락처, 이메일, 비밀번호를 입력하고
            휴대폰 인증까지 완료해 주세요.
          </p>
        </div>

        <form action={formAction} style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={labelStyle}>이름</span>
            <input name="full_name" required style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={labelStyle}>성별</span>
            <select name="gender" required style={inputStyle}>
              <option value="">선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </label>

          <div style={{ display: "grid", gap: 8 }}>
            <span style={labelStyle}>연락처</span>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                name="phone_number"
                required
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setVerified(false);
                }}
                placeholder="01012345678"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={smsLoading || !normalizedPhone}
                style={secondaryButtonStyle}
              >
                {smsLoading ? "발송중" : "인증번호 발송"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="인증번호 6자리"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={verifyCode}
                disabled={smsLoading || !normalizedPhone || !code}
                style={secondaryButtonStyle}
              >
                확인
              </button>
            </div>

            {verified ? (
              <div style={successBoxStyle}>휴대폰 인증이 완료되었습니다.</div>
            ) : null}

            {!verified && smsMessage ? (
              <div style={infoBoxStyle}>{smsMessage}</div>
            ) : null}

            {smsError ? (
              <div style={errorBoxStyle}>{smsError}</div>
            ) : null}
          </div>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={labelStyle}>이메일</span>
            <input name="email" type="email" required style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={labelStyle}>비밀번호</span>
            <input name="password" type="password" required style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={labelStyle}>비밀번호 확인</span>
            <input
              name="password_confirm"
              type="password"
              required
              style={inputStyle}
            />
          </label>

          {state?.error ? <div style={errorBoxStyle}>{state.error}</div> : null}

          <button type="submit" disabled={pending || !verified} style={primaryButtonStyle}>
            {pending ? "가입 처리중..." : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#2f2417",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 14,
  border: "1px solid #d9ccb8",
  background: "#fffdf9",
  padding: "0 14px",
  fontSize: 15,
  outline: "none",
  color: "#2f2417",
};

const primaryButtonStyle: React.CSSProperties = {
  height: 52,
  borderRadius: 16,
  border: "none",
  background: "#2f2417",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 6,
};

const secondaryButtonStyle: React.CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: "1px solid #d9ccb8",
  background: "#eadfcf",
  color: "#2f2417",
  fontSize: 14,
  fontWeight: 700,
  padding: "0 14px",
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const infoBoxStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: "12px 14px",
  background: "#f7f1e7",
  border: "1px solid #eadfcf",
  color: "#6b5b45",
  fontSize: 14,
};

const successBoxStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: "12px 14px",
  background: "#eef7ef",
  border: "1px solid #cfe7d2",
  color: "#215c2f",
  fontSize: 14,
  fontWeight: 700,
};

const errorBoxStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: "12px 14px",
  background: "#fff1f1",
  border: "1px solid #f0caca",
  color: "#9a2f2f",
  fontSize: 14,
};