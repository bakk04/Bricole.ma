"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function FavoriteButton({ productId, className, style }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite(productId);
    setTimeout(() => setIsAnimating(false), 450);
  };

  return (
    <button
      onClick={handleClick}
      className={`favorite-btn ${active ? "active" : ""} ${isAnimating ? "animating" : ""} ${className || ""}`}
      style={style}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        size={18}
        fill={active ? "#ef4444" : "none"}
        color={active ? "#ef4444" : "currentColor"}
        strokeWidth={2}
        className="heart-icon"
      />
      <style jsx>{`
        .favorite-btn {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 0;
          color: #64748b;
        }

        .favorite-btn:hover {
          transform: scale(1.1);
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          color: #ef4444;
        }

        .favorite-btn.active {
          background: white;
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.1);
        }

        .favorite-btn.animating .heart-icon {
          animation: heart-pop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  );
}
