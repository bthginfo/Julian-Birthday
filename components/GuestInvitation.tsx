"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const STORAGE_KEY = "julian-guest-vote-v1";
const festivalDates = Array.from({ length: 18 }, (_, index) => {
  const day = index + 8;
  const iso = "2027-07-" + String(day).padStart(2, "0");
  const date = new Date(Date.UTC(2027, 6, day));
  return {
    iso,
    weekday: new Intl.DateTimeFormat("de-DE", { weekday: "short", timeZone: "UTC" }).format(date),
    day: new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(date),
  };
});

type StoredVote = {
  id: string;
  editToken: string;
  name: string;
  dates: string[];
  updatedAt?: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function GuestInvitation() {
  const [name, setName] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [stored, setStored] = useState<StoredVote | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("Du kannst deine Auswahl später auf diesem Gerät ändern.");

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (!value) return;
      const vote = JSON.parse(value) as StoredVote;
      if (vote.id && vote.editToken && vote.name && Array.isArray(vote.dates)) {
        setStored(vote);
        setName(vote.name);
        setDates(vote.dates);
        setSaveState("saved");
        setMessage("Deine letzte Auswahl ist wieder da.");
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const toggleDate = (iso: string) => {
    setDates((current) =>
      current.includes(iso)
        ? current.filter((date) => date !== iso)
        : [...current, iso].sort(),
    );
    setSaveState("idle");
    setMessage("Änderungen noch nicht gespeichert.");
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setSaveState("error");
      setMessage("Sag uns bitte kurz, wie du heißt.");
      return;
    }
    if (!dates.length) {
      setSaveState("error");
      setMessage("Wähl bitte mindestens einen möglichen Tag aus.");
      return;
    }

    setSaveState("saving");
    setMessage("Wird gespeichert …");
    const method = stored ? "PUT" : "POST";
    const body = stored
      ? { id: stored.id, editToken: stored.editToken, name: cleanName, dates }
      : { name: cleanName, dates };

    try {
      const response = await fetch("/api/guest-votes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        data?: StoredVote;
        error?: string;
      };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Speichern fehlgeschlagen.");
      setStored(payload.data);
      setName(payload.data.name);
      setDates(payload.data.dates);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.data));
      setSaveState("saved");
      setMessage(stored ? "Aktualisiert. Julian sieht deine neue Auswahl." : "Gespeichert. Julian sieht jetzt, wann du kannst.");
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "Das Speichern hat gerade nicht geklappt.");
    }
  };

  return (
    <main className="guest-shell">
      <header className="guest-topbar">
        <Link className="guest-monogram" href="/" aria-label="Zur Geburtstagsseite">JB</Link>
        <span>Würzburg · Juli 2027</span>
      </header>

      <section className="guest-hero">
        <p className="eyebrow">Einladung von Julian</p>
        <h1>Du bist<br /><em>dabei.</em></h1>
        <p className="guest-lead">
          Julian hat dich eingeladen, mit nach Würzburg zu kommen: ein entspannter Trip
          und ein Abend bei WEIN AM STEIN – oben in den Reben, mit Musik, Wein und Blick über die Stadt.
        </p>
        <div className="guest-route" aria-label="Der lose Reiseplan">
          <article><span>01</span><strong>Ankommen</strong><small>In Ruhe nach Würzburg und erst mal einchecken.</small></article>
          <article><span>02</span><strong>WEIN AM STEIN</strong><small>Ein gemeinsamer Festivalabend in den Reben.</small></article>
          <article><span>03</span><strong>Ausschlafen</strong><small>Frühstück, Zeit für die Stadt und entspannt zurück.</small></article>
        </div>
      </section>

      <section className="guest-vote" aria-labelledby="guest-vote-title">
        <div className="guest-vote-heading">
          <p className="eyebrow">Sag kurz Bescheid</p>
          <h2 id="guest-vote-title">Wann könntest du?</h2>
          <p>Wähl einfach alle Tage aus, die grundsätzlich passen. Das genaue Programm kommt später.</p>
        </div>

        <form className="guest-form" onSubmit={save}>
          <label className="guest-name">
            <span>Dein Name</span>
            <input
              type="text"
              autoComplete="name"
              maxLength={80}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaveState("idle");
              }}
              placeholder="Wie heißt du?"
            />
          </label>

          <fieldset>
            <legend>Mögliche Festivalabende</legend>
            <div className="guest-date-grid">
              {festivalDates.map((date) => (
                <label key={date.iso} className={dates.includes(date.iso) ? "selected" : ""}>
                  <input type="checkbox" checked={dates.includes(date.iso)} onChange={() => toggleDate(date.iso)} />
                  <span>{date.weekday}</span>
                  <strong>{date.day}</strong>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="guest-save-row">
            <button type="submit" disabled={saveState === "saving"}>
              {saveState === "saving" ? "Moment …" : stored ? "Auswahl aktualisieren" : "Auswahl speichern"}
            </button>
            <p className={"guest-status " + saveState} aria-live="polite">{message}</p>
          </div>
        </form>
      </section>

      <footer className="guest-footer">
        <span>Julian · Julius &amp; Lena · Würzburg 2027</span>
        <Link href="/">Zur Geburtstagsseite</Link>
      </footer>
    </main>
  );
}
