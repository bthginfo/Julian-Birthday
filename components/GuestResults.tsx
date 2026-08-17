"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const festivalDates = Array.from({ length: 18 }, (_, index) => {
  const day = index + 8;
  const iso = "2027-07-" + String(day).padStart(2, "0");
  const date = new Date(Date.UTC(2027, 6, day));
  return {
    iso,
    short: new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(date),
    long: new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "long", timeZone: "UTC" }).format(date),
  };
});

type GuestVote = {
  id: string;
  name: string;
  dates: string[];
  updatedAt: string;
};

type LoadState = "loading" | "ready" | "error";

export default function GuestResults() {
  const [votes, setVotes] = useState<GuestVote[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("Antworten werden geladen …");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("Antworten werden geladen …");
    try {
      const response = await fetch("/api/guest-votes", { cache: "no-store" });
      const payload = (await response.json()) as { data?: GuestVote[]; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Laden fehlgeschlagen.");
      setVotes(payload.data);
      setState("ready");
      setMessage(payload.data.length ? "Stand jetzt – jederzeit aktualisierbar." : "Noch hat niemand abgestimmt.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Die Antworten konnten nicht geladen werden.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const dateRows = useMemo(() => {
    return festivalDates.map((date) => {
      const names = votes.filter((vote) => vote.dates.includes(date.iso)).map((vote) => vote.name);
      return { ...date, names, count: names.length };
    });
  }, [votes]);
  const bestCount = Math.max(0, ...dateRows.map((row) => row.count));

  return (
    <main className="results-shell">
      <header className="results-topbar">
        <Link className="guest-monogram" href="/" aria-label="Zur Geburtstagsseite">JB</Link>
        <Link href="/">Zur Hauptseite</Link>
      </header>

      <section className="results-hero">
        <p className="eyebrow">Julian · Reiseplanung</p>
        <h1>Wer kann<br /><em>wann?</em></h1>
        <div className="results-summary">
          <strong>{votes.length}</strong>
          <span>{votes.length === 1 ? "Antwort" : "Antworten"}</span>
          <button type="button" onClick={() => void load()} disabled={state === "loading"}>
            {state === "loading" ? "Lädt …" : "Aktualisieren"}
          </button>
        </div>
        <p className={"results-message " + state} aria-live="polite">{message}</p>
      </section>

      {state === "ready" && votes.length === 0 && (
        <section className="results-empty">
          <span>00</span>
          <h2>Noch ist alles offen.</h2>
          <p>Teile den Einladungslink auf der Hauptseite. Sobald jemand abstimmt, erscheint die Antwort hier.</p>
          <Link href="/#planner">Einladung teilen</Link>
        </section>
      )}

      {state === "error" && (
        <section className="results-empty">
          <span>!</span>
          <h2>Gerade keine Verbindung.</h2>
          <p>Die gespeicherten Antworten bleiben erhalten. Versuch es gleich noch einmal.</p>
          <button type="button" onClick={() => void load()}>Erneut laden</button>
        </section>
      )}

      {state === "ready" && votes.length > 0 && (
        <>
          <section className="results-calendar" aria-labelledby="results-calendar-title">
            <div className="results-section-heading">
              <p className="eyebrow">Überschneidungen</p>
              <h2 id="results-calendar-title">Die Tage im Vergleich</h2>
              <p>Gold markiert aktuell die größte gemeinsame Schnittmenge – noch keine endgültige Entscheidung.</p>
            </div>
            <div className="availability-list">
              {dateRows.map((row) => {
                const best = bestCount > 0 && row.count === bestCount;
                const width = votes.length ? Math.round((row.count / votes.length) * 100) : 0;
                return (
                  <article key={row.iso} className={best ? "best" : ""}>
                    <time dateTime={row.iso}><span>{row.short.split(",")[0]}</span><strong>{row.short.split(",")[1]}</strong></time>
                    <div className="availability-detail">
                      <div><span style={{ width: width + "%" }} /></div>
                      <p>{row.names.length ? row.names.join(" · ") : "Noch niemand"}</p>
                    </div>
                    <strong className="availability-count">{row.count}<small>/{votes.length}</small></strong>
                    {best && <em>beste Überschneidung</em>}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="people-results" aria-labelledby="people-title">
            <div className="results-section-heading">
              <p className="eyebrow">Nach Personen</p>
              <h2 id="people-title">Wer hat was gewählt?</h2>
            </div>
            <div className="people-list">
              {votes.map((vote, index) => (
                <article key={vote.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{vote.name}</h3>
                    <p>{vote.dates.map((iso) => festivalDates.find((date) => date.iso === iso)?.short || iso).join(" · ")}</p>
                  </div>
                  <small>{vote.dates.length} {vote.dates.length === 1 ? "Tag" : "Tage"}</small>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <footer className="guest-footer">
        <span>Würzburg · WEIN AM STEIN 2027</span>
        <Link href="/">Zur Hauptseite</Link>
      </footer>
    </main>
  );
}
