import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: Promise<{ rfc_number: string }> }) {
    try {
        const token = process.env.EASYVISTA_API_TOKEN;
        const baseUrl = process.env.BASE_URL;
        const { rfc_number } = await context.params;
        const comment = await req.text();


        if (!rfc_number) {
            return NextResponse.json({ error: "Missing RFC_NUMBER" }, { status: 400 });
        }

        const requestBody = {
            "end_action": {
                "description": "Closed by Stem API",
                "comment": `${comment}`,
                "doneby_name": "API, Stem"
            }
        };


        const response = await fetch(`${baseUrl}/actions/${rfc_number}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody)
        });


        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`EasyVista API Error: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        return NextResponse.json({ message: `Ticket ${rfc_number} fermé avec succès. Rechargez la page pour mettre l'affichage à jour.`, data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
