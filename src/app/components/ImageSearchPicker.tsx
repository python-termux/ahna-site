'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Image as ImageIcon, RefreshCw, Check } from 'lucide-react';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface ImageSearchPickerProps {
  onSelectImage: (imageUrl: string, imageData: PexelsPhoto) => void;
  selectedImageUrl?: string;
  className?: string;
  resultsPerPage?: number;
}

export default function ImageSearchPicker({ 
  onSelectImage, 
  selectedImageUrl,
  className = '',
  resultsPerPage = 12
}: ImageSearchPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const searchImages = useCallback(async (query: string, pageNum: number = 1, isRefresh: boolean = false) => {
    if (!query.trim()) {
      setImages([]);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      const response = await fetch(
        `/api/search-images?query=${encodeURIComponent(query)}&page=${pageNum}&perPage=${resultsPerPage}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const newImages = data.photos || [];
      setImages(newImages);
      setTotalResults(data.total_results || 0);
      setCurrentPage(pageNum);
      
      if (!isRefresh) {
        setLastSearchQuery(query);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images');
      setImages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resultsPerPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchImages(searchQuery, 1, false);
  };

  const handleRefresh = () => {
    if (lastSearchQuery) {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      searchImages(lastSearchQuery, randomPage, true);
    }
  };

  const handleSelectImage = (image: PexelsPhoto) => {
    setSelectedId(image.id);
    onSelectImage(image.src.large, image);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setImages([]);
    setSelectedId(null);
    setError('');
    setCurrentPage(1);
    setTotalResults(0);
    setLastSearchQuery('');
  };

  const startResult = ((currentPage - 1) * resultsPerPage) + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className={`w-full ${className}`}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for images... (e.g., nature, office, technology)"
            className="w-full px-4 py-3 pl-11 pr-10 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] dark:focus:ring-[#2997ff] focus:border-transparent transition-all"
          />
          <Search size={20} className="absolute left-3 top-3.5 text-muted-foreground" />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-3.5"
            >
              <X size={20} className="text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
        </div>
        <div className="flex gap-3 mt-3">
          <button
            type="submit"
            disabled={loading || refreshing}
            className="px-6 py-2 bg-[#0066cc] dark:bg-[#2997ff] text-white rounded-lg hover:bg-[#2997ff] dark:hover:bg-[#0066cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          
          {lastSearchQuery && images.length > 0 && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="px-6 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>
          )}
        </div>
      </form>

      {/* Results Stats */}
      {totalResults > 0 && (
        <div className="mb-4 flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Showing {startResult}-{endResult} of {totalResults.toLocaleString()} results
          </span>
          <span className="text-xs text-muted-foreground">
            {resultsPerPage} per page
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && images.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-[#0066cc] dark:text-[#2997ff]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Images Grid */}
      <AnimatePresence mode="wait">
        {images.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            {/* Refreshing Overlay */}
            {refreshing && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
                  <Loader2 size={20} className="animate-spin text-[#0066cc] dark:text-[#2997ff]" />
                  <span className="text-sm text-foreground">Loading fresh images...</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.slice(0, resultsPerPage).map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedId === image.id
                      ? 'border-[#0066cc] dark:border-[#2997ff] shadow-lg'
                      : 'border-border hover:border-[#0066cc]/50 dark:hover:border-[#2997ff]/50'
                  }`}
                  onClick={() => handleSelectImage(image)}
                >
                  <div className="aspect-square bg-accent/20">
                    <img
                      src={image.src.medium}
                      alt={image.alt || image.photographer}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Overlay with photographer info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs truncate">
                        📸 {image.photographer}
                      </p>
                    </div>
                  </div>
                  
                  {/* Selection checkmark */}
                  {selectedId === image.id && (
                    <div className="absolute top-2 right-2 bg-[#0066cc] dark:bg-[#2997ff] rounded-full p-1 shadow-lg">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Rate limit info */}
            {images.length === resultsPerPage && totalResults > resultsPerPage && (
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Showing {resultsPerPage} of {totalResults.toLocaleString()} results
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="mt-2 text-xs text-[#0066cc] dark:text-[#2997ff] hover:underline flex items-center gap-1 mx-auto"
                >
                  <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                  Click Refresh for different {resultsPerPage} images
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {!loading && !refreshing && searchQuery && images.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ImageIcon size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-foreground mb-2">No images found for "{searchQuery}"</p>
          <p className="text-sm text-muted-foreground">Try different keywords</p>
        </motion.div>
      )}

      {/* Initial State */}
      {!loading && !refreshing && !searchQuery && images.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ImageIcon size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-foreground mb-2">Search for images to get started</p>
          <p className="text-sm text-muted-foreground">Try: nature, business, technology, people</p>
          <p className="text-xs text-muted-foreground mt-4">
            ℹ️ Each search shows maximum {resultsPerPage} images. Click Refresh to see new ones!
          </p>
        </motion.div>
      )}
    </div>
  );
}