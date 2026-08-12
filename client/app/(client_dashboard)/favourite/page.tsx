"use client";

import React, { useEffect } from "react";
import { Star, Folder, Download } from "lucide-react";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useDocumentStore } from "@/store/documentStore";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";
import { SkeletonCardGrid } from "@/components/ui/SkeletonPresets";

const FavouriteCard = ({ 
  favorite, 
  onRemove, 
  onDownload,
  t
}: { 
  favorite: any;
  onRemove: () => void;
  onDownload: () => void;
  t: any;
}) => {
  return (
    <div className="bg-lemon w-full p-5 rounded-xl text-background shadow-md relative">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg max-w-[80%] leading-tight text-background">{favorite.document.title}</h3>
        <button onClick={onRemove} className="hover:scale-110 transition-transform">
          <Star className="w-5 h-5 text-background" fill="currentColor" />
        </button>
      </div>

      <div className="flex items-center gap-6 text-sm mt-4 opacity-90">
        <p>{interpolate(t.dashboard.favorites.type)}: {favorite.document.document_type}</p>
        <p>{interpolate(t.dashboard.favorites.size)}: {favorite.document.file_size}</p>
      </div>

      <p className="text-sm mt-2 opacity-90">
        {favorite.document.description}
      </p>

      <div className="w-full h-[1px] bg-background opacity-40 mt-4" />

      <div className="flex justify-between items-center mt-3">
        <button className="hover:scale-110 transition-transform p-1">
          <Folder className="w-5 h-5 text-background" />
        </button>
        <button onClick={onDownload} className="hover:scale-110 transition-transform p-1">
          <Download className="w-5 h-5 text-background" />
        </button>
      </div>
    </div>
  );
};

export default function FavouritesPage() {
  const { t } = useLanguage();
  const { favorites, isLoading, fetchFavorites, removeFavorite } = useFavoriteStore();
  const { downloadDocument } = useDocumentStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (favoriteId: number) => {
    await removeFavorite(favoriteId);
  };

  const handleDownload = async (documentId: string | number) => {
    await downloadDocument(documentId.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full bg-card p-8 md:p-10 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-10 text-left text-lemon">{interpolate(t.dashboard.favorites.title)}</h2>
          <SkeletonCardGrid count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full bg-card p-8 md:p-10 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-10 text-left text-lemon">{interpolate(t.dashboard.favorites.title)}</h2>

        {favorites.length === 0 ? (
          <div className="text-center text-foreground/70 py-8">
            {interpolate(t.dashboard.favorites.noFavorites)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <FavouriteCard 
                key={favorite.id} 
                favorite={favorite}
                onRemove={() => handleRemoveFavorite(favorite.id)}
                onDownload={() => handleDownload(favorite.document.id)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
