import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; 

export async function GET(req: NextRequest) {
    try {
        const apifyToken = process.env.APIFY_TOKEN;
        const ipinfoToken = process.env.IPINFO_TOKEN;

        if (!apifyToken) {
            return NextResponse.json({ success: false, error: "Clé API Apify manquante." }, { status: 500 });
        }

        // 1. Détection IP et Ville
        let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "196.200.176.1";
        if (ip.includes(",")) ip = ip.split(",")[0].trim();

        let city = "Casablanca";
        if (ipinfoToken) {
            try {
                const ipinfoRes = await fetch(`https://ipinfo.io/${ip}?token=${ipinfoToken}`, {
                    next: { revalidate: 3600 } // Cache d'une heure pour l'IP
                });
                if (ipinfoRes.ok) {
                    const ipinfoData = await ipinfoRes.json();
                    city = ipinfoData.city || city;
                }
            } catch (e) {
                console.error("IPInfo error:", e);
            }
        }

        // 2. Appel Apify avec gestion de timeout et headers propres
        const apifyPayload = {
            searchStringsArray: [`artisan professionnel à ${city}, Maroc`],
            maxCrawledPlacesPerSearch: 4, 
            language: "fr",
            maxImages: 1,
            zoom: 13,
        };

        const apifyRes = await fetch(
            `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${apifyToken}`,
            {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(apifyPayload),
                // On laisse un signal pour éviter que fetch ne reste bloqué indéfiniment
                signal: AbortSignal.timeout(55000) 
            }
        );

        if (!apifyRes.ok) {
            const errorText = await apifyRes.text();
            throw new Error(`Apify status: ${apifyRes.status} - ${errorText}`);
        }

        const apifyData = await apifyRes.json();

        const artisans = apifyData
            .filter((item: any) => item.title && item.title !== "Google")
            .map((item: any) => ({
                id: item.placeId || Math.random().toString(36).substring(7),
                name: item.title,
                category: item.categoryName || "Artisan",
                address: item.address,
                rating: item.totalScore || 0,
                reviewsCount: item.reviewsCount || 0,
                phone: item.phoneUnformatted || item.phone,
                website: item.website,
                imageUrl: item.imageUrls?.[0] || null,
            }));

        return NextResponse.json({ success: true, city, artisans });

    } catch (error: any) {
        console.error("Nearby Search Error:", error);
        return NextResponse.json(
            { success: false, error: error.name === 'TimeoutError' ? "Le service Google Maps met trop de temps à répondre. Réessayez." : error.message },
            { status: 500 }
        );
    }
}
