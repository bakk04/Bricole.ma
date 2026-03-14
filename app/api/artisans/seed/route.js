import { ApifyClient } from "apify-client";
import { connectDB } from "@/lib/mongodb";
import ArtisanProfile from "@/models/ArtisanProfile";
import Category from "@/models/Category";
import User from "@/models/User";
import { cache } from "@/lib/redis";

const APIFY_TOKEN = process.env.APIFY_TOKEN;

export async function POST(req) {
  try {
    const { metier, ville, maxResults } = await req.json();

    if (!metier || !ville) {
      return new Response(JSON.stringify({ success: false, message: "metier et ville obligatoires" }), {
        status: 400,
      });
    }

    await connectDB();

    // 1. Trouver ou créer la catégorie correspondante
    let category = await Category.findOne({ nom: { $regex: new RegExp(metier, "i") } });
    if (!category) {
      category = await Category.create({ 
        nom: metier, 
        description: `Artisans spécialisés en ${metier}` 
      });
    }

    const client = new ApifyClient({ token: APIFY_TOKEN });

    // 2. Appel à l'acteur Apify Google Maps Scraper
    const run = await client.actor("compass/google-maps-scraper").call({
      searchStringsArray: [`${metier} à ${ville}, Maroc`],
      maxCrawledPlaces: maxResults || 5,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    let count = 0;
    for (const item of items) {
      // Pour chaque artisan trouvé, on crée un utilisateur fantôme (si nécessaire) et son profil
      // Note: On utilise le téléphone ou l'email fictif pour l'unicité
      const fakeEmail = `${item.placeId}@bricole.ma`;
      
      let user = await User.findOne({ email: fakeEmail });
      if (!user) {
        user = await User.create({
          email: fakeEmail,
          password: "scraped_account", // Account créé par scraping
          role: "ARTISAN",
          status: "ACTIVE",
        });
      }

      // Mise à jour ou création du profil artisan professionnel
      await ArtisanProfile.findOneAndUpdate(
        { userId: user._id },
        {
          nomComplet: item.title,
          nomEntreprise: item.title,
          telephone: item.phone || "Non spécifié",
          ville: ville,
          adresse: item.address,
          metierId: category._id,
          description: item.categoryName || metier,
          photoProfil: item.imageUrls?.[0] || "", // Utilise l'URL de Google Maps
          noteMoyenne: item.totalScore || 0,
          estVerifie: !!item.isVerified,
        },
        { upsert: true, new: true }
      );
      count++;
    }

    // 3. Invalider le cache Redis pour les recherches
    await cache.del(`artisans:${ville}:${metier}`);

    return new Response(JSON.stringify({ success: true, count, category: category.nom }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Erreur Seed Apify:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
