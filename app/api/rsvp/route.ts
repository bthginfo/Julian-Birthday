import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GroupChoice = "with-us" | "plus-one" | "larger";

type Rsvp = {
  dates: string[];
  flexible: boolean;
  group: GroupChoice;
  groupSize: number;
  note: string;
  updatedAt: string;
};

const allowedDates = new Set(
  Array.from({ length: 18 }, (_, index) => {
    const day = String(index + 8).padStart(2, "0");
    return "2027-07-" + day;
  }),
);
const allowedGroups = new Set<GroupChoice>(["with-us", "plus-one", "larger"]);

function unavailable() {
  return NextResponse.json(
    { error: "Cloud-Speicherung ist nicht konfiguriert." },
    { status: 503 },
  );
}

function validate(value: unknown): Rsvp | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (
    !Array.isArray(input.dates) ||
    !input.dates.every((date) => typeof date === "string" && allowedDates.has(date)) ||
    typeof input.flexible !== "boolean" ||
    typeof input.group !== "string" ||
    !allowedGroups.has(input.group as GroupChoice) ||
    typeof input.groupSize !== "number" ||
    !Number.isInteger(input.groupSize) ||
    input.groupSize < 5 ||
    input.groupSize > 12 ||
    typeof input.note !== "string" ||
    input.note.length > 500 ||
    typeof input.updatedAt !== "string" ||
    Number.isNaN(Date.parse(input.updatedAt))
  ) {
    return null;
  }
  if (input.dates.length === 0 && !input.flexible) return null;
  return {
    dates: Array.from(new Set(input.dates)),
    flexible: input.flexible,
    group: input.group as GroupChoice,
    groupSize: input.groupSize,
    note: input.note.trim(),
    updatedAt: input.updatedAt,
  };
}

const tableStatement = `
  CREATE TABLE IF NOT EXISTS julian_birthday_rsvp (
    id text PRIMARY KEY,
    payload jsonb NOT NULL,
    updated_at timestamptz NOT NULL
  )
`;

export async function GET() {
  if (!process.env.DATABASE_URL) return unavailable();
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql.query(tableStatement);
    const rows = (await sql`
      SELECT payload, updated_at
      FROM julian_birthday_rsvp
      WHERE id = 'julian'
      LIMIT 1
    `) as Array<{ payload: Rsvp; updated_at: string | Date }>;
    if (rows.length === 0) {
      return NextResponse.json({ data: null }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json(
      {
        data: {
          ...rows[0].payload,
          updatedAt: new Date(rows[0].updated_at).toISOString(),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("RSVP GET failed", error);
    return NextResponse.json({ error: "Speichern gerade nicht erreichbar." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) return unavailable();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const rsvp = validate(body);
  if (!rsvp) {
    return NextResponse.json({ error: "Bitte prüfe deine Auswahl." }, { status: 400 });
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql.query(tableStatement);
    await sql`
      INSERT INTO julian_birthday_rsvp (id, payload, updated_at)
      VALUES ('julian', ${JSON.stringify(rsvp)}::jsonb, ${rsvp.updatedAt})
      ON CONFLICT (id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at
    `;
    return NextResponse.json({ data: rsvp });
  } catch (error) {
    console.error("RSVP PUT failed", error);
    return NextResponse.json({ error: "Speichern gerade nicht erreichbar." }, { status: 500 });
  }
}