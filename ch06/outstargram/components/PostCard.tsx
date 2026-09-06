"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile,
  CheckCircle2,
} from "lucide-react";
import { Post } from "@/lib/data";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const toggleLike = () => {
    if (isLiked) {
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
  };

  return (
    <article className="w-full bg-white dark:bg-black border-b md:border md:rounded-xl border-neutral-200 dark:border-neutral-800 mb-4 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {/* Profile Ring */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white dark:bg-black p-[1.5px] relative">
              <Image
                src={post.userAvatar}
                alt={post.username}
                fill
                sizes="36px"
                className="rounded-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col text-sm leading-tight">
            <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
              <Link href="#" className="hover:opacity-70 transition-opacity">
                {post.username}
              </Link>
              {post.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
              )}
              <span className="text-neutral-400 text-xs font-normal">• {post.timeAgo}</span>
            </div>
            {post.location && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                {post.location}
              </span>
            )}
          </div>
        </div>

        <button className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
          <MoreHorizontal className="w-5 h-5 stroke-[2px]" />
        </button>
      </div>

      {/* Post Media Image */}
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <Image
          src={post.imageUrl}
          alt={`Post by ${post.username}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          priority
          className="object-cover transition-transform duration-300 hover:scale-[1.01]"
        />
      </div>

      {/* Post Action Buttons */}
      <div className="p-3 pb-1">
        <div className="flex items-center justify-between mb-2 text-black dark:text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className="p-0.5 hover:scale-110 active:scale-90 transition-transform"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked
                    ? "fill-red-500 text-red-500 stroke-[1.5px]"
                    : "stroke-[1.75px] hover:text-neutral-500"
                }`}
              />
            </button>
            <button className="p-0.5 hover:scale-110 active:scale-90 transition-transform">
              <MessageCircle className="w-6 h-6 stroke-[1.75px] hover:text-neutral-500" />
            </button>
            <button className="p-0.5 hover:scale-110 active:scale-90 transition-transform">
              <Send className="w-6 h-6 stroke-[1.75px] hover:text-neutral-500" />
            </button>
          </div>

          <button
            onClick={toggleSave}
            className="p-0.5 hover:scale-110 active:scale-90 transition-transform"
          >
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                isSaved
                  ? "fill-black dark:fill-white text-black dark:text-white stroke-[1.5px]"
                  : "stroke-[1.75px] hover:text-neutral-500"
              }`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <div className="text-sm font-semibold text-black dark:text-white mb-2">
          {post.likedByUsername ? (
            <span>
              <span className="font-normal text-neutral-600 dark:text-neutral-400">
                <strong className="font-semibold text-black dark:text-white">
                  {post.likedByUsername}
                </strong>
                님 외{" "}
              </span>
              <strong className="font-semibold">{likesCount.toLocaleString()}명</strong>이 좋아합니다
            </span>
          ) : (
            <span>좋아요 {likesCount.toLocaleString()}개</span>
          )}
        </div>

        {/* Caption */}
        <div className="text-sm text-black dark:text-white mb-2 leading-relaxed">
          <Link href="#" className="font-semibold mr-2 hover:opacity-70">
            {post.username}
          </Link>
          <span>{post.caption}</span>
        </div>

        {/* Comments Section */}
        {post.commentsCount > 0 && (
          <button className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 hover:text-neutral-700 dark:hover:text-neutral-300">
            댓글 {post.commentsCount}개 모두 보기
          </button>
        )}

        {/* Top Comments Preview */}
        {post.topComments.map((comment) => (
          <div key={comment.id} className="text-sm text-black dark:text-white flex items-center justify-between py-0.5">
            <div>
              <Link href="#" className="font-semibold mr-2 hover:opacity-70">
                {comment.username}
              </Link>
              <span>{comment.text}</span>
            </div>
            <button className="text-neutral-400 hover:text-red-500">
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Static Comment Input Form */}
      <div className="hidden md:flex items-center justify-between px-3 py-2 border-t border-neutral-100 dark:border-neutral-900 mt-2">
        <div className="flex items-center gap-3 flex-1">
          <Smile className="w-6 h-6 text-neutral-400 stroke-[1.75px] cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-200" />
          <input
            type="text"
            placeholder="댓글 달기..."
            className="bg-transparent text-sm w-full outline-none text-black dark:text-white placeholder-neutral-400"
          />
        </div>
        <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 disabled:opacity-50">
          게시
        </button>
      </div>
    </article>
  );
}
