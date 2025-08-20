import { NextResponse } from "next/server";

export async function GET() {
    const token = process.env.EASYVISTA_API_TOKEN;
    const baseUrl = process.env.BASE_URL;

    try {
        const response = await fetch(`${baseUrl}/requests?sort=submit_date_ut+desc`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
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
