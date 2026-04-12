import React, { useState } from "react";
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react";
import { aiAPI } from "../../services/api";

const SECTION_CONFIG = {
  strengths: {
    icon: TrendingUp,
    label: "Strengths",
    color: "#10b981",
    bg: "#d1fae5",
    darkBg: "#064e3b",
    emoji: "💪",
  },
  weaknesses: {
    icon: AlertTriangle,
    label: "Areas to Improve",
    color: "#f59e0b",
    bg: "#fef3c7",
    darkBg: "#451a03",
    emoji: "⚠️",
  },
  suggestions: {
    icon: Lightbulb,
    label: "Suggestions",
    color: "#6366f1",
    bg: "#eef2ff",
    darkBg: "#1e1b4b",
    emoji: "💡",
  },
};

const ScoreDot = ({ points, color }) => {
  const total = 5;
  const filled = Math.min(Math.round(points), total);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i < filled ? color : "var(--border)",
            transition: "background 0.3s",
          }}
        />
      ))}
      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: 4, fontWeight: 600 }}>
        {points}/5
      </span>
    </div>
  );
};

const InsightItem = ({ item, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "12px 14px",
      borderRadius: 12,
      background: "var(--bg-input)",
      transition: "background 0.15s",
    }}
    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
    onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-input)")}
  >
    <ChevronRight size={14} color={color} style={{ marginTop: 3, flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
          {item.label}
        </span>
        <ScoreDot points={item.points} color={color} />
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
        {item.description}
      </p>
    </div>
  </div>
);

const SectionCard = ({ type, items }) => {
  const config = SECTION_CONFIG[type];
  const Icon = config.icon;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid var(--border)`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          background: `${config.color}0d`,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: `${config.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={15} color={config.color} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "var(--text-primary)",
          }}
        >
          {config.label}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.75rem",
            background: `${config.color}18`,
            color: config.color,
            padding: "2px 10px",
            borderRadius: 99,
            fontWeight: 600,
          }}
        >
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <InsightItem key={i} item={item} color={config.color} />
        ))}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {[1, 2, 3].map(i => (
      <div
        key={i}
        className="skeleton"
        style={{ height: i === 1 ? 140 : i === 2 ? 120 : 160, borderRadius: 16 }}
      />
    ))}
  </div>
);

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await aiAPI.getInsights({
        habits: ["gym", "study", "sleep"],
        tasks: ["complete assignment", "revise DSA"],
        logs: [
          { habit: "gym", completed: false },
          { habit: "study", completed: true },
        ],
      });
      setInsights(res.data.insights);
    } catch (err) {
      console.error("AI ERROR:", err);
      setError("Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-padding" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.0625rem",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              AI Productivity Insights
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, marginTop: 2 }}>
              Seijaku · Personalized analysis
            </p>
          </div>
        </div>

        <button
          onClick={generateInsights}
          className="btn btn-primary btn-sm"
          disabled={loading}
          style={{ gap: 8 }}
        >
          {loading ? (
            <>
              <div
                className="animate-spin"
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                }}
              />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw size={13} />
              {insights ? "Regenerate" : "Generate Insights"}
            </>
          )}
        </button>
      </div>

      {/* Empty state */}
      {!insights && !loading && !error && (
        <div
          style={{
            textAlign: "center",
            padding: "36px 24px",
            background: "var(--bg-input)",
            borderRadius: 14,
            border: "1px dashed var(--border)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🧠</div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              marginBottom: 6,
              color: "var(--text-primary)",
            }}
          >
            Get personalized insights
          </p>
          
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            padding: "14px 18px",
            background: "var(--danger-light)",
            border: "1px solid var(--danger)30",
            borderRadius: 12,
            fontSize: "0.875rem",
            color: "var(--danger)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {insights && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {["strengths", "weaknesses", "suggestions"].map(type =>
            insights[type]?.length > 0 ? (
              <SectionCard key={type} type={type} items={insights[type]} />
            ) : null
          )}
          
        </div>
      )}
    </div>
  );
}