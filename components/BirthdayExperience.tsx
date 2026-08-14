"use client";

import Image from "next/image";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type GroupChoice = "with-us" | "plus-one" | "larger";
type SaveState = "idle" | "saving" | "saved" | "local" | "error";

type Rsvp = {
  dates: string[];
  flexible: boolean;
  group: GroupChoice;
  groupSize: number;
  note: string;
  updatedAt: string;
};

const STORAGE_KEY = "julian-birthday-rsvp-v1";
const festivalDates = Array.from({ length: 18 }, (_, index) => {
  const day = index + 8;
  const iso = "2027-07-" + String(day).padStart(2, "0");
  const label = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2027, 6, day)));
  return { iso, label };
});

const initialRsvp: Rsvp = {
  dates: [],
  flexible: true,
  group: "with-us",
  groupSize: 6,
  note: "",
  updatedAt: "",
};

function PortraitCutout({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const source = new window.Image();
    source.src = "/images/doctor-burg.webp";
    source.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = source.naturalWidth;
      const height = source.naturalHeight;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(source, 0, 0);
      const frame = context.getImageData(0, 0, width, height);
      const pixels = frame.data;

      for (let y = 0; y < height; y += 1) {
        const sampleY = Math.min(y, Math.floor(height * 0.54));
        const leftIndex = (sampleY * width + 6) * 4;
        const rightIndex = (sampleY * width + width - 7) * 4;
        for (let x = 0; x < width; x += 1) {
          const index = (y * width + x) * 4;
          const ratio = x / Math.max(1, width - 1);
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const bgRed = pixels[leftIndex] * (1 - ratio) + pixels[rightIndex] * ratio;
          const bgGreen = pixels[leftIndex + 1] * (1 - ratio) + pixels[rightIndex + 1] * ratio;
          const bgBlue = pixels[leftIndex + 2] * (1 - ratio) + pixels[rightIndex + 2] * ratio;
          const distance = Math.hypot(red - bgRed, green - bgGreen, blue - bgBlue);
          const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
          const score = distance + Math.max(0, saturation - 18) * 0.55;
          pixels[index + 3] = Math.max(0, Math.min(255, ((score - 17) * 255) / 35));
        }
      }
      context.putImageData(frame, 0, 0);
      setReady(true);
    };
  }, []);

  return (
    <div className={"portrait-cutout " + className + (ready ? " is-ready" : "")}>
      <canvas ref={canvasRef} aria-label="Porträt von Julian Burg" role="img" />
      {!ready && <span className="portrait-loading" aria-hidden="true" />}
    </div>
  );
}

function Crown() {
  return (
    <svg className="crown" viewBox="0 0 220 150" aria-hidden="true">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b651e" />
          <stop offset=".28" stopColor="#f3d487" />
          <stop offset=".55" stopColor="#a8782b" />
          <stop offset=".78" stopColor="#efd187" />
          <stop offset="1" stopColor="#6f4a16" />
        </linearGradient>
      </defs>
      <path
        d="M20 115 9 43l51 34L82 17l31 56 42-58 10 64 46-37-16 73Z"
        fill="url(#gold)"
        stroke="#f7dea0"
        strokeWidth="3"
      />
      <path d="M20 115h175l-8 22H28Z" fill="url(#gold)" stroke="#f7dea0" strokeWidth="3" />
      <circle cx="10" cy="42" r="8" fill="#ddb75f" />
      <circle cx="82" cy="16" r="8" fill="#ddb75f" />
      <circle cx="155" cy="14" r="8" fill="#ddb75f" />
      <circle cx="211" cy="41" r="8" fill="#ddb75f" />
    </svg>
  );
}

