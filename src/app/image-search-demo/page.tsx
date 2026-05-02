"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, Check } from "lucide-react";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import ImageSearchPicker from "@/app/components/ImageSearchPicker";

interface SelectedImageData {
  url: string;
  photographer: string;
  id: number;
  alt: string;
  photographer_url: string;
}

export default function ImageSearchDemoPage() {
  const [selectedImage, setSelectedImage] = useState<SelectedImageData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectImage = (imageUrl: string, imageData: any) => {
    setSelectedImage({
      url: imageUrl,
      photographer: imageData.photographer,
      id: imageData.id,
      alt: imageData.alt || imageData.photographer,
      photographer_url: imageData.photographer_url
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column - Image Picker */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">Search Images</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Search and select free stock photos from Pexels
              </p>
              <ImageSearchPicker onSelectImage={handleSelectImage} />
            </div>
          </div>

          {/* Right Column - Selected Image Preview */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
              <h3 className="text-md font-semibold mb-4">Selected Image</h3>
              
              {selectedImage ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Image Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-accent/20 border border-border">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.alt}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  
                  {/* Image Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Photographer
                      </label>
                      <a
                        href={selectedImage.photographer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0066cc] dark:text-[#2997ff] hover:underline flex items-center gap-1 mt-1"
                      >
                        {selectedImage.photographer}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Image ID
                      </label>
                      <p className="text-sm mt-1 font-mono">{selectedImage.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                        Image URL
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedImage.url}
                          readOnly
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg cursor-pointer pr-10"
                          onClick={(e) => {
                            (e.target as HTMLInputElement).select();
                            copyToClipboard(selectedImage.url);
                          }}
                        />
                        <button
                          onClick={() => copyToClipboard(selectedImage.url)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
                        >
                          {copied ? (
                            <Check size={16} className="text-green-600 dark:text-green-500" />
                          ) : (
                            <Copy size={16} className="text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to copy URL
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => copyToClipboard(selectedImage.url)}
                      className="flex-1 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-accent/50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy URL
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        alert(`Selected image URL: ${selectedImage.url}\n\nYou can now use this URL in your app!`);
                      }}
                      className="flex-1 px-4 py-2 bg-[#0066cc] dark:bg-[#2997ff] text-white rounded-lg hover:bg-[#2997ff] dark:hover:bg-[#0066cc] transition-colors text-sm font-medium"
                    >
                      Use Image
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={32} className="text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-foreground mb-2">No image selected</p>
                  <p className="text-sm text-muted-foreground">
                    Search and click on an image to select it
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attribution Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Images provided by{' '}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066cc] dark:text-[#2997ff] hover:underline"
            >
              Pexels
            </a>
            . All photos are free to use under the Pexels license.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Import ImageIcon if needed
import { Image as ImageIcon } from "lucide-react";