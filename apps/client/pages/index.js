import Head from "next/head";
import { useState } from "react";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/nl/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setResult(data);
      if (!res.ok) setError(data?.message || "Request failed");
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div style={{ display: "flex", justifyContent: "center", marginTop: "60px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: 600 }}>
        <input
          type="text"
          placeholder="Type a command, e.g. 'arm the system to stay'"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: 10, fontSize: 16 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSubmit} disabled={loading || !text.trim()}>
            {loading ? "Processing..." : "Submit"}
          </button>
          <button onClick={() => { setText(""); setResult(null); setError(""); }}>
            Clear
          </button>
        </div>
        {error && <div style={{ color: "#c00" }}>{error}</div>}
        {result && (
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div><strong>Input:</strong> {result.input}</div>
            <div style={{ marginTop: 8 }}><strong>Plan:</strong>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.plan, null, 2)}</pre>
            </div>
            <div style={{ marginTop: 8 }}><strong>API Call:</strong>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.api, null, 2)}</pre>
            </div>
            <div style={{ marginTop: 8 }}><strong>Response:</strong>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.response, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
