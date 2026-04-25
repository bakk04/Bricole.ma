"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/api/context/AuthContext";
import { useToast } from "@/app/hooks/use-toast";

export function useFavorites() {
  const { state: authState } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    if (!authState.user) {
      setFavoriteIds([]);
      return;
    }

    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.success) {
        const ids = data.favorites
          .map((f: any) => f.productId?._id || f.productId)
          .filter(Boolean);
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  }, [authState.user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    if (!authState.user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des favoris.",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favoriteIds.includes(productId);
    
    // Optimistic update
    setFavoriteIds(prev => 
      isFavorite ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to toggle favorite");
      }

      if (data.action === "added") {
        toast({
          title: "Ajouté aux favoris",
          description: "L'élément a été ajouté à votre liste de favoris.",
        });
      }
    } catch (error) {
      // Revert optimistic update
      setFavoriteIds(prev => 
        isFavorite ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris.",
        variant: "destructive",
      });
    }
  };

  return {
    favoriteIds,
    isFavorite: (productId: string) => favoriteIds.includes(productId),
    toggleFavorite,
    refresh: fetchFavorites,
  };
}
