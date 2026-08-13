import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { diagnostic, reponse_utilisateur } = await request.json();

    if (!diagnostic || !reponse_utilisateur) {
      return NextResponse.json(
        { error: "Les champs 'diagnostic' et 'reponse_utilisateur' sont requis." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

    const res = await fetch(`${backendUrl}/diagnostic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnostic, reponse_utilisateur }),
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