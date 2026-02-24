import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { postsApi } from "../../lib/api";
import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";
import {
  ArrowLeft, ThumbsUp, MessageSquare, Share2, Plus, Calculator, Send
} from "lucide-react";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

function PostCard({ post, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText("");
    setShowComments(false);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${post.author.avatarColor || "bg-slate-200"} rounded-full flex items-center justify-center font-bold text-slate-700`}>
          {post.author.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{post.author.name}</h4>
          <p className="text-[10px] text-slate-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">{post.text}</p>
      <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors active:scale-95 ${
            post.isLikedByMe ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          <ThumbsUp size={16} fill={post.isLikedByMe ? "currentColor" : "none"} />
          {post.likeCount}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-blue-600 ${
            showComments ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <MessageSquare size={16} /> {post.commentCount}
        </button>
        <button className="mr-auto text-slate-400 hover:text-slate-600 active:scale-95">
          <Share2 size={16} />
        </button>
      </div>
      {showComments && (
        <div className="mt-3 flex gap-2 animate-[fadeIn_0.2s_ease-out]">
          <input
            type="text"
            placeholder="כתוב תגובה..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-blue-300"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim()}
            className="p-1.5 bg-blue-600 text-white rounded-full disabled:opacity-50 active:scale-90"
          >
            <Send size={14} className="rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}

function NewPostModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-slate-800 mb-3">פוסט חדש</h3>
        <textarea
          className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-blue-400"
          rows={4}
          placeholder="שתף שאלה, טיפ או עדכון..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 mt-3">
          <button onClick={onClose} className="flex-1 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold text-sm">ביטול</button>
          <button
            onClick={() => { if (text.trim()) { onSubmit(text); onClose(); }}}
            disabled={!text.trim()}
            className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
          >
            פרסם
          </button>
        </div>
      </div>
    </div>
  );
}

export function FeedScreen({ onBack, onOpenProfile, onReport }) {
  const [showNewPost, setShowNewPost] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: postsApi.list,
  });

  const likeMutation = useMutation({
    mutationFn: (postId) => postsApi.like(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const prev = queryClient.getQueryData(["posts"]);
      queryClient.setQueryData(["posts"], (old) =>
        old?.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLikedByMe: !p.isLikedByMe,
                likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      );
      return { prev };
    },
    onError: (_, __, ctx) => queryClient.setQueryData(["posts"], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, text }) => postsApi.comment(postId, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const createPostMutation = useMutation({
    mutationFn: (text) => postsApi.create({ text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={(text) => createPostMutation.mutate(text)}
        />
      )}

      <div className="bg-white px-4 pb-4 pt-14 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100">
        <IconButton onClick={() => onBack("dashboard")} icon={ArrowLeft} className="transform rotate-180" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">הקהילה</h2>
          <p className="text-xs text-slate-500">מה חדש בשכבה?</p>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <ProfileHeaderButton onClick={onOpenProfile} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-slate-400 py-10 animate-pulse">טוען פוסטים...</div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={(id) => likeMutation.mutate(id)}
              onComment={(postId, text) => commentMutation.mutate({ postId, text })}
            />
          ))
        )}
      </div>

      <div className="absolute bottom-6 left-6">
        <button
          onClick={() => setShowNewPost(true)}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-300 hover:scale-105 transition-transform active:scale-95"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
}
