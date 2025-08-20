import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ rfc_number: string }> }) {
    const token = process.env.EASYVISTA_API_TOKEN;
    const baseUrl = process.env.BASE_URL;
    const rfc_number = await (await params).rfc_number;

    try {
        const response = await fetch(`${baseUrl}/requests/${rfc_number}/comment`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Erreur API EasyVista : ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
