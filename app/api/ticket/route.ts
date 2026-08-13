import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { texte } = await request.json();

    if (!texte || typeof texte !== "string") {
      return NextResponse.json({ error: "Le champ 'texte' est requis." }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

    const res = await fetch(`${backendUrl}/ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texte_original: texte }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Erreur du backend : " + errText }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur : " + (err as Error).message }, { status: 500 });
  }
}