import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Bell, Bookmark, User, Home, PlayCircle, BookOpen, MessageSquare,
  ChevronRight, ChevronDown, X, Check, AlertCircle, Clock, Eye,
  Share2, Plus, ArrowLeft, Calendar,
  Menu, Globe, Microscope, Layers, Dna, Bone, Zap, BookMarked, Baby,
  Send, Heart, ExternalLink, RefreshCw, ShieldCheck, AlertTriangle,
  CheckCircle, XCircle, Telescope, Mountain,
  Lock, LogIn, LogOut, Eye as EyeIcon, EyeOff, UserPlus
} from "lucide-react";

// ─── Auth Types ───────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  isAdmin: boolean;
}

const ACCOUNTS: { username: string; password: string; user: AuthUser }[] = [
  {
    username: "admin",
    password: "admin1234",
    user: { id: "u_admin", username: "admin", displayName: "관리자", isAdmin: true },
  },
  {
    username: "user1",
    password: "user1234",
    user: { id: "u1", username: "user1", displayName: "일반사용자", isAdmin: false },
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Page = "home" | "videos" | "video-detail" | "books" | "book-detail" | "community" | "post-detail" | "write-post" | "search" | "admin" | "book-register";
type ToastType = "success" | "error" | "info";

interface Video {
  id: string;
  title: string;
  channel: string;
  views: number;
  date: string;
  duration: string;
  thumbnail: string;
  description: string;
  category: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  isbn: string;
  cover: string;
  description: string;
  category: string;
  registered: boolean;
  status?: "pending" | "reviewing" | "supplement" | "approved" | "rejected";
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  attachedVideo?: Video;
  attachedBook?: Book;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "astronomy", label: "우주·천문", icon: Telescope, color: "#2563EB" },
  { id: "geology", label: "지구·지질", icon: Mountain, color: "#0EA5E9" },
  { id: "genetics", label: "생명·유전", icon: Dna, color: "#10B981" },
  { id: "fossil", label: "화석·공룡", icon: Bone, color: "#F59E0B" },
  { id: "creation", label: "창조와 진화", icon: Zap, color: "#6366F1" },
  { id: "bible", label: "성경과 과학", icon: BookMarked, color: "#EC4899" },
  { id: "children", label: "어린이·청소년", icon: Baby, color: "#14B8A6" },
];

const MOCK_VIDEOS: Video[] = [
  {
    id: "v1",
    title: "빅뱅 이론의 문제점 — 천문학자가 말하는 창조의 증거",
    channel: "DDS 창조과학",
    views: 128400,
    date: "2024-03-15",
    duration: "42:17",
    thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=640&h=360&fit=crop&auto=format",
    description: "현대 천문학이 발견한 우주의 정밀함과 빅뱅 이론의 한계를 살펴봅니다. 우주의 미세 조정과 창조론적 해석을 천문학 데이터를 바탕으로 분석합니다.",
    category: "astronomy",
  },
  {
    id: "v2",
    title: "캄브리아기 폭발 — 다윈 진화론의 가장 큰 도전",
    channel: "과학과 창조",
    views: 95200,
    date: "2024-02-28",
    duration: "38:54",
    thumbnail: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=640&h=360&fit=crop&auto=format",
    description: "5억 4천만 년 전 지층에서 갑자기 출현한 다양한 생물 화석들은 점진적 진화론으로 설명하기 어렵습니다.",
    category: "fossil",
  },
  {
    id: "v3",
    title: "DNA 정보 코드 — 지적 설계의 증거",
    channel: "DDS 창조과학",
    views: 213000,
    date: "2024-01-10",
    duration: "55:22",
    thumbnail: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=640&h=360&fit=crop&auto=format",
    description: "DNA에 담긴 30억 쌍의 염기 서열은 정보 이론 관점에서 지적 설계의 명백한 증거입니다. 분자생물학자의 설명을 들어봅니다.",
    category: "genetics",
  },
  {
    id: "v4",
    title: "노아 홍수와 지질학 — 퇴적층이 말하는 이야기",
    channel: "창조지질연구소",
    views: 76800,
    date: "2024-03-02",
    duration: "1:12:40",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop&auto=format",
    description: "전 세계 지층과 화석 분포가 노아 홍수 모델로 더 잘 설명됩니다. 지질학자가 현장 데이터를 분석합니다.",
    category: "geology",
  },
  {
    id: "v5",
    title: "공룡과 인간이 공존했을까? — 역사 속 드래곤의 정체",
    channel: "DDS 창조과학",
    views: 189300,
    date: "2023-12-20",
    duration: "47:05",
    thumbnail: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=640&h=360&fit=crop&auto=format",
    description: "전 세계 문화에서 발견되는 공룡 닮은 생물의 기록들. 창조론적 관점에서 공룡의 역사를 재조명합니다.",
    category: "fossil",
  },
  {
    id: "v6",
    title: "어린이를 위한 창조과학 — 하나님이 만드신 우주",
    channel: "키즈 창조과학",
    views: 44200,
    date: "2024-03-10",
    duration: "22:18",
    thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=640&h=360&fit=crop&auto=format",
    description: "아이들도 쉽게 이해할 수 있는 창조과학 입문. 우주의 아름다움을 통해 창조주를 만납니다.",
    category: "children",
  },
];

const MOCK_BOOKS: Book[] = [
  {
    id: "b1",
    title: "다윈의 블랙박스",
    author: "마이클 비히",
    publisher: "복 있는 사람",
    publishDate: "2019-06-15",
    isbn: "9788963152004",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&auto=format",
    description: "세포의 복잡한 생화학 기계들은 진화론적으로 설명될 수 없음을 보여주는 지적 설계의 고전. 분자생물학의 관점에서 다윈 이론의 한계를 파헤칩니다.",
    category: "genetics",
    registered: true,
  },
  {
    id: "b2",
    title: "창조의 증거",
    author: "두에인 기쉬",
    publisher: "한국창조과학회",
    publishDate: "2018-03-20",
    isbn: "9788991907287",
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&auto=format",
    description: "화석 기록이 오히려 창조론을 지지한다는 주장을 체계적으로 제시합니다. 수백 개의 화석 사례를 분석한 과학적 연구서.",
    category: "fossil",
    registered: true,
  },
  {
    id: "b3",
    title: "우주의 미세 조정",
    author: "로버트 콜린스",
    publisher: "새물결플러스",
    publishDate: "2022-09-01",
    isbn: "9791161293332",
    cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&h=400&fit=crop&auto=format",
    description: "우주의 물리 상수들이 생명 존재에 최적화되어 있다는 증거를 수집하고, 이것이 의미하는 바를 물리학·철학·신학적으로 분석합니다.",
    category: "astronomy",
    registered: true,
  },
  {
    id: "b4",
    title: "기원의 과학",
    author: "필립 존슨",
    publisher: "IVP",
    publishDate: "2020-05-10",
    isbn: "9788932816364",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop&auto=format",
    description: "법학자의 시각으로 진화론의 증거를 비판적으로 검토합니다. 과학과 철학의 경계에서 기원론 논쟁을 명쾌하게 정리합니다.",
    category: "creation",
    registered: true,
  },
  {
    id: "b5",
    title: "성경과 과학의 대화",
    author: "김영길",
    publisher: "한국창조과학회",
    publishDate: "2021-02-28",
    isbn: "9788991907324",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop&auto=format",
    description: "과학과 성경이 충돌하는 것이 아니라 서로를 보완한다는 관점에서 주요 쟁점들을 다룹니다. 한국 창조과학의 대표 저서.",
    category: "bible",
    registered: true,
  },
  {
    id: "b6",
    title: "어린이 창조과학 백과",
    author: "DDS 편집부",
    publisher: "DDS 출판",
    publishDate: "2023-11-01",
    isbn: "9791165344528",
    cover: "https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=300&h=400&fit=crop&auto=format",
    description: "초등학생을 위한 창조과학 입문서. 풍부한 그림과 쉬운 설명으로 우주·지구·생명의 신비를 탐험합니다.",
    category: "children",
    registered: true,
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    title: "DNA가 우연히 생겨날 수 있을까요? 확률적으로 계산해 봤습니다",
    content: "최근 분자생물학 수업에서 DNA의 복잡성을 배우면서 의문이 생겼습니다. 가장 단순한 단백질 하나가 우연히 생겨날 확률은 10의 164승 분의 1이라고 합니다. 우주의 원자 수가 10의 80승 정도이니 이것은 사실상 불가능에 가깝다고 생각합니다.",
    author: "과학탐구자",
    date: "2024-03-20",
    views: 1842,
    likes: 234,
    comments: 47,
    category: "genetics",
    attachedVideo: MOCK_VIDEOS[2],
  },
  {
    id: "p2",
    title: "캄브리아기 화석에 대해 궁금한 점이 있습니다",
    content: "캄브리아기 폭발에 대해 공부하고 있는데, 5억 4천만 년 전에 갑자기 모든 동물 문(門)이 동시에 나타난다는 사실이 놀랍습니다. 이에 대해 진화론자들은 어떻게 반박하고, 창조론자들은 어떻게 설명하나요?",
    author: "지식탐험가",
    date: "2024-03-18",
    views: 924,
    likes: 89,
    comments: 23,
    category: "fossil",
    attachedBook: MOCK_BOOKS[1],
  },
  {
    id: "p3",
    title: "노아 홍수의 전 지구성을 지지하는 지질학적 증거들",
    content: "최근 창조지질학 세미나에 참석하면서 새로운 사실들을 많이 배웠습니다. 특히 전 세계적으로 동일한 지층 순서가 나타나고, 해양 화석이 산꼭대기에서 발견된다는 점이 인상적이었습니다.",
    author: "지층연구자",
    date: "2024-03-15",
    views: 2103,
    likes: 312,
    comments: 68,
    category: "geology",
    attachedVideo: MOCK_VIDEOS[3],
  },
  {
    id: "p4",
    title: "아이들에게 창조과학을 어떻게 가르치나요?",
    content: "초등학생 아이를 둔 부모입니다. 학교에서 진화론을 배우고 오는데, 집에서 창조과학적 관점도 균형 있게 알려주고 싶습니다. 어떤 자료나 방법이 효과적일까요?",
    author: "크리스천부모",
    date: "2024-03-12",
    views: 687,
    likes: 156,
    comments: 34,
    category: "children",
    attachedBook: MOCK_BOOKS[5],
  },
];

const MOCK_COMMENTS: Comment[] = [
  { id: "c1", author: "별빛연구자", content: "정말 좋은 질문입니다. 확률 계산에 대해 더 자세히 설명해 주신다면 좋겠네요. 아미노산의 키랄성 문제도 함께 고려하면 확률은 더욱 낮아집니다.", date: "2024-03-20", likes: 45 },
  { id: "c2", author: "생명과학도", content: "단순히 확률만으로는 설명이 부족하다고 봅니다. 자연선택의 메커니즘이 작용한다면 조금 다를 수 있지 않을까요? 물론 저도 창조론에 더 공감합니다만.", date: "2024-03-21", likes: 23 },
  { id: "c3", author: "창조과학교사", content: "프레드 호일 교수의 말이 생각나네요. '생명이 우연히 생겨날 확률은 마치 고물상에 회오리바람이 불어 보잉 747기가 완성될 확률과 같다.' 이 비유가 인상적이었습니다.", date: "2024-03-21", likes: 78 },
];

type AdminBook = Book & { applicant: string; reason: string; appliedDate: string };

const MOCK_ADMIN_BOOKS: AdminBook[] = [
  {
    id: "ab1",
    title: "진화론의 붕괴",
    author: "하룬 야햐",
    publisher: "글로벌콘텐츠",
    publishDate: "2020-07-15",
    isbn: "9788996785774",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop&auto=format",
    description: "진화론의 과학적 근거가 얼마나 취약한지를 방대한 자료를 통해 증명합니다.",
    category: "creation",
    registered: false,
    status: "pending",
    applicant: "진리탐구자",
    reason: "DDS 커뮤니티에 아직 등록되지 않은 중요한 창조과학 도서입니다.",
    appliedDate: "2024-03-19",
  },
  {
    id: "ab2",
    title: "화석이 말하는 창조",
    author: "두에인 기쉬",
    publisher: "한국창조과학회",
    publishDate: "2017-04-10",
    isbn: "9788991907263",
    cover: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=400&fit=crop&auto=format",
    description: "화석 기록을 창조론적 시각으로 해석한 연구서.",
    category: "fossil",
    registered: false,
    status: "reviewing",
    applicant: "화석학도",
    reason: "화석 분야의 중요 참고 도서로 커뮤니티에 공유하고 싶습니다.",
    appliedDate: "2024-03-17",
  },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatNum(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toString();
}

function formatDate(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "오늘";
  if (diff < 7) return `${diff}일 전`;
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`;
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: "검토 대기", color: "#64748B", bg: "#F1F5F9" },
    reviewing: { label: "검토 중",   color: "#D97706", bg: "#FEF3C7" },
    supplement:{ label: "보완 요청", color: "#7C3AED", bg: "#EDE9FE" },
    approved:  { label: "승인 완료", color: "#059669", bg: "#D1FAE5" },
    rejected:  { label: "반려",      color: "#DC2626", bg: "#FEE2E2" },
  };
  const s = map[status] || map["pending"];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 whitespace-nowrap" style={{ color: s.color, background: s.bg }}>
      {status === "approved" && <CheckCircle size={10} />}
      {status === "rejected" && <XCircle size={10} />}
      {status === "reviewing" && <Clock size={10} />}
      {status === "supplement" && <AlertTriangle size={10} />}
      {s.label}
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

function VideoCard({ video, onClick, onSave, saved }: { video: Video; onClick: () => void; onSave: () => void; saved: boolean }) {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border" onClick={onClick}>
      <div className="relative overflow-hidden bg-slate-100">
        <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">{video.duration}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2">{video.title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{video.channel}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye size={11} />{formatNum(video.views)}</span>
            <span>{formatDate(video.date)}</span>
          </div>
          <button aria-label="저장" onClick={e => { e.stopPropagation(); onSave(); }} className={`p-1.5 rounded-lg transition-colors ${saved ? "text-primary bg-secondary" : "text-muted-foreground hover:text-primary hover:bg-secondary"}`}>
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book, onClick, onSave, saved }: { book: Book; onClick: () => void; onSave: () => void; saved: boolean }) {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border flex flex-col" onClick={onClick}>
      <div className="p-5 flex gap-4">
        <div className="flex-shrink-0 w-16 h-24 bg-slate-100 rounded-lg overflow-hidden shadow-sm">
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-1">{book.title}</h3>
          <p className="text-xs text-muted-foreground mb-0.5">{book.author}</p>
          <p className="text-xs text-muted-foreground">{book.publisher}</p>
          <div className="mt-2">
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {CATEGORIES.find(c => c.id === book.category)?.label || book.category}
            </span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-4 flex justify-end">
        <button aria-label="저장" onClick={e => { e.stopPropagation(); onSave(); }} className={`p-1.5 rounded-lg transition-colors ${saved ? "text-primary bg-secondary" : "text-muted-foreground hover:text-primary hover:bg-secondary"}`}>
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const cat = CATEGORIES.find(c => c.id === post.category);
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border" onClick={onClick}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{post.author}</span>
            <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
          </div>
          {cat && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: cat.color, background: `${cat.color}18` }}>
              {cat.label}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">{post.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
      {(post.attachedVideo || post.attachedBook) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.attachedVideo && (
            <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground min-w-0">
              <PlayCircle size={12} className="text-primary flex-shrink-0" />
              <span className="line-clamp-1 max-w-[160px]">{post.attachedVideo.title}</span>
            </div>
          )}
          {post.attachedBook && (
            <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground min-w-0">
              <BookOpen size={12} className="text-primary flex-shrink-0" />
              <span className="line-clamp-1 max-w-[160px]">{post.attachedBook.title}</span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Eye size={11} />{formatNum(post.views)}</span>
        <span className="flex items-center gap-1"><Heart size={11} />{formatNum(post.likes)}</span>
        <span className="flex items-center gap-1"><MessageSquare size={11} />{formatNum(post.comments)}</span>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose, message]);
  const bg = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-primary";
  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 ${bg} text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-[calc(100vw-32px)]`} style={{ bottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}>
      {type === "success" && <CheckCircle size={16} className="flex-shrink-0" />}
      {type === "error" && <AlertCircle size={16} className="flex-shrink-0" />}
      {type === "info" && <AlertCircle size={16} className="flex-shrink-0" />}
      {message}
      <button aria-label="닫기" onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: React.ComponentType<{size?: number; className?: string}>; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-primary opacity-60" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">불러오기 실패</h3>
      <p className="text-sm text-muted-foreground mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
      <button onClick={onRetry} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
        <RefreshCw size={14} />다시 시도
      </button>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin, onShowToast }: {
  onLogin: (user: AuthUser) => void;
  onShowToast: (msg: string, type: ToastType) => void;
}) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [suName, setSuName] = useState("");
  const [suDisplay, setSuDisplay] = useState("");
  const [suPw, setSuPw] = useState("");
  const [suPw2, setSuPw2] = useState("");

  const handleLogin = () => {
    setError("");
    if (!username.trim() || !password) { setError("아이디와 비밀번호를 입력해 주세요."); return; }
    setLoading(true);
    setTimeout(() => {
      const match = ACCOUNTS.find(a => a.username === username && a.password === password);
      setLoading(false);
      if (match) {
        onShowToast(`${match.user.displayName}님, 환영합니다!`, "success");
        onLogin(match.user);
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    }, 600);
  };

  const handleSignup = () => {
    setError("");
    if (!suName.trim() || !suDisplay.trim() || !suPw) { setError("모든 항목을 입력해 주세요."); return; }
    if (suPw !== suPw2) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (ACCOUNTS.find(a => a.username === suName)) { setError("이미 사용 중인 아이디입니다."); return; }
    setLoading(true);
    setTimeout(() => {
      const newUser: AuthUser = { id: `u_${Date.now()}`, username: suName, displayName: suDisplay, isAdmin: false };
      ACCOUNTS.push({ username: suName, password: suPw, user: newUser });
      setLoading(false);
      onShowToast("회원가입이 완료되었습니다!", "success");
      onLogin(newUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 relative overflow-hidden" style={{ paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Layers size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">DDS</h1>
          <p className="text-sm text-muted-foreground mt-1">창조과학 지식 커뮤니티</p>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === "login" ? "text-primary border-b-2 border-primary bg-secondary/30" : "text-muted-foreground hover:text-foreground"}`}
            >
              로그인
            </button>
            <button
              onClick={() => { setTab("signup"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === "signup" ? "text-primary border-b-2 border-primary bg-secondary/30" : "text-muted-foreground hover:text-foreground"}`}
            >
              회원가입
            </button>
          </div>

          <div className="p-6 space-y-4">
            {tab === "login" ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="login-id" className="text-xs font-semibold text-muted-foreground block mb-1.5">아이디</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl px-4 h-11 focus-within:border-primary transition-colors">
                      <User size={14} className="text-muted-foreground flex-shrink-0" />
                      <input
                        id="login-id"
                        className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-slate-400"
                        placeholder="아이디를 입력하세요"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        autoComplete="username"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="login-pw" className="text-xs font-semibold text-muted-foreground block mb-1.5">비밀번호</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl px-4 h-11 focus-within:border-primary transition-colors">
                      <Lock size={14} className="text-muted-foreground flex-shrink-0" />
                      <input
                        id="login-pw"
                        type={showPw ? "text" : "password"}
                        className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-slate-400"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        autoComplete="current-password"
                      />
                      <button type="button" aria-label="비밀번호 표시" onClick={() => setShowPw(!showPw)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs">
                    <AlertCircle size={13} className="flex-shrink-0" />{error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><LogIn size={15} />로그인</>}
                </button>

                <div className="bg-slate-50 border border-border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">테스트 계정</p>
                  <div className="space-y-1">
                    <button type="button" onClick={() => { setUsername("admin"); setPassword("admin1234"); }} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <ShieldCheck size={11} className="text-primary" />
                      <span>관리자: <span className="font-mono text-foreground">admin</span> / <span className="font-mono text-foreground">admin1234</span></span>
                    </button>
                    <button type="button" onClick={() => { setUsername("user1"); setPassword("user1234"); }} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <User size={11} className="text-slate-400" />
                      <span>일반: <span className="font-mono text-foreground">user1</span> / <span className="font-mono text-foreground">user1234</span></span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  {[
                    { id: "su-id", label: "아이디", val: suName, set: setSuName, placeholder: "영문·숫자 조합", type: "text" },
                    { id: "su-name", label: "닉네임", val: suDisplay, set: setSuDisplay, placeholder: "표시될 이름", type: "text" },
                    { id: "su-pw", label: "비밀번호", val: suPw, set: setSuPw, placeholder: "8자 이상 권장", type: "password" },
                    { id: "su-pw2", label: "비밀번호 확인", val: suPw2, set: setSuPw2, placeholder: "비밀번호를 다시 입력", type: "password" },
                  ].map(({ id, label, val, set, placeholder, type }) => (
                    <div key={id}>
                      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground block mb-1.5">{label}</label>
                      <input
                        id={id}
                        type={type}
                        className="w-full bg-slate-50 border border-border rounded-xl px-4 h-11 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-slate-400"
                        placeholder={placeholder}
                        value={val}
                        onChange={e => set(e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs">
                    <AlertCircle size={13} className="flex-shrink-0" />{error}
                  </div>
                )}

                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><UserPlus size={15} />가입하기</>}
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          로그인하면 DDS <span className="text-primary underline cursor-pointer">이용약관</span> 및 <span className="text-primary underline cursor-pointer">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ currentPage, onNav, notifCount, user, onLogout, savedCount }: { currentPage: Page; onNav: (p: Page) => void; notifCount: number; user: AuthUser; onLogout: () => void; savedCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { page: "home" as Page, label: "홈", icon: Home },
    { page: "videos" as Page, label: "영상", icon: PlayCircle },
    { page: "books" as Page, label: "도서", icon: BookOpen },
    { page: "community" as Page, label: "커뮤니티", icon: MessageSquare },
  ];

  const isActive = (page: Page) => {
    if (currentPage === page) return true;
    if (page === "videos") return currentPage === "video-detail";
    if (page === "books") return currentPage === "book-detail" || currentPage === "book-register";
    if (page === "community") return currentPage === "post-detail" || currentPage === "write-post";
    return false;
  };

  return (
    <header className="fixed left-0 right-0 z-40 backdrop-blur-xl bg-white/80 border-b border-border" style={{ top: 0, paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4" style={{ paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
        <button onClick={() => onNav("home")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layers size={16} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base tracking-tight hidden sm:block">DDS</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ page, label }) => (
            <button key={page} onClick={() => onNav(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive(page) ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground hover:bg-slate-100"}`}>
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button aria-label="검색" onClick={() => onNav("search")} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors">
            <Search size={18} />
          </button>
          <button aria-label="알림" className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors">
            <Bell size={18} />
            {notifCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          <button aria-label="저장한 콘텐츠" className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors hidden sm:block">
            <Bookmark size={18} />
            {savedCount > 0 && <span className="absolute top-1 right-0.5 min-w-4 h-4 px-1 bg-primary text-white text-[10px] leading-4 rounded-full font-semibold">{savedCount}</span>}
          </button>
          {user.isAdmin && (
            <button aria-label="관리자" onClick={() => onNav("admin")} className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors" title="관리자">
              <ShieldCheck size={18} />
            </button>
          )}

          <div className="relative ml-1" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 pl-1 pr-2 h-8 rounded-full bg-secondary hover:bg-blue-100 transition-colors">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                {user.isAdmin ? <ShieldCheck size={12} className="text-white" /> : <User size={12} className="text-white" />}
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:block max-w-[72px] truncate">{user.displayName}</span>
              <ChevronDown size={12} className={`text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-10 w-52 bg-card border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      {user.isAdmin ? <ShieldCheck size={16} className="text-primary" /> : <User size={16} className="text-primary" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    </div>
                  </div>
                  {user.isAdmin && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                      <ShieldCheck size={10} />관리자
                    </div>
                  )}
                </div>
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-slate-50 transition-colors">
                    <User size={14} className="text-muted-foreground" />내 프로필
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-slate-50 transition-colors">
                    <Bookmark size={14} className="text-muted-foreground" />저장한 콘텐츠
                  </button>
                  {user.isAdmin && (
                    <button onClick={() => { onNav("admin"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-slate-50 transition-colors">
                      <ShieldCheck size={14} className="text-muted-foreground" />관리자 패널
                    </button>
                  )}
                  <div className="border-t border-border my-1" />
                  <button onClick={() => { setProfileOpen(false); onLogout(); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={14} />로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>

          <button aria-label="메뉴" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors ml-1">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white/95 py-3 flex flex-col gap-1" style={{ paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
          {navItems.map(({ page, label, icon: Icon }) => (
            <button key={page} onClick={() => { onNav(page); setMenuOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(page) ? "bg-secondary text-primary" : "text-foreground hover:bg-slate-100"}`}>
              <Icon size={16} />{label}
            </button>
          ))}
          {user.isAdmin && (
            <button onClick={() => { onNav("admin"); setMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-slate-100">
              <ShieldCheck size={16} className="text-primary" />관리자 패널
            </button>
          )}
          <div className="border-t border-border mt-1 pt-2">
            <button onClick={() => { setMenuOpen(false); onLogout(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full">
              <LogOut size={16} />로그아웃
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ onNav, savedVideos, onSaveVideo, savedBooks, onSaveBook }: {
  onNav: (p: Page, data?: unknown) => void;
  savedVideos: string[]; onSaveVideo: (id: string) => void;
  savedBooks: string[]; onSaveBook: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [contentTab, setContentTab] = useState<"videos" | "posts">("videos");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const filteredVideos = selectedCat ? MOCK_VIDEOS.filter(v => v.category === selectedCat) : MOCK_VIDEOS.slice(0, 4);
  const filteredPosts = selectedCat ? MOCK_POSTS.filter(p => p.category === selectedCat) : MOCK_POSTS.slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white p-6 sm:p-12 lg:p-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium mb-6">
            <Microscope size={14} />창조과학 지식 플랫폼
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4" style={{ textWrap: "balance" }}>
            창조과학을 발견하고,<br />배우고, 함께 나누세요
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-8 leading-relaxed">
            우주·지구·생명의 기원을 성경적 관점에서 탐구하는<br className="hidden sm:block" />커뮤니티에 오신 것을 환영합니다.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 min-w-0 flex items-center gap-3 bg-white rounded-2xl px-4 h-12 shadow-lg max-w-lg">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                id="hero-search"
                className="flex-1 min-w-0 bg-transparent text-foreground text-sm outline-none placeholder:text-slate-400"
                placeholder="영상, 도서, 게시글 통합 검색..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && query && onNav("search", query)}
              />
            </div>
            <button onClick={() => query && onNav("search", query)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 h-12 rounded-2xl text-sm font-semibold transition-colors flex-shrink-0">
              검색
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">주제별 탐색</h2>
          {selectedCat && <button onClick={() => setSelectedCat(null)} className="text-sm text-primary hover:underline">전체 보기</button>}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = selectedCat === cat.id;
            return (
              <button key={cat.id} onClick={() => setSelectedCat(active ? null : cat.id)}
                className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-2xl border transition-all duration-150 min-w-0 ${active ? "border-primary bg-secondary shadow-sm" : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50"}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}18` }}>
                  <Icon size={18} style={{ color: cat.color }} />
                </div>
                <span className={`text-xs font-medium leading-tight text-center break-keep ${active ? "text-primary" : "text-foreground"}`}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setContentTab("videos")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${contentTab === "videos" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>
              추천 영상
            </button>
            <button onClick={() => setContentTab("posts")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${contentTab === "posts" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>
              추천 글
            </button>
          </div>
          <button onClick={() => onNav(contentTab === "videos" ? "videos" : "community")} className="text-sm text-primary font-medium hover:underline flex items-center gap-1 flex-shrink-0">
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>

        {contentTab === "videos" ? (
          filteredVideos.length === 0 ? (
            <EmptyState icon={PlayCircle} title="등록된 영상이 없습니다" desc="선택한 주제의 영상이 아직 없습니다. 다른 주제를 선택해 보세요." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredVideos.map(v => (
                <VideoCard key={v.id} video={v} onClick={() => onNav("video-detail", v)} onSave={() => onSaveVideo(v.id)} saved={savedVideos.includes(v.id)} />
              ))}
            </div>
          )
        ) : (
          filteredPosts.length === 0 ? (
            <EmptyState icon={MessageSquare} title="게시글이 없습니다" desc="이 주제에 대한 첫 번째 글을 작성해 보세요." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPosts.map(p => (
                <PostCard key={p.id} post={p} onClick={() => onNav("post-detail", p)} />
              ))}
            </div>
          )
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">추천 도서</h2>
          <button onClick={() => onNav("books")} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">전체 보기 <ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_BOOKS.slice(0, 3).map(b => (
            <BookCard key={b.id} book={b} onClick={() => onNav("book-detail", b)} onSave={() => onSaveBook(b.id)} saved={savedBooks.includes(b.id)} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">질의응답 게시판</h2>
          <button onClick={() => onNav("community")} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">전체 보기 <ChevronRight size={14} /></button>
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {MOCK_POSTS.map((post, i) => {
            const cat = CATEGORIES.find(c => c.id === post.category);
            return (
              <div key={post.id} onClick={() => onNav("post-detail", post)}
                className={`flex items-start gap-4 px-4 sm:px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${i < MOCK_POSTS.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {cat && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: cat.color, background: `${cat.color}18` }}>{cat.label}</span>}
                    <span className="text-xs text-muted-foreground">{post.author}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0 tabular-nums">
                  <span className="flex items-center gap-1"><MessageSquare size={11} />{post.comments}</span>
                  <span className="flex items-center gap-1"><Heart size={11} />{post.likes}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center">
          <button onClick={() => onNav("write-post")} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
            <Plus size={15} />글 작성하기
          </button>
        </div>
      </section>
    </div>
  );
}

// ─── Category Chips (shared) ──────────────────────────────────────────────────

function CategoryChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
      <button onClick={() => onChange("all")} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${value === "all" ? "bg-primary text-white" : "bg-card border border-border text-foreground hover:bg-secondary"}`}>
        전체
      </button>
      {CATEGORIES.map(cat => (
        <button key={cat.id} onClick={() => onChange(cat.id)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${value === cat.id ? "bg-primary text-white" : "bg-card border border-border text-foreground hover:bg-secondary"}`}>
          {cat.label}
        </button>
      ))}
    </div>
  );
}

// ─── Videos Page ──────────────────────────────────────────────────────────────

function VideosPage({ onNav, savedVideos, onSaveVideo }: { onNav: (p: Page, d?: unknown) => void; savedVideos: string[]; onSaveVideo: (id: string) => void }) {
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [loading] = useState(false);

  const filtered = selectedCat === "all" ? MOCK_VIDEOS : MOCK_VIDEOS.filter(v => v.category === selectedCat);

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">영상</h1>
        <div className="text-sm text-muted-foreground">YouTube API 연동</div>
      </div>

      <CategoryChips value={selectedCat} onChange={setSelectedCat} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={PlayCircle} title="등록된 영상이 없습니다" desc="선택한 주제의 영상이 아직 없습니다. 다른 주제를 선택해 보세요." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(v => (
            <VideoCard key={v.id} video={v} onClick={() => onNav("video-detail", v)} onSave={() => onSaveVideo(v.id)} saved={savedVideos.includes(v.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Video Detail Page ────────────────────────────────────────────────────────

function VideoDetailPage({ video, onBack, onNav, savedVideos, onSaveVideo, onShowToast }: {
  video: Video; onBack: () => void; onNav: (p: Page, d?: unknown) => void;
  savedVideos: string[]; onSaveVideo: (id: string) => void;
  onShowToast: (m: string, t: ToastType) => void;
}) {
  const related = MOCK_VIDEOS.filter(v => v.id !== video.id && v.category === video.category).slice(0, 3);
  return (
    <div className="pb-16">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft size={16} />목록으로
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg max-w-full">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer">
                <PlayCircle size={32} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 text-xs bg-black/60 text-white px-2 py-1 rounded-lg flex items-center gap-1.5">
              <Globe size={10} />YouTube 공식 플레이어
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-snug">{video.title}</h1>
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{video.channel}</span>
                <span className="flex items-center gap-1"><Eye size={13} />{formatNum(video.views)}</span>
                <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(video.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onSaveVideo(video.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${savedVideos.includes(video.id) ? "bg-secondary text-primary border-primary/30" : "bg-card text-foreground border-border hover:bg-secondary"}`}>
                  <Bookmark size={14} fill={savedVideos.includes(video.id) ? "currentColor" : "none"} />저장
                </button>
                <button onClick={() => onShowToast("커뮤니티에 공유할 글쓰기 화면을 열었어요", "info")} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border border-border bg-card text-foreground hover:bg-secondary transition-colors">
                  <Share2 size={14} />커뮤니티 공유
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-3">영상 설명</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-medium">
                {CATEGORIES.find(c => c.id === video.category)?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          <h3 className="font-bold text-foreground">관련 영상</h3>
          {related.length === 0 ? (
            <p className="text-sm text-muted-foreground">관련 영상이 없습니다.</p>
          ) : related.map(v => (
            <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => onNav("video-detail", v)}>
              <div className="flex-shrink-0 w-32 aspect-video bg-slate-100 rounded-xl overflow-hidden">
                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-2 mb-1 leading-snug group-hover:text-primary transition-colors">{v.title}</p>
                <p className="text-xs text-muted-foreground">{v.channel}</p>
                <p className="text-xs text-muted-foreground">{v.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Books Page ───────────────────────────────────────────────────────────────

function BooksPage({ onNav, savedBooks, onSaveBook, onShowToast }: {
  onNav: (p: Page, d?: unknown) => void;
  savedBooks: string[]; onSaveBook: (id: string) => void;
  onShowToast: (msg: string, type: ToastType) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [searched, setSearched] = useState(false);

  const filtered = MOCK_BOOKS.filter(b =>
    (selectedCat === "all" || b.category === selectedCat) &&
    (!query || b.title.includes(query) || b.author.includes(query))
  );
  const notFound = searched && query && filtered.length === 0;

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">도서</h1>
        <div className="text-sm text-muted-foreground">공공 도서 API 연동</div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 min-w-0 flex items-center gap-3 bg-card border border-border rounded-xl px-4 h-11">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input id="book-search" className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="도서명, 저자 검색..." value={query}
            onChange={e => { setQuery(e.target.value); setSearched(false); }}
            onKeyDown={e => { if (e.key === "Enter") setSearched(true); }} />
          {query && <button aria-label="지우기" onClick={() => { setQuery(""); setSearched(false); }}><X size={14} className="text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setSearched(true)} className="bg-primary text-white px-5 h-11 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex-shrink-0">검색</button>
      </div>

      <CategoryChips value={selectedCat} onChange={setSelectedCat} />

      {notFound ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">찾으시는 도서가 아직 DDS에 등록되어 있지 않아요</h3>
          <p className="text-sm text-muted-foreground mb-6">새 도서를 신청하시면 검토 후 DDS에 등록됩니다.</p>
          <button onClick={() => onNav("book-register")} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
            <Plus size={15} />DDS에 도서 등록 신청
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="등록된 도서가 없습니다" desc="선택한 주제의 도서가 아직 없습니다. 다른 주제를 선택해 보세요." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <BookCard key={b.id} book={b} onClick={() => onNav("book-detail", b)} onSave={() => { onSaveBook(b.id); onShowToast(savedBooks.includes(b.id) ? "저장 취소됨" : "저장되었습니다", "success"); }} saved={savedBooks.includes(b.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Book Detail Page ─────────────────────────────────────────────────────────

function BookDetailPage({ book, onBack, savedBooks, onSaveBook }: {
  book: Book; onBack: () => void; savedBooks: string[]; onSaveBook: (id: string) => void;
}) {
  const cat = CATEGORIES.find(c => c.id === book.category);
  return (
    <div className="pb-16">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft size={16} />목록으로
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="flex flex-col items-center lg:items-start">
          <div className="w-48 h-64 bg-slate-100 rounded-2xl overflow-hidden shadow-xl mb-4">
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 w-full justify-center lg:justify-start">
            <button onClick={() => onSaveBook(book.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${savedBooks.includes(book.id) ? "bg-secondary text-primary border-primary/30" : "bg-card text-foreground border-border hover:bg-secondary"}`}>
              <Bookmark size={14} fill={savedBooks.includes(book.id) ? "currentColor" : "none"} />저장
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-secondary transition-colors">
              <Share2 size={14} />공유
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div>
            {cat && <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium mb-3" style={{ color: cat.color, background: `${cat.color}18` }}>{cat.label}</span>}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{book.title}</h1>
            <p className="text-base text-muted-foreground">{book.author} · {book.publisher}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[["출판일", book.publishDate], ["ISBN", book.isbn], ["카테고리", cat?.label || "-"]].map(([k, v]) => (
              <div key={k} className="bg-card border border-border rounded-xl p-3 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{k}</p>
                <p className="text-sm font-medium text-foreground tabular-nums break-all">{v}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-3">도서 소개</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Book Register Page ───────────────────────────────────────────────────────

function BookRegisterPage({ onBack, onShowToast }: { onBack: () => void; onShowToast: (m: string, t: ToastType) => void }) {
  const [step, setStep] = useState(1); // 1=search, 2=select, 3=done, 4=manual
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Book | null>(null);
  const [reason, setReason] = useState("");

  const apiResults = searched && query ? MOCK_BOOKS.filter(b => b.title.includes(query) || b.author.includes(query)).slice(0, 3) : [];
  const noApiResults = searched && query && apiResults.length === 0;

  const steps = ["도서 검색", "도서 선택", "정보 확인", "신청 완료"];
  const visualStep = step === 4 ? 2 : step === 3 ? 4 : step;

  return (
    <div className="pb-16 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft size={16} />도서 목록으로
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-2">도서 등록 신청</h1>
      <p className="text-sm text-muted-foreground mb-8">DDS에 없는 창조과학 도서를 등록 신청할 수 있습니다.</p>

      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i + 1 < visualStep || (visualStep === 4 && i === 3) ? "bg-emerald-500 text-white" : i + 1 === visualStep ? "bg-primary text-white" : "bg-slate-200 text-slate-400"}`}>
                {i + 1 < visualStep || (visualStep === 4 && i === 3) ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap ${i + 1 === visualStep ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i + 1 < visualStep ? "bg-emerald-500" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
            <h3 className="font-semibold text-foreground mb-4">공공 도서 API에서 검색</h3>
            <div className="flex gap-3 mb-6">
              <div className="flex-1 min-w-0 flex items-center gap-3 bg-slate-50 border border-border rounded-xl px-4 h-11">
                <Search size={15} className="text-muted-foreground flex-shrink-0" />
                <input id="register-search" className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="도서명 또는 저자명 입력..." value={query}
                  onChange={e => { setQuery(e.target.value); setSearched(false); }}
                  onKeyDown={e => { if (e.key === "Enter") setSearched(true); }} />
              </div>
              <button onClick={() => setSearched(true)} className="bg-primary text-white px-5 h-11 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex-shrink-0">검색</button>
            </div>

            {searched && apiResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{apiResults.length}개의 도서가 검색되었습니다.</p>
                {apiResults.map(b => (
                  <div key={b.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary/30 hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => { setSelected(b); setStep(2); }}>
                    <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.author} · {b.publisher}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{b.isbn}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}

            {noApiResults && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">API에서도 도서를 찾을 수 없습니다.</p>
                <button onClick={() => setStep(4)} className="text-sm text-primary font-medium hover:underline">직접 정보 입력하기</button>
              </div>
            )}

            {!searched && (
              <p className="text-xs text-muted-foreground">예: "다윈", "창조", "필립 존슨"</p>
            )}
          </div>
        </div>
      )}

      {step === 2 && selected && (
        <div className="space-y-6">
          <div className="bg-card border border-primary/30 rounded-2xl p-5 sm:p-6">
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                <img src={selected.cover} alt={selected.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground mb-1">{selected.title}</h3>
                <p className="text-sm text-muted-foreground">{selected.author} · {selected.publisher}</p>
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">ISBN: {selected.isbn}</p>
              </div>
            </div>
            <div>
              <label htmlFor="register-reason" className="text-sm font-medium text-foreground mb-2 block">신청 사유 <span className="text-red-500">*</span></label>
              <textarea id="register-reason" className="w-full bg-slate-50 border border-border rounded-xl p-3 text-sm text-foreground outline-none focus:border-primary resize-none"
                rows={4} placeholder="이 도서가 DDS에 필요한 이유를 간략히 설명해 주세요..."
                value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-slate-50 transition-colors">이전</button>
            <button onClick={() => { if (reason.trim()) { setStep(3); onShowToast("도서 등록 신청이 완료되었습니다", "success"); } }} disabled={!reason.trim()} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40">신청하기</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">신청이 완료되었습니다</h3>
            <p className="text-sm text-muted-foreground mb-1">도서 등록 신청이 접수되었습니다.</p>
            <p className="text-sm text-muted-foreground">관리자 검토 후 승인 시 알림을 드립니다.</p>
          </div>
          {selected && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">신청 도서</h4>
              <div className="flex gap-3">
                <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={selected.cover} alt={selected.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{selected.title}</p>
                  <p className="text-xs text-muted-foreground">{selected.author} · {selected.publisher}</p>
                </div>
              </div>
            </div>
          )}
          <button onClick={onBack} className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors">도서 목록으로 돌아가기</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
            <h3 className="font-semibold text-foreground mb-4">도서 정보 직접 입력</h3>
            <div className="space-y-4">
              {[["m-title", "도서명", "text", "도서명을 입력하세요"], ["m-author", "저자", "text", "저자를 입력하세요"], ["m-pub", "출판사", "text", "출판사를 입력하세요"], ["m-isbn", "ISBN", "text", "ISBN을 입력하세요"], ["m-url", "참고 URL", "url", "관련 URL을 입력하세요 (선택)"]].map(([id, label, type, placeholder]) => (
                <div key={id}>
                  <label htmlFor={id} className="text-xs font-medium text-muted-foreground block mb-1.5">{label} {label !== "참고 URL" && <span className="text-red-500">*</span>}</label>
                  <input id={id} type={type} placeholder={placeholder} className="w-full bg-slate-50 border border-border rounded-xl px-4 h-10 text-sm text-foreground outline-none focus:border-primary transition-colors" />
                </div>
              ))}
              <div>
                <label htmlFor="m-desc" className="text-xs font-medium text-muted-foreground block mb-1.5">도서 소개 <span className="text-red-500">*</span></label>
                <textarea id="m-desc" rows={3} className="w-full bg-slate-50 border border-border rounded-xl p-3 text-sm text-foreground outline-none focus:border-primary resize-none transition-colors" placeholder="도서 내용을 간략히 소개해 주세요..." />
              </div>
              <div>
                <label htmlFor="m-reason" className="text-xs font-medium text-muted-foreground block mb-1.5">신청 사유 <span className="text-red-500">*</span></label>
                <textarea id="m-reason" rows={3} className="w-full bg-slate-50 border border-border rounded-xl p-3 text-sm text-foreground outline-none focus:border-primary resize-none transition-colors" placeholder="이 도서가 DDS에 필요한 이유를 알려주세요..." />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-slate-50 transition-colors">이전</button>
            <button onClick={() => { setSelected(null); setStep(3); onShowToast("도서 등록 신청이 완료되었습니다", "success"); }} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors">신청하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Community Page ───────────────────────────────────────────────────────────

function CommunityPage({ onNav, posts }: { onNav: (p: Page, d?: unknown) => void; posts: Post[] }) {
  const [selectedCat, setSelectedCat] = useState("all");
  const filtered = selectedCat === "all" ? posts : posts.filter(p => p.category === selectedCat);

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">커뮤니티</h1>
        <button onClick={() => onNav("write-post")} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
          <Plus size={15} />글쓰기
        </button>
      </div>

      <CategoryChips value={selectedCat} onChange={setSelectedCat} />

      {filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title="게시글이 없습니다" desc="이 주제에 대한 첫 번째 글을 작성해 보세요." />
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <PostCard key={p.id} post={p} onClick={() => onNav("post-detail", p)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Post Detail Page ─────────────────────────────────────────────────────────

function PostDetailPage({ post, onBack, onNav, user }: { post: Post; onBack: () => void; onNav: (p: Page, d?: unknown) => void; user: AuthUser }) {
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const cat = CATEGORIES.find(c => c.id === post.category);

  return (
    <div className="pb-16 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft size={16} />목록으로
      </button>

      <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
        {cat && <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium mb-4" style={{ color: cat.color, background: `${cat.color}18` }}>{cat.label}</span>}
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 leading-snug">{post.title}</h1>

        <div className="flex items-center gap-3 pb-5 border-b border-border mb-5">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{post.author}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatDate(post.date)}</span>
              <span className="flex items-center gap-1"><Eye size={10} />{formatNum(post.views)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

        {(post.attachedVideo || post.attachedBook) && (
          <div className="space-y-3 mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">첨부 콘텐츠</p>
            {post.attachedVideo && (
              <div onClick={() => onNav("video-detail", post.attachedVideo)} className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors">
                <div className="w-20 aspect-video bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={post.attachedVideo.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <PlayCircle size={12} className="text-primary" />
                    <span className="text-xs text-primary font-medium">영상</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{post.attachedVideo.title}</p>
                  <p className="text-xs text-muted-foreground">{post.attachedVideo.channel}</p>
                </div>
                <ExternalLink size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            )}
            {post.attachedBook && (
              <div onClick={() => onNav("book-detail", post.attachedBook)} className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors">
                <div className="w-10 h-14 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={post.attachedBook.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={12} className="text-primary" />
                    <span className="text-xs text-primary font-medium">도서</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{post.attachedBook.title}</p>
                  <p className="text-xs text-muted-foreground">{post.attachedBook.author}</p>
                </div>
                <ExternalLink size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={() => setLiked(!liked)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${liked ? "bg-red-50 text-red-500 border-red-200" : "bg-card text-foreground border-border hover:bg-slate-50"}`}>
            <Heart size={14} fill={liked ? "currentColor" : "none"} />{post.likes + (liked ? 1 : 0)}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card text-foreground hover:bg-slate-50 transition-colors">
            <Share2 size={14} />공유
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-sm">
        <h3 className="font-bold text-foreground mb-6">댓글 {comments.length}</h3>

        <div className="space-y-5 mb-6">
          {comments.map((c, i) => (
            <div key={c.id} className={`flex gap-3 ${i < comments.length - 1 ? "pb-5 border-b border-border" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-foreground">{c.author}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(c.date)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                <button className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Heart size={11} />{c.likes}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0 flex items-end gap-2">
            <textarea id="comment-input" className="flex-1 min-w-0 bg-slate-50 border border-border rounded-xl p-3 text-sm text-foreground outline-none focus:border-primary resize-none transition-colors" rows={2} placeholder="댓글을 작성하세요..." value={comment} onChange={e => setComment(e.target.value)} />
            <button aria-label="댓글 등록" onClick={() => { if (comment.trim()) { setComments([...comments, { id: `c${Date.now()}`, author: user.displayName, content: comment, date: new Date().toISOString().split("T")[0], likes: 0 }]); setComment(""); } }} className="flex-shrink-0 w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-40" disabled={!comment.trim()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Write Post Page ──────────────────────────────────────────────────────────

function WritePostPage({ onBack, onSubmit, onNav }: { onBack: () => void; onSubmit: (p: Omit<Post, "id" | "author" | "date" | "views" | "likes" | "comments">) => void; onNav: (p: Page) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [attachedVideo, setAttachedVideo] = useState<Video | null>(null);
  const [attachedBook, setAttachedBook] = useState<Book | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  return (
    <div className="pb-16 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft size={16} />목록으로
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-8">글쓰기</h1>

      <div className="space-y-5">
        <div>
          <span className="text-sm font-medium text-foreground block mb-2">주제</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${selectedCat === cat.id ? "bg-primary text-white border-primary" : "bg-card border-border text-foreground hover:border-primary/30"}`}>{cat.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="post-title" className="text-sm font-medium text-foreground block mb-2">제목 <span className="text-red-500">*</span></label>
          <input id="post-title" className="w-full bg-card border border-border rounded-xl px-4 h-12 text-sm text-foreground outline-none focus:border-primary transition-colors" placeholder="제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <label htmlFor="post-content" className="text-sm font-medium text-foreground block mb-2">내용 <span className="text-red-500">*</span></label>
          <textarea id="post-content" className="w-full bg-card border border-border rounded-xl p-4 text-sm text-foreground outline-none focus:border-primary resize-none transition-colors" rows={10} placeholder="내용을 입력하세요..." value={content} onChange={e => setContent(e.target.value)} />
        </div>

        <div>
          <span className="text-sm font-medium text-foreground block mb-3">콘텐츠 첨부</span>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setShowVideoModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary hover:border-primary/30 transition-colors">
              <PlayCircle size={15} className="text-primary" />영상 첨부
            </button>
            <button onClick={() => setShowBookModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary hover:border-primary/30 transition-colors">
              <BookOpen size={15} className="text-primary" />도서 첨부
            </button>
          </div>
          {attachedVideo && (
            <div className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl p-3 mb-2">
              <PlayCircle size={14} className="text-primary flex-shrink-0" />
              <span className="text-sm text-foreground flex-1 min-w-0 line-clamp-1">{attachedVideo.title}</span>
              <button aria-label="첨부 삭제" onClick={() => setAttachedVideo(null)}><X size={14} className="text-muted-foreground" /></button>
            </div>
          )}
          {attachedBook && (
            <div className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl p-3">
              <BookOpen size={14} className="text-primary flex-shrink-0" />
              <span className="text-sm text-foreground flex-1 min-w-0 line-clamp-1">{attachedBook.title}</span>
              <button aria-label="첨부 삭제" onClick={() => setAttachedBook(null)}><X size={14} className="text-muted-foreground" /></button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-slate-50 transition-colors">취소</button>
          <button onClick={() => { if (title.trim() && content.trim()) { onSubmit({ title, content, category: selectedCat || "creation", attachedVideo: attachedVideo || undefined, attachedBook: attachedBook || undefined }); } }} disabled={!title.trim() || !content.trim()} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40">등록하기</button>
        </div>
      </div>

      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowVideoModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-foreground">영상 선택</h3>
              <button aria-label="닫기" onClick={() => setShowVideoModal(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {MOCK_VIDEOS.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-primary/30 hover:bg-secondary/30 transition-colors" onClick={() => { setAttachedVideo(v); setShowVideoModal(false); }}>
                  <div className="w-16 aspect-video bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{v.title}</p>
                    <p className="text-xs text-muted-foreground">{v.channel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowBookModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-foreground">도서 선택</h3>
              <button aria-label="닫기" onClick={() => setShowBookModal(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {MOCK_BOOKS.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-primary/30 hover:bg-secondary/30 transition-colors" onClick={() => { setAttachedBook(b); setShowBookModal(false); }}>
                  <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author} · {b.publisher}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 border border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors text-center" onClick={() => { setShowBookModal(false); onNav("book-register"); }}>
                <Plus size={16} className="text-primary mx-auto mb-1" />
                <p className="text-sm text-primary font-medium">DDS에 없는 도서 등록 신청</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Search Page ──────────────────────────────────────────────────────────────

function SearchPage({ initialQuery, onNav, savedVideos, onSaveVideo, savedBooks, onSaveBook, posts }: {
  initialQuery: string;
  onNav: (p: Page, d?: unknown) => void;
  savedVideos: string[]; onSaveVideo: (id: string) => void;
  savedBooks: string[]; onSaveBook: (id: string) => void;
  posts: Post[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [tab, setTab] = useState<"all" | "videos" | "books" | "posts">("all");
  const searched = submitted.trim().length > 0;
  const q = submitted.trim();

  const videos = searched ? MOCK_VIDEOS.filter(v => v.title.includes(q) || v.channel.includes(q)) : [];
  const books = searched ? MOCK_BOOKS.filter(b => b.title.includes(q) || b.author.includes(q)) : [];
  const postsFound = searched ? posts.filter(p => p.title.includes(q) || p.content.includes(q)) : [];

  return (
    <div className="pb-16">
      <h1 className="text-2xl font-bold text-foreground mb-6">통합검색</h1>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 min-w-0 flex items-center gap-3 bg-card border border-border rounded-xl px-4 h-12">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input id="global-search" autoFocus className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="검색어를 입력하세요..." value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") setSubmitted(query); }} />
          {query && <button aria-label="지우기" onClick={() => { setQuery(""); setSubmitted(""); }}><X size={14} className="text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setSubmitted(query)} className="bg-primary text-white px-6 h-12 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex-shrink-0">검색</button>
      </div>

      {!searched && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">추천 검색어</span>
          {["DNA", "화석", "노아 홍수", "빅뱅", "어린이"].map(k => (
            <button key={k} onClick={() => { setQuery(k); setSubmitted(k); }} className="px-3 py-1.5 rounded-full bg-card border border-border text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors">#{k}</button>
          ))}
        </div>
      )}

      {searched && (
        <>
          <div className="overflow-x-auto scrollbar-hide mb-6">
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
              {(["all", "videos", "books", "posts"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {t === "all" ? `전체 (${videos.length + books.length + postsFound.length})` : t === "videos" ? `영상 (${videos.length})` : t === "books" ? `도서 (${books.length})` : `게시글 (${postsFound.length})`}
                </button>
              ))}
            </div>
          </div>

          {videos.length + books.length + postsFound.length === 0 ? (
            <EmptyState icon={Search} title={`"${q}"에 대한 결과가 없습니다`} desc="다른 검색어를 사용해 보거나 주제별로 탐색해 보세요." />
          ) : (
            <div className="space-y-10">
              {(tab === "all" || tab === "videos") && videos.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4">영상 {videos.length}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map(v => <VideoCard key={v.id} video={v} onClick={() => onNav("video-detail", v)} onSave={() => onSaveVideo(v.id)} saved={savedVideos.includes(v.id)} />)}
                  </div>
                </div>
              )}
              {(tab === "all" || tab === "books") && books.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4">도서 {books.length}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.map(b => <BookCard key={b.id} book={b} onClick={() => onNav("book-detail", b)} onSave={() => onSaveBook(b.id)} saved={savedBooks.includes(b.id)} />)}
                  </div>
                </div>
              )}
              {(tab === "all" || tab === "posts") && postsFound.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4">게시글 {postsFound.length}</h2>
                  <div className="space-y-4">
                    {postsFound.map(p => <PostCard key={p.id} post={p} onClick={() => onNav("post-detail", p)} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

function AdminPage() {
  const [books, setBooks] = useState(MOCK_ADMIN_BOOKS);
  const [selected, setSelected] = useState<AdminBook | null>(MOCK_ADMIN_BOOKS[0]);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const updateStatus = (id: string, status: Book["status"]) => {
    setBooks(bs => bs.map(b => b.id === id ? { ...b, status } : b));
    setSelected(s => s && s.id === id ? { ...s, status } : s);
    const labels: Record<string, string> = { approved: "승인", rejected: "반려", reviewing: "검토 중", supplement: "보완 요청" };
    setToast({ msg: `${labels[status!]} 처리되었습니다`, type: status === "approved" ? "success" : status === "rejected" ? "error" : "info" });
  };

  const counts = {
    total: books.length,
    pending: books.filter(b => b.status === "pending" || b.status === "reviewing" || b.status === "supplement").length,
    approved: books.filter(b => b.status === "approved").length,
    rejected: books.filter(b => b.status === "rejected").length,
  };

  const done = selected?.status === "approved" || selected?.status === "rejected";

  return (
    <div className="pb-16">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={closeToast} />}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <ShieldCheck size={18} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">관리자 패널</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[["전체 신청", counts.total, "text-foreground"], ["처리 대기", counts.pending, "text-amber-600"], ["승인", counts.approved, "text-emerald-600"], ["반려", counts.rejected, "text-red-500"]].map(([label, n, color]) => (
          <div key={label as string} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{n}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground mb-4">도서 등록 신청 목록</h2>
          <div className="space-y-3">
            {books.map(b => (
              <div key={b.id} className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${selected?.id === b.id ? "border-primary shadow-sm" : "border-border hover:border-primary/30"}`} onClick={() => setSelected(b)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{b.title}</p>
                      <StatusBadge status={b.status || "pending"} />
                    </div>
                    <p className="text-xs text-muted-foreground">{b.author} · {b.publisher}</p>
                    <p className="text-xs text-muted-foreground mt-1">신청자: {b.applicant} · {formatDate(b.appliedDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          {selected ? (
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm lg:sticky lg:top-20">
              <div className="flex items-start gap-4 mb-5 pb-5 border-b border-border">
                <div className="w-16 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <img src={selected.cover} alt={selected.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-foreground">{selected.title}</h3>
                    <StatusBadge status={selected.status || "pending"} />
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.author} · {selected.publisher}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">ISBN: {selected.isbn} · 출판 {selected.publishDate}</p>
                  {(() => { const c = CATEGORIES.find(c => c.id === selected.category); return c ? <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: c.color, background: `${c.color}18` }}>{c.label}</span> : null; })()}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">도서 소개</p>
                  <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                </div>
                <div className="bg-slate-50 border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">신청 사유</p>
                    <p className="text-xs text-muted-foreground">{selected.applicant} · {formatDate(selected.appliedDate)}</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{selected.reason}</p>
                </div>
              </div>

              {done ? (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${selected.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {selected.status === "approved" ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  {selected.status === "approved" ? "승인되어 DDS 도서 목록에 등록되었습니다." : "반려 처리된 신청입니다."}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateStatus(selected.id, "reviewing")} disabled={selected.status === "reviewing"} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-amber-50 hover:border-amber-200 transition-colors disabled:opacity-40">
                    <Clock size={14} className="text-amber-500" />검토 시작
                  </button>
                  <button onClick={() => updateStatus(selected.id, "supplement")} disabled={selected.status === "supplement"} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-violet-50 hover:border-violet-200 transition-colors disabled:opacity-40">
                    <AlertTriangle size={14} className="text-violet-500" />보완 요청
                  </button>
                  <button onClick={() => updateStatus(selected.id, "rejected")} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                    <XCircle size={14} />반려
                  </button>
                  <button onClick={() => updateStatus(selected.id, "approved")} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
                    <CheckCircle size={14} />승인
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={ShieldCheck} title="신청을 선택하세요" desc="왼쪽 목록에서 신청을 선택하면 상세 정보와 처리 버튼이 나타납니다." />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

interface NavState { page: Page; data?: unknown }

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stack, setStack] = useState<NavState[]>([{ page: "home" }]);
  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const [savedBooks, setSavedBooks] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const current = stack[stack.length - 1];

  const showToast = useCallback((msg: string, type: ToastType) => setToast({ msg, type }), []);
  const closeToast = useCallback(() => setToast(null), []);

  const onNav = useCallback((page: Page, data?: unknown) => {
    setStack(s => {
      const topLevel: Page[] = ["home", "videos", "books", "community", "search", "admin"];
      if (topLevel.includes(page)) return [{ page, data }];
      return [...s, { page, data }];
    });
    window.scrollTo({ top: 0 });
  }, []);

  const onBack = useCallback(() => {
    setStack(s => (s.length > 1 ? s.slice(0, -1) : [{ page: "home" }]));
    window.scrollTo({ top: 0 });
  }, []);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
    setter(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]));
  const onSaveVideo = toggle(setSavedVideos);
  const onSaveBook = toggle(setSavedBooks);

  const handleLogout = () => {
    setUser(null);
    setStack([{ page: "home" }]);
    showToast("로그아웃되었습니다", "info");
  };

  const handleSubmitPost = (p: Omit<Post, "id" | "author" | "date" | "views" | "likes" | "comments">) => {
    const newPost: Post = { ...p, id: `p${Date.now()}`, author: user!.displayName, date: new Date().toISOString().split("T")[0], views: 0, likes: 0, comments: 0 };
    setPosts(ps => [newPost, ...ps]);
    showToast("게시글이 등록되었습니다", "success");
    onNav("community");
  };

  if (!user) {
    return (
      <>
        <LoginPage onLogin={setUser} onShowToast={showToast} />
        {toast && <Toast message={toast.msg} type={toast.type} onClose={closeToast} />}
      </>
    );
  }

  let content: React.ReactNode = null;
  switch (current.page) {
    case "home":
      content = <HomePage onNav={onNav} savedVideos={savedVideos} onSaveVideo={onSaveVideo} savedBooks={savedBooks} onSaveBook={onSaveBook} />;
      break;
    case "videos":
      content = <VideosPage onNav={onNav} savedVideos={savedVideos} onSaveVideo={onSaveVideo} />;
      break;
    case "video-detail":
      content = <VideoDetailPage key={(current.data as Video).id} video={current.data as Video} onBack={onBack} onNav={onNav} savedVideos={savedVideos} onSaveVideo={onSaveVideo} onShowToast={showToast} />;
      break;
    case "books":
      content = <BooksPage onNav={onNav} savedBooks={savedBooks} onSaveBook={onSaveBook} onShowToast={showToast} />;
      break;
    case "book-detail":
      content = <BookDetailPage book={current.data as Book} onBack={onBack} savedBooks={savedBooks} onSaveBook={onSaveBook} />;
      break;
    case "book-register":
      content = <BookRegisterPage onBack={onBack} onShowToast={showToast} />;
      break;
    case "community":
      content = <CommunityPage onNav={onNav} posts={posts} />;
      break;
    case "post-detail":
      content = <PostDetailPage key={(current.data as Post).id} post={current.data as Post} onBack={onBack} onNav={onNav} user={user} />;
      break;
    case "write-post":
      content = <WritePostPage onBack={onBack} onSubmit={handleSubmitPost} onNav={onNav} />;
      break;
    case "search":
      content = <SearchPage key={String(current.data ?? "")} initialQuery={(current.data as string) || ""} onNav={onNav} savedVideos={savedVideos} onSaveVideo={onSaveVideo} savedBooks={savedBooks} onSaveBook={onSaveBook} posts={posts} />;
      break;
    case "admin":
      content = user.isAdmin ? <AdminPage /> : <EmptyState icon={Lock} title="접근 권한이 없습니다" desc="관리자 계정으로 로그인해야 이용할 수 있습니다." />;
      break;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={current.page} onNav={p => onNav(p)} notifCount={2} user={user} onLogout={handleLogout} savedCount={savedVideos.length + savedBooks.length} />
      <main className="max-w-7xl mx-auto pb-8" style={{ paddingTop: "calc(56px + 24px + env(safe-area-inset-top, 0px))", paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
        {content}
      </main>
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">DDS</p>
              <p className="text-xs text-muted-foreground">창조과학 지식 커뮤니티</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>문의하기</span>
            <span>© 2026 DDS</span>
          </div>
        </div>
      </footer>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={closeToast} />}
    </div>
  );
}