function CinematicIntro({ onDone }: { onDone: () => void }) {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setScene(4);
      const timer = window.setTimeout(onDone, 2600);
      return () => window.clearTimeout(timer);
    }
    const timers = [
      window.setTimeout(() => setScene(1), 2200),
      window.setTimeout(() => setScene(2), 5000),
      window.setTimeout(() => setScene(3), 8800),
      window.setTimeout(() => setScene(4), 12100),
      window.setTimeout(onDone, 16100),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [onDone]);

  return (
    <div className="cinema" role="dialog" aria-modal="true" aria-label="Geburtstags-Intro">
      <div className="film-grain" aria-hidden="true" />
      <button className="skip-button" type="button" onClick={onDone}>
        Intro überspringen
      </button>

      <section className={"cinema-scene invitation-scene " + (scene === 0 ? "active" : "")}>
        <p className="cinema-kicker">Eine Einladung für</p>
        <span className="gold-line" />
        <p className="cinema-name">einen besonderen Jahrgang</p>
      </section>

      <section className={"cinema-scene birthday-scene " + (scene === 1 ? "active" : "")}>
        <p className="cinema-kicker">MMXXVI</p>
        <h1>Happy Birthday,<br /><em>Julian.</em></h1>
        <span className="age-mark">33</span>
      </section>

      <section className={"cinema-scene portrait-scene " + (scene === 2 ? "active" : "")}>
        <div className="portrait-stage">
          <Crown />
          <PortraitCutout />
        </div>
        <div className="portrait-caption">
          <span>Dr. Burg</span><i />
          <span>Jahrgang 1993</span><i />
          <span>Grand Cru</span>
        </div>
      </section>

      <section className={"cinema-scene vineyard-scene " + (scene === 3 ? "active" : "")}>
        <Image
          src="/images/vineyard-blue-hour.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="cinema-backdrop"
        />
        <div className="vineyard-shade" />
        <p className="cinema-kicker">Ein Sommerabend über Würzburg</p>
        <h2>Zwischen Reben,<br />Lichtern <em>&amp; Wein.</em></h2>
      </section>

      <section className={"cinema-scene gift-scene " + (scene === 4 ? "active" : "")}>
        <p className="cinema-kicker">Dein Geschenk</p>
        <h2>WEIN<br />AM STEIN</h2>
        <div className="gift-date">08.–25. Juli 2027</div>
        <p>Würzburg · der Tag gehört dir</p>
      </section>
    </div>
  );
}

function RsvpPlanner() {
  const [form, setForm] = useState<Rsvp>(initialRsvp);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("Noch nicht gespeichert.");

  useEffect(() => {
    let local: Rsvp | null = null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        local = JSON.parse(stored) as Rsvp;
        setForm(local);
        setSaveState("saved");
        setMessage(
          "Zuletzt geändert: " +
            new Intl.DateTimeFormat("de-DE", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(local.updatedAt)),
        );
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    const loadRemote = async () => {
      try {
        const response = await fetch("/api/rsvp", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { data: Rsvp | null };
        if (
          payload.data &&
          (!local || Date.parse(payload.data.updatedAt) > Date.parse(local.updatedAt))
        ) {
          setForm(payload.data);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.data));
          setSaveState("saved");
          setMessage("Deine zuletzt gespeicherte Auswahl ist geladen.");
        }
      } catch {
        // Local storage remains the source of truth when cloud sync is unavailable.
      }
    };
    void loadRemote();
  }, []);

  const toggleDate = (iso: string) => {
    setForm((current) => ({
      ...current,
      flexible: false,
      dates: current.dates.includes(iso)
        ? current.dates.filter((date) => date !== iso)
        : [...current.dates, iso].sort(),
    }));
    setSaveState("idle");
    setMessage("Änderungen noch nicht gespeichert.");
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.dates.length === 0 && !form.flexible) {
      setSaveState("error");
      setMessage("Wähle mindestens einen Tag oder »flexibel«.");
      return;
    }
    const next = { ...form, updatedAt: new Date().toISOString() };
    setForm(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaveState("saving");
    setMessage("Wird gespeichert …");

    try {
      const response = await fetch("/api/rsvp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (response.ok) {
        setSaveState("saved");
        setMessage("Gespeichert. Du kannst deine Auswahl jederzeit ändern.");
      } else if (response.status === 503) {
        setSaveState("local");
        setMessage("Auf diesem Gerät gespeichert. Cloud-Speicherung ist optional.");
      } else {
        setSaveState("error");
        setMessage("Lokal gespeichert – die Cloud-Synchronisierung hat gerade nicht geklappt.");
      }
    } catch {
      setSaveState("local");
      setMessage("Auf diesem Gerät gespeichert. Online-Sync folgt beim nächsten Speichern.");
    }
  };

  return (
    <form className="planner-form" onSubmit={save}>
      <fieldset>
        <legend><span>01</span> Wann passt es dir?</legend>
        <p className="field-hint">
          Das Programm ist noch nicht veröffentlicht. Markiere alle Tage, die grundsätzlich gehen.
        </p>
        <div className="date-grid">
          {festivalDates.map((date) => (
            <label key={date.iso} className={form.dates.includes(date.iso) ? "selected" : ""}>
              <input
                type="checkbox"
                checked={form.dates.includes(date.iso)}
                onChange={() => toggleDate(date.iso)}
              />
              <span>{date.label.split(",")[0]}</span>
              <strong>{date.label.split(",")[1]}</strong>
            </label>
          ))}
        </div>
        <label className={"flex-option " + (form.flexible ? "selected" : "")}>
          <input
            type="checkbox"
            checked={form.flexible}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                flexible: event.target.checked,
                dates: event.target.checked ? [] : current.dates,
              }));
              setSaveState("idle");
              setMessage("Änderungen noch nicht gespeichert.");
            }}
          />
          <span>Ich bin flexibel</span>
          <small>Ihr sucht den besten Festivalabend aus.</small>
        </label>
      </fieldset>

      <fieldset>
        <legend><span>02</span> In welcher Runde?</legend>
        <div className="group-options" role="group" aria-label="Gruppengröße">
          {[
            ["with-us", "Nur mit uns", "Die Geburtstags-Crew"],
            ["plus-one", "Mit +1", "Du bringst jemanden mit"],
            ["larger", "Größere Runde", "Wir machen eine Tafel daraus"],
          ].map(([value, title, description]) => (
            <button
              type="button"
              key={value}
              className={form.group === value ? "selected" : ""}
              aria-pressed={form.group === value}
              onClick={() => {
                setForm((current) => ({ ...current, group: value as GroupChoice }));
                setSaveState("idle");
                setMessage("Änderungen noch nicht gespeichert.");
              }}
            >
              <strong>{title}</strong>
              <span>{description}</span>
            </button>
          ))}
        </div>
        {form.group === "larger" && (
          <label className="size-control">
            <span>Wie groß darf die Runde werden?</span>
            <input
              type="range"
              min="5"
              max="12"
              value={form.groupSize}
              onChange={(event) =>
                setForm((current) => ({ ...current, groupSize: Number(event.target.value) }))
              }
            />
            <output>{form.groupSize} Personen</output>
          </label>
        )}
      </fieldset>

      <fieldset>
        <legend><span>03</span> Noch ein Wunsch?</legend>
        <label className="note-field">
          <span className="sr-only">Nachricht an uns</span>
          <textarea
            maxLength={500}
            value={form.note}
            onChange={(event) => {
              setForm((current) => ({ ...current, note: event.target.value }));
              setSaveState("idle");
              setMessage("Änderungen noch nicht gespeichert.");
            }}
            placeholder="Lieblingsmenschen, Zimmerwunsch, unbedingt noch …"
          />
          <small>{form.note.length}/500</small>
        </label>
      </fieldset>

      <div className="save-row">
        <button className="save-button" type="submit" disabled={saveState === "saving"}>
          {saveState === "saving" ? "Wird gespeichert …" : "Wunsch speichern"}
        </button>
        <p className={"save-status " + saveState} aria-live="polite">{message}</p>
      </div>
    </form>
  );
}

