import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Memo } from "@/lib/store";

interface MemoCardProps {
  memo: Memo;
  featured?: boolean;
}

export function MemoCard({ memo, featured = false }: MemoCardProps) {
  const formattedDate = formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true });

  return (
    <Link
      href={`/edit/${memo.id}`}
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-lg note-card-shadow note-card-hover transition-all cursor-pointer flex flex-col ${
        featured ? "sm:col-span-2 h-full" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-md">
        {memo.tags && memo.tags.length > 0 ? (
          <span className="px-sm py-xs bg-primary/10 text-primary rounded-full text-label-sm">
            {memo.tags[0]}
          </span>
        ) : (
          <span className="text-label-sm text-outline">{formattedDate}</span>
        )}
        {memo.tags && memo.tags.length > 0 && (
          <span className="text-label-sm text-outline">{formattedDate}</span>
        )}
      </div>

      <h3 className="text-headline-md mb-sm text-on-surface line-clamp-1">{memo.title || "Untitled"}</h3>
      
      <p className={`text-body-md text-on-surface-variant flex-1 ${featured ? "line-clamp-4" : "line-clamp-3"}`}>
        {memo.content || "No content"}
      </p>

      {featured && (
        <div className="mt-md flex items-center gap-sm pt-md border-t border-outline-variant">
          <span className="material-symbols-outlined text-[18px] text-outline">attach_file</span>
          <span className="material-symbols-outlined text-[18px] text-outline">share</span>
        </div>
      )}
    </Link>
  );
}
