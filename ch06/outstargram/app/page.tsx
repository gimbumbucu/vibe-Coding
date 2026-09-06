import Stories from "@/components/Stories";
import PostCard from "@/components/PostCard";
import Suggestions from "@/components/Suggestions";
import { mockPosts } from "@/lib/data";

export default function Home() {
  return (
    <main className="flex justify-center gap-8 pt-6 px-0 md:px-4 w-full max-w-screen-lg mx-auto">
      {/* Center Feed */}
      <div className="flex flex-col w-full max-w-[470px] flex-shrink-0">
        <Stories />
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Right Sidebar - Desktop only */}
      <Suggestions />
    </main>
  );
}