export default function BirthdayExperience() {
  const [showIntro, setShowIntro] = useState(true);
  const closeIntro = useCallback(() => {
    setShowIntro(false);
    document.documentElement.classList.remove("intro-open");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("intro-open", showIntro);
    return () => document.documentElement.classList.remove("intro-open");
  }, [showIntro]);

  return (
    <>
      {showIntro && <CinematicIntro onDone={closeIntro} />}

      <header className="site-header">
        <a className="monogram" href="#top" aria-label="Zum Anfang">JB</a>
        <p>Jahrgang 1993 · Würzburg 2027</p>
        <button type="button" onClick={() => setShowIntro(true)}>Intro wiederholen</button>
      </header>

      <main id="top">
        <section className="gift-hero">
          <Image
            src="/images/vineyard-blue-hour.png"
            alt="Ein beleuchteter Weinberg über Würzburg zur blauen Stunde"
            fill
            priority
            sizes="100vw"
            className="gift-hero-image"
          />
          <div className="hero-wash" />
          <div className="hero-copy">
            <p className="eyebrow">Für Julian · zum 33.</p>
            <h1>Ein guter Jahrgang<br />verdient einen <em>großen Abend.</em></h1>
            <div className="hero-rule" />
            <p className="hero-lead">
              Wir schenken dir einen Trip nach Würzburg – zu WEIN AM STEIN 2027.
              Welcher Abend es wird und wer mitkommt, entscheidest du.
            </p>
            <a className="text-link" href="#planner">Wunschabend wählen <span>↓</span></a>
          </div>
          <div className="hero-stamp">
            <span>08–25</span>
            <strong>JUL</strong>
            <small>2027</small>
          </div>
        </section>

        <section className="gift-letter" aria-labelledby="gift-title">
          <div className="section-number">I</div>
          <div>
            <p className="eyebrow dark">Die Einladung</p>
            <h2 id="gift-title">Lieber Julian,</h2>
            <p className="dropcap">
              zum Geburtstag gibt es keinen Gegenstand. Es gibt Aussicht, einen langen Tisch,
              kalten Silvaner und einen Sommerabend über Würzburg. Wir laden dich nächstes Jahr
              zum WEIN AM STEIN ein – Anreise, gute Gesellschaft und Vorfreude inklusive.
            </p>
            <p>Du suchst den Termin aus. Wir kümmern uns um den Rest.</p>
            <div className="signature">Auf dich. <span>Deine Crew</span></div>
          </div>
          <aside>
            <span>Das Geschenk</span>
            <strong>1 Reise</strong>
            <strong>18 mögliche Abende</strong>
            <strong>100 % Julian</strong>
          </aside>
        </section>

        <section className="planner-section" id="planner" aria-labelledby="planner-title">
          <div className="planner-heading">
            <p className="eyebrow">Dein Wunschplaner</p>
            <h2 id="planner-title">Wann stoßen wir an?</h2>
            <p>
              Das Festival läuft offiziell vom 8. bis 25. Juli 2027. Line-up und Einzeltage
              werden erst noch veröffentlicht – deine Auswahl ist deshalb bewusst vorläufig
              und jederzeit änderbar.
            </p>
          </div>
          <RsvpPlanner />
        </section>

        <section className="festival-editorial" aria-labelledby="festival-title">
          <div className="editorial-title">
            <p className="eyebrow dark">Was dich erwartet</p>
            <h2 id="festival-title">Der Stein.<br /><em>Nach Sonnenuntergang.</em></h2>
          </div>
          <div className="editorial-copy">
            <p className="large">
              WEIN AM STEIN verbindet Würzburger Wein, Sommernächte und den Blick aus einer
              der berühmtesten Weinlagen der Stadt.
            </p>
            <div className="fact-lines">
              <article>
                <span>01</span>
                <div><h3>Der Ort</h3><p>Der Würzburger Stein liegt über der Stadt. Reben, Main und Dächer werden bei Dämmerung zur Kulisse.</p></div>
              </article>
              <article>
                <span>02</span>
                <div><h3>Der Abend</h3><p>Wein, Musik und fränkische Lebensart – sommerlich, ungezwungen und mit ausreichend Zeit für das nächste Glas.</p></div>
              </article>
              <article>
                <span>03</span>
                <div><h3>Der Plan</h3><p>18 mögliche Festivaltage. Sobald das Programm steht, machen wir aus deiner Auswahl den perfekten Termin.</p></div>
              </article>
            </div>
          </div>
        </section>

        <section className="weekend" aria-labelledby="weekend-title">
          <div className="weekend-intro">
            <p className="eyebrow">48 Stunden Würzburg</p>
            <h2 id="weekend-title">Ein Wochenende,<br />das langsam beginnt.</h2>
          </div>
          <ol className="timeline">
            <li>
              <time>Freitag · 18:00</time>
              <h3>Brückenschoppen</h3>
              <p>Auf der Alten Mainbrücke ankommen, über den Main schauen und Würzburg sein lassen.</p>
            </li>
            <li>
              <time>Samstag · 11:00</time>
              <h3>Residenz &amp; Altstadt</h3>
              <p>Barocke Grandezza, ein Spaziergang durch die Gassen und genug Zeit für einen Espresso.</p>
            </li>
            <li className="highlight">
              <time>Samstag · Blaue Stunde</time>
              <h3>WEIN AM STEIN</h3>
              <p>Hinauf in die Reben. Das Licht wird golden, die Stadt leuchtet – und wir stoßen auf dich an.</p>
            </li>
            <li>
              <time>Sonntag · 11:30</time>
              <h3>Festung &amp; Steinweinpfad</h3>
              <p>Festung Marienberg, Aussicht und ein letzter Weg durch die berühmte Weinlage.</p>
            </li>
          </ol>
        </section>

        <section className="final-toast">
          <div className="toast-glow" aria-hidden="true" />
          <p className="eyebrow">Auf 33 gute Jahre</p>
          <h2>Und auf alles,<br />was jetzt <em>reift.</em></h2>
          <p>Happy Birthday, Julian.</p>
          <div className="final-actions">
            <a href="#planner">Auswahl ändern</a>
            <button type="button" onClick={() => setShowIntro(true)}>Film noch einmal</button>
          </div>
        </section>
      </main>

      <footer>
        <span>Für Julian Burg · privat gebraut in 2026</span>
        <a href="https://wein-am-stein.de/" target="_blank" rel="noreferrer">
          Offizielle Festival-Seite ↗
        </a>
      </footer>
    </>
  );
}
