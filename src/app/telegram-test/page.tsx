"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import { motion } from "framer-motion";
import { Loader2, XCircle } from "lucide-react";

declare global {
  interface Window {
    TelegramLoginWidget: {
      onAuth: (user: TelegramUser) => void;
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface ChannelData {
  id: string;
  title: string;
  username: string;
  description: string;
  photoUrl: string;
  memberCount: number;
  posts: {
    id: string;
    text: string;
    date: string;
    views: number;
    imageUrl?: string;
  }[];
}

function TelegramTestPageComponent() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    setUser(telegramUser);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/telegram/fetch-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramUser }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch channel data");
      }

      setChannelData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-widget.js?22"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.TelegramLoginWidget) {
            window.TelegramLoginWidget.onAuth = handleTelegramAuth;
          }
        }}
      />

      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Telegram Channel Data</h1>
            <p className="text-muted-foreground">
              Login with Telegram to fetch your channel information and latest posts
            </p>
          </div>

          {!user ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                id="telegram-login-widget"
                className="telegram-login-button"
                data-telegram-login="syrflow_bot"
                data-size="large"
                data-auth-url={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/telegram/auth`}
                data-request-access="write"
              />
              <p className="text-sm text-muted-foreground mt-4">
                Click the button above to login with Telegram
              </p>
            </div>
          ) : (
            <div>
              <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.first_name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#0066cc] flex items-center justify-center text-white font-bold text-lg">
                      {user.first_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {user.first_name} {user.last_name || ""}
                    </p>
                    {user.username && (
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                </div>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
                  <p className="text-muted-foreground mt-3">Fetching your channel data...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {channelData && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h2 className="text-xl font-bold">Channel Information</h2>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {channelData.photoUrl && (
                          <img
                            src={channelData.photoUrl}
                            alt={channelData.title}
                            className="w-14 h-14 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-bold text-lg">{channelData.title}</p>
                          <p className="text-sm text-muted-foreground">
                            @{channelData.username}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="bg-accent/50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold">{channelData.memberCount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Subscribers</p>
                        </div>
                      </div>
                      {channelData.description && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">{channelData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h2 className="text-xl font-bold">Latest Posts (Max 20)</h2>
                      <p className="text-sm text-muted-foreground">
                        Showing {channelData.posts.length} most recent posts
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {channelData.posts.map((post, idx) => (
                        <div key={post.id} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.date).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              👁️ {post.views.toLocaleString()} views
                            </p>
                          </div>
                          {post.text && (
                            <p className="text-sm whitespace-pre-wrap">{post.text}</p>
                          )}
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt={`Post ${idx + 1}`}
                              className="rounded-lg max-h-96 object-contain bg-accent/30"
                            />
                          )}
                        </div>
                      ))}
                      {channelData.posts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          <p>No posts found in this channel</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .telegram-login-button {
          display: inline-flex;
        }
      `}</style>
    </>
  );
}

export default dynamic(() => Promise.resolve(TelegramTestPageComponent), {
  ssr: false,
});
