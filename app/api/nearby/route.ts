import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const maxDuration = 60; 

export async function GET(req: NextRequest) {
    try {
        const apifyToken = process.env.APIFY_TOKEN;
        // Utilisation forcée du token fourni
        const ipinfoToken = process.env.IPINFO_TOKEN || "3aff89f43437a5";

        if (!apifyToken) {
            return NextResponse.json({ success: false, error: "Clé API Apify manquante." }, { status: 500 });
        }

        // 1. Détection IP et Ville Intelligente
        let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
        if (ip.includes(",")) ip = ip.split(",")[0].trim();

        let city = "Casablanca";
        try {
            // Si l'IP est local (localhost) on laisse ipinfo détecter l'IP externe automatiquement
            const ipUrl = ip && ip !== "::1" && ip !== "127.0.0.1" 
                ? `https://ipinfo.io/${ip}?token=${ipinfoToken}` 
                : `https://ipinfo.io/json?token=${ipinfoToken}`;
                
            const ipinfoRes = await fetch(ipUrl, {
                next: { revalidate: 3600 } 
            });
            if (ipinfoRes.ok) {
                const ipinfoData = await ipinfoRes.json();
                city = ipinfoData.city || city;
            }
        } catch (e) {
            console.error("IPInfo error:", e);
        }

        // --- CACHING ULTRA-INTELLIGENT POUR LA VITESSE (REDIS) ---
        const cacheKey = `nearby_artisans_${city.toLowerCase().replace(/\s+/g, '_')}`;
        
        const fetchFromApify = async () => {
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
                    signal: AbortSignal.timeout(55000) 
                }
            );

            if (!apifyRes.ok) {
                const errorText = await apifyRes.text();
                throw new Error(`Apify status: ${apifyRes.status} - ${errorText}`);
            }

            const apifyData = await apifyRes.json();

            return apifyData
                .filter((item: any) => item.title && item.title !== "Google")
                .map((item: any) => {
                    // Récupération plus agressive de l'image (pour éviter null)
                    let img = item.imageUrls?.[0] || item.image || item.thumbnail || null;
                    return {
                        id: item.placeId || Math.random().toString(36).substring(7),
                        name: item.title,
                        category: item.categoryName || "Artisan",
                        address: item.address,
                        rating: item.totalScore || 0,
                        reviewsCount: item.reviewsCount || 0,
                        phone: item.phoneUnformatted || item.phone,
                        website: item.website,
                        imageUrl: img,
                    };
                });
        };

        // Cache Redis de 24h (86400s) : Vitesse instantanée dès le 2ème appel !
        const artisans = await cache.getOrSet(cacheKey, fetchFromApify, 86400);

        return NextResponse.json({ success: true, city, artisans });

    } catch (error: any) {
        console.error("Nearby Search Error:", error);
        return NextResponse.json(
            { success: false, error: error.name === 'TimeoutError' ? "Le service Google Maps met trop de temps à répondre. Réessayez." : error.message },
            { status: 500 }
        );
    }
}
