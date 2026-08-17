import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
) {
  try {
    console.log(
      "[API /api/ticket] Requête reçue"
    );

    // ====================================================
    // LECTURE DU BODY
    // ====================================================

    const body = await request.json();

    console.log(
      "[API /api/ticket] Body :",
      body
    );

    const texte = body?.texte;

    if (
      !texte ||
      typeof texte !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Le champ 'texte' est requis.",
        },
        {
          status: 400,
        }
      );
    }

    // ====================================================
    // URL BACKEND
    // ====================================================

    const backendUrl =
      process.env.BACKEND_URL ??
      "http://localhost:8000";

    console.log(
      "[API /api/ticket] Backend :",
      backendUrl
    );

    // ====================================================
    // APPEL BACKEND
    // ====================================================

    const backendResponse =
      await fetch(
        `${backendUrl}/api/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            texte,
          }),
        }
      );

    console.log(
      "[API /api/ticket] Backend status :",
      backendResponse.status
    );

    // ====================================================
    // LIRE LA RÉPONSE BACKEND
    // ====================================================

    const rawBackendResponse =
      await backendResponse.text();

    console.log(
      "[API /api/ticket] Backend response :",
      rawBackendResponse.slice(0, 500)
    );

    // ====================================================
    // VÉRIFIER JSON
    // ====================================================

    let data: unknown;

    try {
      data = JSON.parse(
        rawBackendResponse
      );
    } catch {
      return NextResponse.json(
        {
          error:
            "Le backend a retourné une réponse non JSON.",
          backend_status:
            backendResponse.status,
          backend_response:
            rawBackendResponse.slice(0, 500),
        },
        {
          status: 502,
        }
      );
    }

    // ====================================================
    // ERREUR BACKEND
    // ====================================================

    if (!backendResponse.ok) {
      const backendData =
        data as {
          detail?: string;
          error?: string;
        };

      return NextResponse.json(
        {
          error:
            backendData.detail ??
            backendData.error ??
            "Erreur du backend.",
        },
        {
          status:
            backendResponse.status,
        }
      );
    }

    // ====================================================
    // SUCCÈS
    // ====================================================

    return NextResponse.json(
      data
    );

  } catch (error) {

    console.error(
      "[API /api/ticket] Erreur :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de contacter le backend.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}