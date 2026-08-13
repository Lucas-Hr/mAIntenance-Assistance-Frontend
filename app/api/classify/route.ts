import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const texte = body.texte;

    if (!texte || typeof texte !== "string") {
      return NextResponse.json(
        { error: "Le champ 'texte' est requis." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

    const backendResponse = await fetch(`${backendUrl}/classifier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_ticket: crypto.randomUUID(),
        texte_original: texte,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: "Erreur du backend : " + errorText },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur serveur : " + (err as Error).message },
      { status: 500 }
    );
  }
}