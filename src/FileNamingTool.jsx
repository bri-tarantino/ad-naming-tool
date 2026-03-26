import { useState } from "react";

const PLATFORMS = [
  { label: "Meta", value: "NA" },
  { label: "AppLovin", value: "AL" },
  { label: "TikTok", value: "TT" },
];

const FILE_SIZES = ["1x1", "4x5", "9x16"];

const ACCENT = "#29B6F6";
const BG = "#1a1a1a";
const INPUT_BORDER = "rgba(255,255,255,0.25)";
const TEXT = "#f0f0f0";
const TEXT_MID = "#aaa";
const TEXT_DIM = "#666";
const SESSION_ROW = "#2a2a2a";
const DANGER = "#e53e3e";

const SHEET_URL =
  "https://script.google.com/a/macros/themindcompany.com/s/AKfycbyQ_JhrjfVTAljq_d51FFDh7m0n0zk4oZUibt01dQ0hhHWB1HIQuAnAvtlsgdTaqr0N/exec";

export default function FileNamingTool() {
  const [ticketNum, setTicketNum] = useState("");
  const [assetType, setAssetType] = useState("S");
  const [freeform, setFreeform] = useState("");
  const [fileSize, setFileSize] = useState("1x1");
  const [platform, setPlatform] = useState("NA");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [copied, setCopied] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [sheetStatus, setSheetStatus] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}${dd}${yy}`;
  };

  const sanitize = (t) =>
    t.replace(/[\s\-]+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

  const buildName = (size, plat) => {
    const parts = [
      ticketNum ? `E${ticketNum.replace(/^E/i, "")}` : "",
      assetType === "S" ? "S" : "V",
      sanitize(freeform),
      size,
      formatDate(goLiveDate),
      plat,
    ];
    return parts.filter(Boolean).join("_");
  };

  const getPreview = () => {
    if (!ticketNum || !freeform || !goLiveDate) return [];
    if (assetType === "V") {
      return [
        { name: buildName("4x5", "NA"), label: "4x5 — Meta", size: "4x5", platform: "NA" },
        { name: buildName("9x16", "NA"), label: "9x16 — Meta", size: "9x16", platform: "NA" },
        { name: buildName("9x16", "AL"), label: "9x16 — AppLovin", size: "9x16", platform: "AL" },
      ];
    }
    return [
      {
        name: buildName(fileSize, platform),
        label: `${fileSize} — ${PLATFORMS.find((p) => p.value === platform)?.label}`,
        size: fileSize,
        platform: platform,
      },
    ];
  };

  const preview = getPreview();
  const allFilled = ticketNum && freeform && goLiveDate;

  const sendToSheet = async (entries) => {
    try {
      const ticket = `E${ticketNum.replace(/^E/i, "")}`;
      const type = assetType === "S" ? "Static" : "Video";
      const desc = sanitize(freeform);
      const date = formatDate(goLiveDate);

      const rows = entries.map((e) => ({
        fileName: e.name,
        ticket: ticket,
        assetType: type,
        description: desc,
        size: e.size,
        date: date,
        platform: e.platform,
      }));

      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });

      setSheetStatus("success");
      setTimeout(() => setSheetStatus(null), 2500);
    } catch (err) {
      setSheetStatus("error");
      setTimeout(() => setSheetStatus(null), 3000);
    }
  };

  const addToSession = () => {
    if (!allFilled) return;
    const entries = preview.map((n) => ({
      ...n,
      id: Date.now() + Math.random(),
    }));
    setSessionList((prev) => [...entries, ...prev]);
    sendToSheet(entries);
    setFreeform("");
    setAssetType("S");
    setFileSize("1x1");
    setPlatform("NA");
  };

  const remove = (id) =>
    setSessionList((prev) => prev.filter((i) => i.id !== id));
  const clearAll = () => setSessionList([]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(sessionList.map((n) => n.name).join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const copyCSV = () => {
    navigator.clipboard.writeText(
      ["File Name", ...sessionList.map((n) => n.name)].join("\n")
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const pillInput = {
    padding: "14px 20px",
    fontSize: 15,
    border: `1.5px solid ${INPUT_BORDER}`,
    borderRadius: 50,
    outline: "none",
    background: BG,
    color: TEXT,
    width: "100%",
    boxSizing: "border-box",
  };

  const pillSelect = {
    ...pillInput,
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%2329B6F6' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    paddingRight: 44,
  };

  const label = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: TEXT,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const pillBtn = {
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    border: `1.5px solid rgba(255,255,255,0.25)`,
    borderRadius: 50,
    cursor: "pointer",
    background: "transparent",
    color: TEXT,
    transition: "all 0.15s",
  };

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        color: TEXT,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>🌱</span> Growth | File Naming Tool
          </h1>
          <p style={{ fontSize: 14, color: TEXT_DIM, margin: "6px 0 0" }}>
            Format: Ticket#_AssetType_Freeform_Size_Date_Platform
          </p>
        </div>

        {/* Form */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <label style={label}>Ticket #</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{ fontSize: 16, fontWeight: 700, color: TEXT_MID }}
                >
                  E
                </span>
                <input
                  type="text"
                  value={ticketNum}
                  onChange={(e) =>
                    setTicketNum(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="e.g. 100"
                  style={{ ...pillInput, flex: 1, width: "auto" }}
                />
              </div>
            </div>

            <div>
              <label style={label}>Asset Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["S", "V"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setAssetType(t);
                      if (t === "S") {
                        setFileSize("1x1");
                        setPlatform("NA");
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "14px 0",
                      fontSize: 14,
                      fontWeight: 700,
                      border: "none",
                      borderRadius: 50,
                      cursor: "pointer",
                      background:
                        assetType === t ? ACCENT : "rgba(255,255,255,0.08)",
                      color: assetType === t ? "#fff" : TEXT_MID,
                      transition: "all 0.15s",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t === "S" ? "STATIC (S)" : "VIDEO (V)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={label}>Freeform Description</label>
            <input
              type="text"
              value={freeform}
              onChange={(e) => setFreeform(e.target.value)}
              placeholder="e.g. ARFilter"
              style={pillInput}
            />
            {freeform && sanitize(freeform) !== freeform && (
              <p
                style={{
                  fontSize: 11,
                  color: TEXT_DIM,
                  margin: "6px 0 0 20px",
                }}
              >
                Will be saved as:{" "}
                <span style={{ color: ACCENT }}>{sanitize(freeform)}</span>
              </p>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                assetType === "S" ? "1.2fr 0.8fr 0.8fr" : "1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <label style={label}>Go-Live Date</label>
              <input
                type="date"
                value={goLiveDate}
                onChange={(e) => setGoLiveDate(e.target.value)}
                style={{ ...pillInput, colorScheme: "dark" }}
              />
            </div>
            {assetType === "S" && (
              <>
                <div>
                  <label style={label}>Size</label>
                  <select
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    style={pillSelect}
                  >
                    {FILE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s === "1x1"
                          ? "1×1"
                          : s === "4x5"
                            ? "4×5"
                            : "9×16"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={label}>Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    style={pillSelect}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {assetType === "V" && (
            <div
              style={{
                background: "rgba(41,182,246,0.08)",
                border: `1px solid rgba(41,182,246,0.2)`,
                borderRadius: 16,
                padding: "12px 18px",
                marginBottom: 16,
                fontSize: 13,
                color: ACCENT,
              }}
            >
              Video selected — will auto-generate 3 variants: 4×5 Meta, 9×16
              Meta, 9×16 AppLovin
            </div>
          )}

          {allFilled && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: "12px 18px",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: TEXT_DIM,
                  margin: "0 0 6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Preview
              </p>
              {preview.map((n, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: 12,
                    color: TEXT_MID,
                    marginBottom: 2,
                  }}
                >
                  {preview.length > 1 && (
                    <span style={{ color: TEXT_DIM, fontSize: 11 }}>
                      {n.label}:{" "}
                    </span>
                  )}
                  {n.name}
                </div>
              ))}
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={addToSession}
            disabled={!allFilled}
            style={{
              width: "100%",
              padding: "16px 0",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              borderRadius: 50,
              cursor: allFilled ? "pointer" : "default",
              background: allFilled
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.05)",
              color: allFilled ? TEXT : TEXT_DIM,
              transition: "all 0.15s",
              letterSpacing: "0.02em",
            }}
          >
            + Add to Session List
          </button>

          {/* Sheet status toast */}
          {sheetStatus && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 16px",
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                background:
                  sheetStatus === "success"
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(229,62,62,0.15)",
                color: sheetStatus === "success" ? "#22c55e" : DANGER,
                transition: "all 0.3s",
              }}
            >
              {sheetStatus === "success"
                ? "✓ Logged to Google Sheet"
                : "⚠ Could not reach Google Sheet"}
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            margin: "8px 0 24px",
          }}
        />

        {/* Session List */}
        {sessionList.length > 0 ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Session List ({sessionList.length} file
                {sessionList.length !== 1 ? "s" : ""})
              </h2>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={SHEET_VIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...pillBtn,
                    background: "rgba(255,255,255,0.08)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Google Sheet Log ↗
                </a>
                <button onClick={copyAll} style={pillBtn}>
                  {copiedAll ? "Copied!" : "Copy All"}
                </button>
                <button onClick={copyCSV} style={pillBtn}>
                  CSV
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    ...pillBtn,
                    color: DANGER,
                    borderColor: "rgba(229,62,62,0.3)",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {sessionList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 18px",
                    background: SESSION_ROW,
                    borderRadius: 16,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'SF Mono', 'Fira Code', monospace",
                        fontSize: 13,
                        color: TEXT,
                        wordBreak: "break-all",
                      }}
                    >
                      {item.name}
                    </div>
                    <span style={{ fontSize: 11, color: TEXT_DIM }}>
                      {item.label}
                    </span>
                  </div>
                  <button
                    onClick={() => copy(item.name, item.id)}
                    style={{
                      ...pillBtn,
                      background:
                        copied === item.id ? "#22c55e" : "transparent",
                      color: copied === item.id ? "#fff" : TEXT,
                      borderColor:
                        copied === item.id
                          ? "#22c55e"
                          : "rgba(255,255,255,0.25)",
                      minWidth: 60,
                    }}
                  >
                    {copied === item.id ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: TEXT_DIM,
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "0 2px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: TEXT_DIM,
              fontSize: 14,
            }}
          >
            Generated file names will appear here
          </div>
        )}
      </div>
    </div>
  );
}