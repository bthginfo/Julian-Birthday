import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const databaseUrl = process.env.DATABASE_URL ?? process.env.STORAGE_URL;
const allowedDates = new Set(Array.from({ length: 18 }, (_, i) => "2027-07-" + String(i + 8).padStart(2, "0")));
type Vote = { name: string; dates: string[] };
const tableStatement = `CREATE TABLE IF NOT EXISTS julian_guest_votes (
  id text PRIMARY KEY, edit_token text NOT NULL, name text NOT NULL, dates jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
)`;
const unavailable = () => NextResponse.json({ error: "Die Abstimmung ist gerade nicht erreichbar." }, { status: 503 });
const bad = (error = "Bitte prüfe deinen Namen und deine Terminauswahl.") => NextResponse.json({ error }, { status: 400 });

function validate(value: unknown): Vote | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.name !== "string" || !Array.isArray(input.dates)) return null;
  const name = input.name.trim();
  const dates = Array.from(new Set(input.dates));
  if (name.length < 1 || name.length > 80 || dates.length < 1 || !dates.every((date) => typeof date === "string" && allowedDates.has(date))) return null;
  return { name, dates: dates as string[] };
}

export async function GET() {
  if (!databaseUrl) return unavailable();
  try {
    const sql = neon(databaseUrl);
    await sql.query(tableStatement);
    const rows = (await sql`SELECT id, name, dates, updated_at FROM julian_guest_votes ORDER BY updated_at DESC`) as Array<{ id: string; name: string; dates: string[]; updated_at: string | Date }>;
    return NextResponse.json({ data: rows.map((row) => ({ id: row.id, name: row.name, dates: row.dates, updatedAt: new Date(row.updated_at).toISOString() })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Guest votes GET failed", error);
    return NextResponse.json({ error: "Die Abstimmung konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!databaseUrl) return unavailable();
  let body: unknown;
  try { body = await request.json(); } catch { return bad("Ungültige Anfrage."); }
  const vote = validate(body);
  if (!vote) return bad();
  const id = randomUUID();
  const editToken = randomUUID();
  try {
    const sql = neon(databaseUrl);
    await sql.query(tableStatement);
    const rows = (await sql`INSERT INTO julian_guest_votes (id, edit_token, name, dates) VALUES (${id}, ${editToken}, ${vote.name}, ${JSON.stringify(vote.dates)}::jsonb) RETURNING updated_at`) as Array<{ updated_at: string | Date }>;
    return NextResponse.json({ data: { id, editToken, name: vote.name, dates: vote.dates, updatedAt: new Date(rows[0].updated_at).toISOString() } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Guest votes POST failed", error);
    return NextResponse.json({ error: "Deine Auswahl konnte nicht gespeichert werden." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!databaseUrl) return unavailable();
  let body: unknown;
  try { body = await request.json(); } catch { return bad("Ungültige Anfrage."); }
  if (!body || typeof body !== "object") return bad();
  const input = body as Record<string, unknown>;
  const vote = validate(body);
  if (!vote || typeof input.id !== "string" || typeof input.editToken !== "string" || input.id.length > 100 || input.editToken.length > 100) return bad();
  try {
    const sql = neon(databaseUrl);
    await sql.query(tableStatement);
    const rows = (await sql`UPDATE julian_guest_votes SET name = ${vote.name}, dates = ${JSON.stringify(vote.dates)}::jsonb, updated_at = now() WHERE id = ${input.id} AND edit_token = ${input.editToken} RETURNING updated_at`) as Array<{ updated_at: string | Date }>;
    if (!rows.length) return NextResponse.json({ error: "Diese Antwort kann auf diesem Gerät nicht bearbeitet werden." }, { status: 403 });
    return NextResponse.json({ data: { id: input.id, editToken: input.editToken, name: vote.name, dates: vote.dates, updatedAt: new Date(rows[0].updated_at).toISOString() } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Guest votes PUT failed", error);
    return NextResponse.json({ error: "Deine Auswahl konnte nicht gespeichert werden." }, { status: 500 });
  }
}
