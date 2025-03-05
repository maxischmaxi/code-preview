import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
    if (
        req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new NextResponse(null, { status: 401 });
    }

    const res = await fetch(
        `https://${process.env.NEXT_PUBLIC_API_GATEWAY}/reset`,
        {
            cache: "no-cache",
            method: "POST",
            next: {
                revalidate: 1,
            },
            headers: {
                Authorization: `Bearer ${process.env.CRON_SECRET}`,
            },
        },
    );

    if (!res.ok || res.status !== 200) {
        return new NextResponse(null, { status: res.status });
    }

    return new NextResponse(null, { status: 200 });
}
