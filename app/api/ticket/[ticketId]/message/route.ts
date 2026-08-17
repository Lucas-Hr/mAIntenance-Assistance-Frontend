import {
  NextRequest,
  NextResponse,
} from "next/server";


interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}


export async function POST(
  request: NextRequest,
  context: RouteContext
) {

  try {

    const {
      ticketId,
    } = await context.params;

    const body =
      await request.json();

    const message =
      body?.message;

    if (
      !message ||
      typeof message !== "string"
    ) {

      return NextResponse.json(
        {
          error:
            "Le champ 'message' est requis.",
        },
        {
          status: 400,
        }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ||
      "http://127.0.0.1:8000";

    const response =
      await fetch(
        `${backendUrl}/api/tickets/${ticketId}/message`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
          }),

          cache: "no-store",
        }
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.includes(
        "application/json"
      )
    ) {

      const text =
        await response.text();

      console.error(
        "Réponse backend non JSON :",
        text
      );

      return NextResponse.json(
        {
          error:
            "Le backend a retourné une réponse non JSON.",
        },
        {
          status: 502,
        }
      );
    }

    const data =
      await response.json();

    if (!response.ok) {

      return NextResponse.json(
        {
          error:
            data.detail ||
            data.error ||
            "Erreur du backend.",
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json(
      data
    );

  } catch (error) {

    console.error(
      "Erreur route message :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de contacter le backend.",
      },
      {
        status: 500,
      }
    );
  }
}