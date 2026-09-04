import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, UploadCloud, Wand2, Type, Crop, Scissors, MessageSquare, Smartphone,
  Layers, Palette, LayoutDashboard, Film, Clapperboard, LayoutTemplate,
  Paintbrush, BarChart3, Settings, ChevronRight, ChevronLeft, ChevronDown,
  Check, Circle, Download, Pencil, X, Menu, ArrowRight, Star, Clock,
  TrendingUp, LogOut, User, Plus, Search, Sparkles, Mail, Lock, FileVideo,
  Zap, Trash2, Copy, Bell, GripVertical, Eye, EyeOff, ArrowUpRight, Folder,
} from "lucide-react";

/* ----------------------------- design tokens ----------------------------- */
const C = {
  bg: "#0B0B0D",
  bgRaised: "#0F0F12",
  surface: "#151518",
  surfaceHover: "#1B1B1F",
  border: "#26262B",
  borderLight: "#323238",
  text: "#F3F3F1",
  textMuted: "#98989F",
  textFaint: "#616168",
  accent: "#D9A441",
  accentDark: "#B8862F",
  accentSoft: "rgba(217,164,65,0.14)",
  accentText: "#EFC978",
  success: "#6FCF97",
  successSoft: "rgba(111,207,151,0.13)",
  danger: "#E0796D",
  dangerSoft: "rgba(224,121,109,0.13)",
};
const displayFont = { fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" };
const bodyFont = { fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif" };

const FontImports = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    ::selection { background: ${C.accentSoft}; color: ${C.text}; }
    input::placeholder, textarea::placeholder { color: ${C.textFaint}; }
    @keyframes clippio-spin { to { transform: rotate(360deg); } }
    @keyframes clippio-pulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
    @keyframes clippio-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .clippio-rise { animation: clippio-rise .5s ease both; }
    .clippio-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
    .clippio-scroll::-webkit-scrollbar-thumb { background: ${C.borderLight}; border-radius: 8px; }
    .clippio-scroll::-webkit-scrollbar-track { background: transparent; }
    button { font-family: inherit; }
  `}</style>
);

/* ----------------------------- shared bits ----------------------------- */
const Logo = ({ size = 22 }) => (
  <div className="flex items-center gap-2 select-none">
    <div
      style={{ width: size, height: size, background: C.accent, borderRadius: 7 }}
      className="flex items-center justify-center flex-shrink-0"
    >
      <Play size={size * 0.55} color="#0B0B0D" fill="#0B0B0D" strokeWidth={0} />
    </div>
    <span style={{ ...displayFont, color: C.text, fontSize: size * 0.82, fontWeight: 600, letterSpacing: "-0.01em" }}>
      Clippio
    </span>
  </div>
);

const Button = ({ children, variant = "primary", size = "md", className = "", icon: Icon, ...props }) => {
  const sizes = { sm: "px-3.5 py-1.5 text-[13px]", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-[15px]" };
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: { background: C.accent, color: "#141210" },
    secondary: { background: C.surface, color: C.text, border: `1px solid ${C.borderLight}` },
    ghost: { background: "transparent", color: C.textMuted },
    danger: { background: C.dangerSoft, color: C.danger },
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${className}`}
      style={variants[variant]}
      onMouseEnter={(e) => {
        if (variant === "primary") e.currentTarget.style.background = C.accentDark;
        if (variant === "secondary") e.currentTarget.style.background = C.surfaceHover;
        if (variant === "ghost") e.currentTarget.style.color = C.text;
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") e.currentTarget.style.background = C.accent;
        if (variant === "secondary") e.currentTarget.style.background = C.surface;
        if (variant === "ghost") e.currentTarget.style.color = C.textMuted;
      }}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "", style = {}, hover = false, ...props }) => (
  <div
    className={`rounded-2xl transition-colors duration-150 ${className}`}
    style={{ background: C.surface, border: `1px solid ${C.border}`, ...style }}
    onMouseEnter={hover ? (e) => (e.currentTarget.style.borderColor = C.borderLight) : undefined}
    onMouseLeave={hover ? (e) => (e.currentTarget.style.borderColor = C.border) : undefined}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: { background: C.surfaceHover, color: C.textMuted },
    accent: { background: C.accentSoft, color: C.accentText },
    success: { background: C.successSoft, color: C.success },
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
      style={tones[tone]}
    >
      {children}
    </span>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className="relative rounded-full transition-colors flex-shrink-0"
    style={{ width: 38, height: 22, background: checked ? C.accent : C.borderLight }}
  >
    <span
      className="absolute top-0.5 rounded-full bg-white transition-transform"
      style={{ width: 18, height: 18, transform: `translateX(${checked ? 18 : 2}px)` }}
    />
  </button>
);

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return [toasts, push];
}

const ToastStack = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end">
    {toasts.map((t) => (
      <div
        key={t.id}
        className="clippio-rise flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shadow-2xl"
        style={{ background: C.bgRaised, border: `1px solid ${C.borderLight}`, color: C.text, ...bodyFont }}
      >
        {t.tone === "success" ? <Check size={15} color={C.success} /> : <Zap size={15} color={C.accent} />}
        {t.message}
      </div>
    ))}
  </div>
);

/* ----------------------------- mock data ----------------------------- */
const NICHES = ["Business", "Fitness", "Comedy", "Education", "Interview", "Tech"];
const CLIP_TITLES = [
  "The ONE mistake everyone makes…",
  "This completely changed my workflow.",
  "You won't believe what happened next.",
  "Nobody tells you this before you start.",
  "I tried it for 30 days. Here's what happened.",
  "This is why your first attempt always fails.",
  "The part everyone skips (don't).",
  "Wait for the ending.",
  "This took me 3 years to figure out.",
  "Stop doing this immediately.",
];

function makeClips(seedName) {
  return CLIP_TITLES.map((title, i) => {
    const dur = 22 + Math.floor(Math.random() * 45);
    return {
      id: `${seedName}-${i}`,
      title,
      duration: `0:${String(dur).padStart(2, "0")}`,
      score: 71 + Math.floor(Math.random() * 27),
      hue: [C.accent, "#7C9CBF", "#8FBF8A", "#C98FBF", "#BF9A6E"][i % 5],
    };
  });
}

const INITIAL_PROJECTS = [
  { id: "p1", name: "Podcast Ep. 42 — Growth Loops", clips: 10, date: "2 days ago", status: "Ready", niche: "Business" },
  { id: "p2", name: "Morning Mobility Routine", clips: 8, date: "5 days ago", status: "Ready", niche: "Fitness" },
  { id: "p3", name: "Standup Set — Live at The Loft", clips: 12, date: "1 week ago", status: "Ready", niche: "Comedy" },
];

/* ----------------------------- Landing: Nav ----------------------------- */
const LandingNav = ({ go, mobileOpen, setMobileOpen }) => {
  const links = ["Features", "How It Works", "Pricing"];
  return (
    <div className="sticky top-0 z-50" style={{ background: "rgba(11,11,13,0.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => go("landing")}><Logo /></button>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="text-sm transition-colors" style={{ color: C.textMuted, ...bodyFont }}
               onMouseEnter={(e) => (e.currentTarget.style.color = C.text)} onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
              {l}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => go("auth-in")} className="text-sm px-3 py-2" style={{ color: C.textMuted, ...bodyFont }}>Sign In</button>
          <Button size="sm" onClick={() => go("auth-up")}>Get Started</Button>
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu size={22} color={C.text} />
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden px-6 pb-5 flex flex-col gap-4 clippio-rise">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`} style={{ color: C.textMuted, ...bodyFont }} onClick={() => setMobileOpen(false)}>{l}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => go("auth-in")}>Sign In</Button>
            <Button size="sm" onClick={() => go("auth-up")}>Get Started</Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------------- Landing: Hero + interactive demo ----------------------------- */
const HeroDemo = ({ push }) => {
  const [phase, setPhase] = useState("idle"); // idle | uploading | done
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const startUpload = (name) => {
    setFileName(name);
    setPhase("uploading");
    setProgress(0);
  };

  useEffect(() => {
    if (phase !== "uploading") return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setPhase("done");
          return 100;
        }
        return p + 4 + Math.random() * 8;
      });
    }, 140);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <Card className="p-5 sm:p-6 w-full" style={{ background: C.bgRaised }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium" style={{ color: C.textFaint, ...bodyFont }}>NEW PROJECT</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: C.borderLight }} />
          <div className="w-2 h-2 rounded-full" style={{ background: C.borderLight }} />
          <div className="w-2 h-2 rounded-full" style={{ background: C.accent }} />
        </div>
      </div>

      {phase === "idle" && (
        <div
          className="rounded-xl flex flex-col items-center justify-center text-center py-12 px-6 cursor-pointer transition-colors"
          style={{ border: `1.5px dashed ${C.borderLight}` }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }}
          onDragLeave={(e) => (e.currentTarget.style.borderColor = C.borderLight)}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; startUpload(f ? f.name : "podcast-episode-42.mp4"); }}
        >
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && startUpload(e.target.files[0].name)} />
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: C.accentSoft }}>
            <UploadCloud size={22} color={C.accentText} />
          </div>
          <p className="text-[15px] font-medium mb-1" style={{ color: C.text, ...bodyFont }}>Drop your video here</p>
          <p className="text-sm mb-4" style={{ color: C.textFaint }}>or</p>
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); startUpload("podcast-episode-42.mp4"); }}>Browse Files</Button>
          <p className="text-xs mt-5" style={{ color: C.textFaint }}>Supported formats: MP4, MOV, AVI, WebM · Max 2GB</p>
        </div>
      )}

      {phase === "uploading" && (
        <div className="py-10 px-6">
          <div className="flex items-center gap-3 mb-5">
            <FileVideo size={18} color={C.accentText} />
            <span className="text-sm truncate" style={{ color: C.text, ...bodyFont }}>{fileName}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: C.border }}>
            <div className="h-full rounded-full transition-all duration-150" style={{ width: `${Math.min(progress, 100)}%`, background: C.accent }} />
          </div>
          <p className="text-xs" style={{ color: C.textFaint }}>Uploading… {Math.min(Math.round(progress), 100)}%</p>
        </div>
      )}

      {phase === "done" && (
        <div className="py-8 px-6 text-center clippio-rise">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: C.successSoft }}>
            <Check size={22} color={C.success} />
          </div>
          <p className="text-[15px] font-medium mb-1" style={{ color: C.text, ...bodyFont }}>Upload complete</p>
          <p className="text-sm mb-5" style={{ color: C.textFaint }}>{fileName}</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="secondary" onClick={() => { setPhase("idle"); setProgress(0); }}>Upload another</Button>
            <Button size="sm" onClick={() => push("This is a demo — sign up to process a real video.", "accent")}>Analyze Video</Button>
          </div>
        </div>
      )}
    </Card>
  );
};

const Hero = ({ go, push }) => (
  <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-14 items-center">
    <div>
      <Badge tone="accent"><Sparkles size={11} /> AI-powered clipping</Badge>
      <h1 className="mt-5 leading-[1.05]" style={{ ...displayFont, color: C.text, fontSize: "clamp(2.4rem, 5vw, 3.4rem)", fontWeight: 600, letterSpacing: "-0.02em" }}>
        Turn long videos into shorts, automatically.
      </h1>
      <p className="mt-5 text-lg leading-relaxed max-w-md" style={{ color: C.textMuted, ...bodyFont }}>
        Clippio uses AI to find your best moments, cut them into engaging short-form videos, add captions, and get them ready for TikTok, Reels, and YouTube Shorts.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={() => go("auth-up")} icon={ArrowRight}>Start Creating Free</Button>
        <a href="#how-it-works">
          <Button size="lg" variant="secondary">See How It Works</Button>
        </a>
      </div>
      <p className="mt-4 text-sm" style={{ color: C.textFaint }}>No credit card required.</p>
      <div className="mt-10 flex items-center gap-6">
        <div>
          <div style={{ ...displayFont, color: C.text, fontSize: 22, fontWeight: 600 }}>1 → 10</div>
          <div className="text-xs" style={{ color: C.textFaint }}>clips per upload</div>
        </div>
        <div className="w-px h-8" style={{ background: C.border }} />
        <div>
          <div style={{ ...displayFont, color: C.text, fontSize: 22, fontWeight: 600 }}>&lt; 5 min</div>
          <div className="text-xs" style={{ color: C.textFaint }}>average turnaround</div>
        </div>
      </div>
    </div>
    <HeroDemo push={push} />
  </section>
);

/* ----------------------------- Landing: How it works ----------------------------- */
const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Upload", body: "Upload your long-form video — a podcast, interview, webinar, or talk.", icon: UploadCloud },
    { n: "02", title: "AI finds the best moments", body: "Clippio analyzes the transcript and identifies the most interesting, engaging sections.", icon: Wand2 },
    { n: "03", title: "Publish your shorts", body: "Get multiple ready-to-use short videos with captions and optimized formatting.", icon: Layers },
  ];
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24" style={{ borderTop: `1px solid ${C.border}` }}>
      <h2 style={{ ...displayFont, color: C.text, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 600, letterSpacing: "-0.01em" }}>How it works</h2>
      <div className="mt-12 grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <div key={s.n} className="relative">
            {i < 2 && <div className="hidden md:block absolute top-5 left-[calc(100%-1rem)] w-8 h-px" style={{ background: C.border }} />}
            <div className="flex items-center gap-3 mb-4">
              <span style={{ ...displayFont, color: C.textFaint, fontSize: 13 }}>{s.n}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <s.icon size={16} color={C.accentText} />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: C.text, ...displayFont }}>{s.title}</h3>
            <p className="text-[15px] leading-relaxed" style={{ color: C.textMuted, ...bodyFont }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ----------------------------- Landing: Features ----------------------------- */
const FEATURES = [
  { icon: Wand2, title: "AI Clip Detection", body: "Automatically identify the strongest moments in your videos." },
  { icon: Type, title: "Automatic Captions", body: "Generate accurate captions and subtitles in your brand's style." },
  { icon: Crop, title: "Smart Cropping", body: "Convert horizontal video into vertical 9:16 while keeping the subject in frame." },
  { icon: Scissors, title: "Remove Dead Space", body: "Detect pauses and unnecessary sections and trim them out." },
  { icon: MessageSquare, title: "AI Hooks", body: "Generate engaging titles and hooks for every clip." },
  { icon: Smartphone, title: "Multiple Formats", body: "Built for TikTok, YouTube Shorts, and Instagram Reels." },
  { icon: Layers, title: "Batch Clips", body: "Turn one long video into multiple short clips at once." },
  { icon: Palette, title: "Brand Presets", body: "Save your caption style, font, logo, colors, and position." },
];
const Features = () => (
  <section id="features" className="max-w-6xl mx-auto px-6 py-24" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-lg">
      <h2 style={{ ...displayFont, color: C.text, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 600, letterSpacing: "-0.01em" }}>Everything you need to go from long to short</h2>
      <p className="mt-3 text-[15px]" style={{ color: C.textMuted, ...bodyFont }}>One upload, a full editing pipeline — clip detection, captions, cropping, and branding, handled automatically.</p>
    </div>
    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {FEATURES.map((f) => (
        <Card key={f.title} hover className="p-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: C.accentSoft }}>
            <f.icon size={16} color={C.accentText} />
          </div>
          <h3 className="text-[15px] font-medium mb-1.5" style={{ color: C.text, ...bodyFont }}>{f.title}</h3>
          <p className="text-[13px] leading-relaxed" style={{ color: C.textMuted, ...bodyFont }}>{f.body}</p>
        </Card>
      ))}
    </div>
  </section>
);

/* ----------------------------- Landing: Pricing ----------------------------- */
const PLANS = [
  { name: "Free", price: "$0", period: "/month", features: ["3 videos/month", "Basic captions", "Watermark", "Standard processing"], cta: "Start Free" },
  { name: "Creator", price: "$9.99", period: "/month", popular: true, features: ["30 videos/month", "No watermark", "AI captions", "AI clip detection", "Smart cropping", "AI hooks"], cta: "Start Creating" },
  { name: "Pro", price: "$19.99", period: "/month", features: ["100 videos/month", "Everything in Creator", "Batch processing", "Brand Kit", "Priority processing", "Advanced analytics"], cta: "Go Pro" },
];
const Pricing = ({ go }) => (
  <section id="pricing" className="max-w-6xl mx-auto px-6 py-24" style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="text-center max-w-lg mx-auto">
      <h2 style={{ ...displayFont, color: C.text, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 600, letterSpacing: "-0.01em" }}>Simple, usage-based pricing</h2>
      <p className="mt-3 text-[15px]" style={{ color: C.textMuted, ...bodyFont }}>Start free. Upgrade when you're ready to scale your output.</p>
    </div>
    <div className="mt-12 grid md:grid-cols-3 gap-5 items-start">
      {PLANS.map((p) => (
        <Card key={p.name} className="p-7" style={p.popular ? { border: `1px solid ${C.accent}`, background: C.bgRaised } : {}}>
          {p.popular && <Badge tone="accent">MOST POPULAR</Badge>}
          <h3 className="mt-3 text-lg font-medium" style={{ color: C.text, ...displayFont }}>{p.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span style={{ ...displayFont, color: C.text, fontSize: 34, fontWeight: 600 }}>{p.price}</span>
            <span className="text-sm" style={{ color: C.textFaint }}>{p.period}</span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {p.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: C.textMuted, ...bodyFont }}>
                <Check size={14} color={p.popular ? C.accentText : C.textFaint} className="flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <Button className="w-full mt-7" variant={p.popular ? "primary" : "secondary"} onClick={() => go("auth-up")}>{p.cta}</Button>
        </Card>
      ))}
    </div>
  </section>
);

const Footer = ({ go }) => (
  <footer style={{ borderTop: `1px solid ${C.border}` }}>
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <Logo size={18} />
      <p className="text-xs" style={{ color: C.textFaint, ...bodyFont }}>© 2026 Clippio. Turn long videos into short-form content.</p>
      <div className="flex gap-5 text-xs" style={{ color: C.textFaint, ...bodyFont }}>
        <button onClick={() => go("auth-in")} className="hover:opacity-80">Sign In</button>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </div>
  </footer>
);

const Landing = ({ go, push }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <LandingNav go={go} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Hero go={go} push={push} />
      <HowItWorks />
      <Features />
      <Pricing go={go} />
      <Footer go={go} />
    </div>
  );
};

/* ----------------------------- Auth ----------------------------- */
const AuthScreen = ({ mode, go, onAuth }) => {
  const [showPw, setShowPw] = useState(false);
  const isUp = mode === "auth-up";
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-sm clippio-rise">
        <button onClick={() => go("landing")} className="mb-8"><Logo /></button>
        <h1 className="text-2xl font-medium mb-1.5" style={{ ...displayFont, color: C.text }}>{isUp ? "Create your account" : "Welcome back"}</h1>
        <p className="text-sm mb-8" style={{ color: C.textMuted, ...bodyFont }}>
          {isUp ? "Start turning long videos into shorts, free." : "Sign in to continue to your dashboard."}
        </p>
        <form onSubmit={(e) => { e.preventDefault(); onAuth(); }} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: C.textMuted, ...bodyFont }}>Email</label>
            <div className="flex items-center gap-2 px-3.5 rounded-lg" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <Mail size={15} color={C.textFaint} />
              <input required type="email" placeholder="you@studio.com" className="bg-transparent outline-none py-2.5 text-sm w-full" style={{ color: C.text, ...bodyFont }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium" style={{ color: C.textMuted, ...bodyFont }}>Password</label>
              {!isUp && <button type="button" className="text-xs" style={{ color: C.textFaint }}>Forgot password?</button>}
            </div>
            <div className="flex items-center gap-2 px-3.5 rounded-lg" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <Lock size={15} color={C.textFaint} />
              <input required type={showPw ? "text" : "password"} placeholder="••••••••" className="bg-transparent outline-none py-2.5 text-sm w-full" style={{ color: C.text, ...bodyFont }} />
              <button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={15} color={C.textFaint} /> : <Eye size={15} color={C.textFaint} />}</button>
            </div>
          </div>
          <Button size="lg" className="w-full mt-2" type="submit">{isUp ? "Create Account" : "Sign In"}</Button>
        </form>
        <p className="text-sm text-center mt-6" style={{ color: C.textFaint, ...bodyFont }}>
          {isUp ? "Already have an account? " : "Don't have an account? "}
          <button onClick={() => go(isUp ? "auth-in" : "auth-up")} style={{ color: C.accentText }}>{isUp ? "Sign in" : "Sign up"}</button>
        </p>
      </div>
    </div>
  );
};

/* ----------------------------- App shell (dashboard) ----------------------------- */
const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "myvideos", label: "My Videos", icon: Film },
  { id: "clips", label: "Clips", icon: Clapperboard },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "brandkit", label: "Brand Kit", icon: Paintbrush },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ active, setActive, go, mobileOpen, setMobileOpen }) => (
  <>
    {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <div
      className={`fixed lg:sticky top-0 h-screen z-50 lg:z-0 flex flex-col transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      style={{ width: 232, background: C.bgRaised, borderRight: `1px solid ${C.border}` }}
    >
      <div className="px-5 h-16 flex items-center flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={() => go("landing")}><Logo /></button>
      </div>
      <div className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto clippio-scroll">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setMobileOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ background: isActive ? C.surfaceHover : "transparent", color: isActive ? C.text : C.textMuted, ...bodyFont }}
            >
              <item.icon size={16} color={isActive ? C.accentText : C.textFaint} />
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="p-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer" style={{ ":hover": {} }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.accentSoft }}>
            <span style={{ ...displayFont, color: C.accentText, fontSize: 12, fontWeight: 600 }}>JM</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate" style={{ color: C.text, ...bodyFont }}>Jordan Malik</div>
            <div className="text-xs" style={{ color: C.textFaint }}>Creator plan</div>
          </div>
          <button onClick={() => go("landing")}><LogOut size={15} color={C.textFaint} /></button>
        </div>
      </div>
    </div>
  </>
);

const TopBar = ({ title, subtitle, onMenu }) => (
  <div className="flex items-center justify-between px-6 lg:px-10 h-16 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
    <div className="flex items-center gap-3">
      <button className="lg:hidden" onClick={onMenu}><Menu size={20} color={C.text} /></button>
      <div>
        <div className="text-sm font-medium leading-none" style={{ color: C.text, ...bodyFont }}>{title}</div>
        {subtitle && <div className="text-xs mt-1" style={{ color: C.textFaint }}>{subtitle}</div>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.surface }}><Bell size={15} color={C.textFaint} /></button>
    </div>
  </div>
);

/* ----------------------------- Dashboard Home ----------------------------- */
const StatusPill = ({ status }) => {
  const map = { Ready: "success", Processing: "accent" };
  return <Badge tone={map[status] || "neutral"}>{status}</Badge>;
};

const ProjectCard = ({ p, onOpen }) => (
  <Card hover className="p-4 flex flex-col gap-4">
    <div className="rounded-xl flex items-center justify-center relative overflow-hidden" style={{ height: 110, background: C.bgRaised }}>
      <Film size={26} color={C.textFaint} />
      <div className="absolute bottom-2 right-2"><StatusPill status={p.status} /></div>
    </div>
    <div>
      <div className="text-sm font-medium truncate" style={{ color: C.text, ...bodyFont }}>{p.name}</div>
      <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: C.textFaint }}>
        <span>{p.clips} clips</span><span>·</span><span>{p.date}</span>
      </div>
    </div>
    <Button variant="secondary" size="sm" className="w-full" onClick={() => onOpen(p)}>Open Project</Button>
  </Card>
);

const DashboardHome = ({ projects, onUpload, onOpenProject }) => {
  const inputRef = useRef(null);
  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>Welcome back 👋</h1>
      <p className="mt-1.5 text-[15px]" style={{ color: C.textMuted, ...bodyFont }}>Turn your next video into viral-ready clips.</p>

      <Card className="mt-8 p-8 flex flex-col items-center text-center" style={{ background: C.bgRaised }}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }}
        onDrop={(e) => { e.preventDefault(); onUpload(e.dataTransfer.files?.[0]?.name || "new-upload.mp4"); }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.accentSoft }}>
          <UploadCloud size={24} color={C.accentText} />
        </div>
        <h3 className="text-lg font-medium" style={{ color: C.text, ...displayFont }}>Upload a video</h3>
        <p className="text-sm mt-1.5 mb-5" style={{ color: C.textMuted, ...bodyFont }}>Drag and drop, or choose a file from your computer.</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0].name)} />
        <Button icon={Plus} onClick={() => inputRef.current?.click()}>Choose Video</Button>
        <p className="text-xs mt-4" style={{ color: C.textFaint }}>MP4, MOV, AVI, WebM · Max 2GB</p>
      </Card>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium" style={{ color: C.text, ...bodyFont }}>Recent Projects</h3>
        </div>
        {projects.length === 0 ? (
          <Card className="p-10 text-center">
            <Folder size={22} color={C.textFaint} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: C.textMuted, ...bodyFont }}>No projects yet. Upload a video to get started.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => <ProjectCard key={p.id} p={p} onOpen={onOpenProject} />)}
          </div>
        )}
      </div>
    </div>
  );
};

/* ----------------------------- Processing screen ----------------------------- */
const STAGES = ["Uploading video", "Transcribing audio", "Finding key moments", "Detecting speakers", "Creating clips", "Generating captions", "Finalizing clips"];

const ProcessingScreen = ({ fileName, onDone }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = STAGES.length;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (total * 14);
        const newStage = Math.min(total - 1, Math.floor((next / 100) * total));
        setStageIdx(newStage);
        if (next >= 100) {
          clearInterval(id);
          setTimeout(onDone, 500);
          return 100;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [onDone]);

  const remaining = Math.max(1, Math.round(((100 - progress) / 100) * 22));

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto flex flex-col items-center text-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ background: C.accentSoft }}>
        <Wand2 size={24} color={C.accentText} style={{ animation: "clippio-pulse 1.6s ease-in-out infinite" }} />
      </div>
      <h2 className="text-xl font-medium" style={{ ...displayFont, color: C.text }}>Analyzing your video...</h2>
      <p className="text-sm mt-1.5 mb-8" style={{ color: C.textFaint, ...bodyFont }}>{fileName}</p>

      <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: C.border }}>
        <div className="h-full rounded-full transition-all duration-150" style={{ width: `${progress}%`, background: C.accent }} />
      </div>
      <p className="text-xs mb-8" style={{ color: C.textFaint }}>Estimated time remaining: {remaining}s</p>

      <div className="w-full flex flex-col gap-2.5 text-left">
        {STAGES.map((s, i) => {
          const done = i < stageIdx || progress >= 100;
          const current = i === stageIdx && progress < 100;
          return (
            <div key={s} className="flex items-center gap-3 px-4 py-2.5 rounded-lg" style={{ background: current ? C.surface : "transparent" }}>
              {done ? <Check size={15} color={C.success} /> : current ? <Circle size={15} color={C.accentText} style={{ animation: "clippio-pulse 1s ease-in-out infinite" }} /> : <Circle size={15} color={C.textFaint} />}
              <span className="text-sm" style={{ color: done ? C.text : current ? C.text : C.textFaint, ...bodyFont }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ----------------------------- Results ----------------------------- */
const ClipCard = ({ clip, onEdit, push }) => (
  <Card hover className="overflow-hidden flex flex-col">
    <div className="relative flex items-center justify-center" style={{ height: 200, background: C.bgRaised }}>
      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
        <Play size={16} color={C.text} fill={C.text} />
      </div>
      <div className="absolute top-2.5 left-2.5"><Badge tone="neutral"><Clock size={10} />{clip.duration}</Badge></div>
      <div className="absolute top-2.5 right-2.5"><Badge tone={clip.score >= 90 ? "success" : "accent"}><Star size={10} />{clip.score}</Badge></div>
      <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: clip.hue, opacity: 0.12 }} />
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <p className="text-sm font-medium leading-snug flex-1" style={{ color: C.text, ...bodyFont }}>{clip.title}</p>
      <div className="flex gap-2 mt-4">
        <Button size="sm" variant="secondary" className="flex-1" icon={Pencil} onClick={() => onEdit(clip)}>Edit</Button>
        <Button size="sm" variant="secondary" icon={Download} onClick={() => push(`Downloading "${clip.title.slice(0, 24)}…"`, "success")} />
      </div>
    </div>
  </Card>
);

const ResultsPage = ({ clips, fileName, onEdit, push, onBack }) => (
  <div className="p-6 lg:p-10">
    <button onClick={onBack} className="flex items-center gap-1.5 text-xs mb-5" style={{ color: C.textFaint, ...bodyFont }}>
      <ChevronLeft size={13} /> Back to dashboard
    </button>
    <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>Your clips are ready 🎉</h1>
    <p className="mt-1.5 text-[15px]" style={{ color: C.textMuted, ...bodyFont }}>
      <span style={{ color: C.accentText, fontWeight: 500 }}>{clips.length} clips generated</span> from {fileName}
    </p>
    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clips.map((c) => <ClipCard key={c.id} clip={c} onEdit={onEdit} push={push} />)}
    </div>
  </div>
);

/* ----------------------------- Editor ----------------------------- */
const EDITOR_TABS = ["Captions", "Video", "Branding", "Clip"];
const FONTS = ["Inter Tight", "Space Grotesk", "Archivo", "Sora"];
const ANIMATIONS = ["Pop", "Fade", "Typewriter", "Slide"];

const Timeline = ({ start, end, setStart, setEnd, duration }) => {
  const trackRef = useRef(null);
  const dragging = useRef(null);

  const pctFromEvent = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      const pct = pctFromEvent(e);
      if (dragging.current === "start") setStart(Math.min(pct, end - 3));
      else setEnd(Math.max(pct, start + 3));
    };
    const up = () => (dragging.current = null);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [start, end, setStart, setEnd]);

  const fmt = (pct) => {
    const secs = Math.round((pct / 100) * duration);
    return `0:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-2" style={{ color: C.textFaint, ...bodyFont }}>
        <span>Start: {fmt(start)}</span>
        <span>End: {fmt(end)}</span>
      </div>
      <div ref={trackRef} className="relative h-12 rounded-lg select-none" style={{ background: C.bgRaised, border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 bottom-0 rounded-md" style={{ left: `${start}%`, width: `${end - start}%`, background: C.accentSoft, border: `1px solid ${C.accent}` }} />
        {[start, end].map((pos, i) => (
          <div
            key={i}
            onMouseDown={() => (dragging.current = i === 0 ? "start" : "end")}
            onTouchStart={() => (dragging.current = i === 0 ? "start" : "end")}
            className="absolute top-0 bottom-0 w-3 flex items-center justify-center cursor-ew-resize -ml-1.5"
            style={{ left: `${pos}%` }}
          >
            <div className="w-1.5 h-8 rounded-full flex items-center justify-center" style={{ background: C.accent }}>
              <GripVertical size={9} color="#141210" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SidePanel = ({ tab, state, setState }) => {
  if (tab === "Captions") return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: C.text, ...bodyFont }}>Enable captions</span>
        <Toggle checked={state.captionsOn} onChange={(v) => setState((s) => ({ ...s, captionsOn: v }))} />
      </div>
      {state.captionsOn && (
        <>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Font</label>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((f) => (
                <button key={f} onClick={() => setState((s) => ({ ...s, font: f }))} className="px-3 py-2 rounded-lg text-xs text-left"
                  style={{ background: state.font === f ? C.accentSoft : C.surface, color: state.font === f ? C.accentText : C.textMuted, border: `1px solid ${state.font === f ? C.accent : C.border}` }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Size ({state.fontSize}px)</label>
            <input type="range" min="16" max="48" value={state.fontSize} onChange={(e) => setState((s) => ({ ...s, fontSize: +e.target.value }))} className="w-full accent-current" style={{ accentColor: C.accent }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Position</label>
            <div className="flex gap-2">
              {["Top", "Center", "Bottom"].map((p) => (
                <button key={p} onClick={() => setState((s) => ({ ...s, position: p }))} className="flex-1 px-3 py-2 rounded-lg text-xs"
                  style={{ background: state.position === p ? C.accentSoft : C.surface, color: state.position === p ? C.accentText : C.textMuted, border: `1px solid ${state.position === p ? C.accent : C.border}` }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Animation style</label>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATIONS.map((a) => (
                <button key={a} onClick={() => setState((s) => ({ ...s, animation: a }))} className="px-3 py-2 rounded-lg text-xs"
                  style={{ background: state.animation === a ? C.accentSoft : C.surface, color: state.animation === a ? C.accentText : C.textMuted, border: `1px solid ${state.animation === a ? C.accent : C.border}` }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (tab === "Video") return (
    <div>
      <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Aspect ratio</label>
      <div className="grid grid-cols-3 gap-2">
        {["9:16", "1:1", "16:9"].map((r) => (
          <button key={r} onClick={() => setState((s) => ({ ...s, ratio: r }))} className="py-3 rounded-lg text-sm font-medium"
            style={{ background: state.ratio === r ? C.accentSoft : C.surface, color: state.ratio === r ? C.accentText : C.textMuted, border: `1px solid ${state.ratio === r ? C.accent : C.border}` }}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );

  if (tab === "Branding") return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Logo</label>
        <div className="rounded-lg py-6 flex flex-col items-center gap-2" style={{ border: `1.5px dashed ${C.border}` }}>
          <UploadCloud size={16} color={C.textFaint} />
          <span className="text-xs" style={{ color: C.textFaint }}>Upload logo</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Brand colors</label>
        <div className="flex gap-2">
          {[C.accent, "#7C9CBF", "#8FBF8A", "#C98FBF", "#F3F3F1"].map((col) => (
            <button key={col} onClick={() => setState((s) => ({ ...s, brandColor: col }))} className="w-8 h-8 rounded-full" style={{ background: col, outline: state.brandColor === col ? `2px solid ${C.text}` : "none", outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: C.text, ...bodyFont }}>Watermark</span>
        <Toggle checked={state.watermark} onChange={(v) => setState((s) => ({ ...s, watermark: v }))} />
      </div>
    </div>
  );

  if (tab === "Clip") return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Title</label>
        <input value={state.title} onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, ...bodyFont }} />
      </div>
      <p className="text-xs leading-relaxed" style={{ color: C.textFaint, ...bodyFont }}>Use the timeline below to fine-tune the start and end of this clip.</p>
    </div>
  );

  return null;
};

const Editor = ({ clip, onBack, push }) => {
  const [tab, setTab] = useState("Captions");
  const [start, setStart] = useState(8);
  const [end, setEnd] = useState(72);
  const [state, setState] = useState({
    captionsOn: true, font: "Space Grotesk", fontSize: 28, position: "Bottom", animation: "Pop",
    ratio: "9:16", brandColor: C.accent, watermark: false, title: clip?.title || "Untitled clip",
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 lg:px-10 h-16 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs" style={{ color: C.textFaint, ...bodyFont }}>
          <ChevronLeft size={13} /> Back to clips
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => push("Changes saved", "success")}>Save Changes</Button>
          <Button size="sm" icon={Download} onClick={() => push("Exporting clip…", "success")}>Export Clip</Button>
        </div>
      </div>
      <div className="flex-1 grid lg:grid-cols-[1fr_340px] overflow-hidden">
        <div className="p-6 lg:p-10 flex flex-col items-center justify-center gap-6" style={{ background: C.bg }}>
          <div className="rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              width: state.ratio === "9:16" ? 220 : state.ratio === "1:1" ? 320 : 420,
              height: state.ratio === "9:16" ? 390 : state.ratio === "1:1" ? 320 : 236,
              background: C.bgRaised, border: `1px solid ${C.border}`,
            }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Play size={18} color={C.text} fill={C.text} />
            </div>
            {state.captionsOn && (
              <div className="absolute left-3 right-3 text-center px-2 py-1 rounded"
                style={{ [state.position === "Top" ? "top" : state.position === "Center" ? "top" : "bottom"]: state.position === "Center" ? "45%" : 14, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: Math.max(10, state.fontSize / 2.6), fontFamily: state.font }}>
                the ONE mistake everyone makes
              </div>
            )}
          </div>
          <div className="w-full max-w-md">
            <Timeline start={start} end={end} setStart={setStart} setEnd={setEnd} duration={95} />
          </div>
        </div>
        <div className="p-6 flex flex-col gap-5 overflow-y-auto clippio-scroll" style={{ borderLeft: `1px solid ${C.border}` }}>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: C.bgRaised }}>
            {EDITOR_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{ background: tab === t ? C.surface : "transparent", color: tab === t ? C.text : C.textFaint }}>
                {t}
              </button>
            ))}
          </div>
          <SidePanel tab={tab} state={state} setState={setState} />
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- My Videos / Clips / Templates / Brand Kit / Settings ----------------------------- */
const MyVideos = ({ projects }) => (
  <div className="p-6 lg:p-10">
    <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>My Videos</h1>
    <p className="mt-1.5 text-[15px] mb-8" style={{ color: C.textMuted, ...bodyFont }}>Every source video you've uploaded to Clippio.</p>
    <div className="flex flex-col gap-2">
      {projects.map((p) => (
        <Card key={p.id} hover className="p-4 flex items-center gap-4">
          <div className="w-16 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.bgRaised }}>
            <Film size={16} color={C.textFaint} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: C.text, ...bodyFont }}>{p.name}</div>
            <div className="text-xs mt-0.5" style={{ color: C.textFaint }}>{p.niche} · {p.date}</div>
          </div>
          <Badge tone="neutral">{p.clips} clips</Badge>
          <StatusPill status={p.status} />
        </Card>
      ))}
    </div>
  </div>
);

const ClipsLibrary = ({ allClips, onEdit, push }) => {
  const [q, setQ] = useState("");
  const filtered = allClips.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>Clips</h1>
      <p className="mt-1.5 text-[15px] mb-6" style={{ color: C.textMuted, ...bodyFont }}>Every clip Clippio has generated across your projects.</p>
      <div className="flex items-center gap-2 px-3.5 rounded-lg mb-6 max-w-sm" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Search size={14} color={C.textFaint} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clips…" className="bg-transparent outline-none py-2.5 text-sm w-full" style={{ color: C.text, ...bodyFont }} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((c) => <ClipCard key={c.id} clip={c} onEdit={onEdit} push={push} />)}
      </div>
    </div>
  );
};

const Templates = ({ push }) => {
  const templates = [
    { name: "Bold Podcast", desc: "Big captions, punchy pop animation, bottom-center." },
    { name: "Minimal Interview", desc: "Small captions, fade animation, no watermark." },
    { name: "High Energy Fitness", desc: "Large captions, top position, brand accent color." },
  ];
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>Templates</h1>
      <p className="mt-1.5 text-[15px] mb-8" style={{ color: C.textMuted, ...bodyFont }}>Reusable caption and style presets for new clips.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <Card key={t.name} hover className="p-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: C.accentSoft }}>
              <LayoutTemplate size={16} color={C.accentText} />
            </div>
            <h3 className="text-[15px] font-medium mb-1.5" style={{ color: C.text, ...bodyFont }}>{t.name}</h3>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: C.textMuted, ...bodyFont }}>{t.desc}</p>
            <Button size="sm" variant="secondary" className="w-full" onClick={() => push(`Applied "${t.name}" template`, "success")}>Use Template</Button>
          </Card>
        ))}
        <button onClick={() => push("Template saved", "success")} className="rounded-2xl flex flex-col items-center justify-center gap-2 py-10" style={{ border: `1.5px dashed ${C.border}` }}>
          <Plus size={18} color={C.textFaint} />
          <span className="text-xs" style={{ color: C.textFaint }}>Save current style as template</span>
        </button>
      </div>
    </div>
  );
};

const BrandKit = ({ push }) => {
  const [color, setColor] = useState(C.accent);
  const [font, setFont] = useState("Space Grotesk");
  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>Brand Kit</h1>
      <p className="mt-1.5 text-[15px] mb-8" style={{ color: C.textMuted, ...bodyFont }}>Your logo, colors, and fonts, applied automatically to every clip.</p>
      <Card className="p-6 flex flex-col gap-6">
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Logo</label>
          <div className="rounded-xl py-8 flex flex-col items-center gap-2" style={{ border: `1.5px dashed ${C.border}` }}>
            <UploadCloud size={18} color={C.textFaint} />
            <span className="text-xs" style={{ color: C.textFaint }}>Drop logo or click to upload</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Brand color</label>
          <div className="flex gap-2">
            {[C.accent, "#7C9CBF", "#8FBF8A", "#C98FBF", "#F3F3F1", "#E0796D"].map((c) => (
              <button key={c} onClick={() => setColor(c)} className="w-9 h-9 rounded-full" style={{ background: c, outline: color === c ? `2px solid ${C.text}` : "none", outlineOffset: 2 }} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: C.textMuted }}>Caption font</label>
          <div className="grid grid-cols-2 gap-2">
            {FONTS.map((f) => (
              <button key={f} onClick={() => setFont(f)} className="px-3 py-2.5 rounded-lg text-sm text-left"
                style={{ background: font === f ? C.accentSoft : C.bgRaised, color: font === f ? C.accentText : C.textMuted, border: `1px solid ${font === f ? C.accent : C.border}` }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <Button className="self-start" onClick={() => push("Brand Kit saved", "success")}>Save Brand Kit</Button>
      </Card>
    </div>
  );
};

const AnalyticsPage = () => {
  const stats = [
    { label: "Total clips created", value: "248", icon: Clapperboard },
    { label: "Total exports", value: "196", icon: Download },
    { label: "Videos processed", value: "31", icon: Film },
    { label: "Average clip score", value: "84", icon: TrendingUp },
  ];
  const bars = [62, 71, 55, 80, 68, 90, 84];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>Analytics</h1>
      <p className="mt-1.5 text-[15px] mb-8" style={{ color: C.textMuted, ...bodyFont }}>How your clips are performing.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <s.icon size={16} color={C.accentText} />
            <div className="mt-3" style={{ ...displayFont, color: C.text, fontSize: 26, fontWeight: 600 }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: C.textFaint, ...bodyFont }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="text-sm font-medium mb-6" style={{ color: C.text, ...bodyFont }}>Average clip score, last 7 days</h3>
        <div className="flex items-end gap-4 h-40">
          {bars.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-md transition-all" style={{ height: `${b}%`, background: i === bars.length - 1 ? C.accent : C.borderLight }} />
              <span className="text-[11px]" style={{ color: C.textFaint }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SettingsPage = ({ push }) => {
  const [name, setName] = useState("Jordan Malik");
  const [email, setEmail] = useState("jordan@studio.com");
  return (
    <div className="p-6 lg:p-10 max-w-xl">
      <h1 className="text-2xl font-medium" style={{ ...displayFont, color: C.text }}>Settings</h1>
      <p className="mt-1.5 text-[15px] mb-8" style={{ color: C.textMuted, ...bodyFont }}>Manage your account and plan.</p>
      <Card className="p-6 flex flex-col gap-4 mb-6">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: C.textMuted }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: C.bgRaised, border: `1px solid ${C.border}`, color: C.text, ...bodyFont }} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: C.textMuted }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: C.bgRaised, border: `1px solid ${C.border}`, color: C.text, ...bodyFont }} />
        </div>
        <Button className="self-start mt-2" onClick={() => push("Account updated", "success")}>Save Changes</Button>
      </Card>
      <Card className="p-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium" style={{ color: C.text, ...bodyFont }}>Creator plan</div>
          <div className="text-xs mt-1" style={{ color: C.textFaint }}>30 videos/month · No watermark</div>
        </div>
        <Button variant="secondary" size="sm">Manage Plan</Button>
      </Card>
    </div>
  );
};

/* ----------------------------- App root ----------------------------- */
export default function ClippioApp() {
  const [view, setView] = useState("landing");
  const [sidebarActive, setSidebarActive] = useState("dashboard");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [uploadFileName, setUploadFileName] = useState("");
  const [resultClips, setResultClips] = useState([]);
  const [editingClip, setEditingClip] = useState(null);
  const [flow, setFlow] = useState("dashboard"); // dashboard | processing | results | editor
  const [toasts, push] = useToasts();

  const go = (v) => { setView(v); window.scrollTo(0, 0); };

  const handleAuth = () => { setView("app"); setFlow("dashboard"); setSidebarActive("dashboard"); push("Signed in successfully"); };

  const handleUpload = (fileName) => {
    setUploadFileName(fileName);
    setFlow("processing");
  };

  const handleProcessingDone = () => {
    const clips = makeClips(uploadFileName);
    setResultClips(clips);
    setProjects((p) => [{ id: `p${p.length + 1}`, name: uploadFileName.replace(/\.[^/.]+$/, ""), clips: clips.length, date: "Just now", status: "Ready", niche: "New" }, ...p]);
    setFlow("results");
    push(`${clips.length} clips generated`, "success");
  };

  const handleOpenProject = (project) => {
    setUploadFileName(project.name);
    setResultClips(makeClips(project.id));
    setFlow("results");
  };

  const handleEditClip = (clip) => { setEditingClip(clip); setFlow("editor"); };

  const allClipsAcrossProjects = projects.slice(0, 5).flatMap((p) => makeClips(p.id).slice(0, 2));

  const sidebarTitles = {
    dashboard: ["Dashboard", null], myvideos: ["My Videos", null], clips: ["Clips", null],
    templates: ["Templates", null], brandkit: ["Brand Kit", null], analytics: ["Analytics", null], settings: ["Settings", null],
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", ...bodyFont }}>
      <FontImports />
      {view === "landing" && <Landing go={go} push={push} />}
      {(view === "auth-in" || view === "auth-up") && <AuthScreen mode={view} go={go} onAuth={handleAuth} />}
      {view === "app" && (
        <div className="flex" style={{ minHeight: "100vh" }}>
          <Sidebar active={sidebarActive} setActive={(id) => { setSidebarActive(id); setFlow("dashboard"); }} go={go} mobileOpen={mobileSidebar} setMobileOpen={setMobileSidebar} />
          <div className="flex-1 min-w-0 flex flex-col">
            {flow !== "editor" && (
              <TopBar title={sidebarTitles[sidebarActive]?.[0] || "Dashboard"} onMenu={() => setMobileSidebar(true)} />
            )}
            <div className="flex-1 min-h-0">
              {flow === "processing" && <ProcessingScreen fileName={uploadFileName} onDone={handleProcessingDone} />}
              {flow === "results" && (
                <ResultsPage clips={resultClips} fileName={uploadFileName} onEdit={handleEditClip} push={push} onBack={() => setFlow("dashboard")} />
              )}
              {flow === "editor" && <Editor clip={editingClip} onBack={() => setFlow("results")} push={push} />}
              {flow === "dashboard" && sidebarActive === "dashboard" && (
                <DashboardHome projects={projects} onUpload={handleUpload} onOpenProject={handleOpenProject} />
              )}
              {flow === "dashboard" && sidebarActive === "myvideos" && <MyVideos projects={projects} />}
              {flow === "dashboard" && sidebarActive === "clips" && <ClipsLibrary allClips={allClipsAcrossProjects} onEdit={handleEditClip} push={push} />}
              {flow === "dashboard" && sidebarActive === "templates" && <Templates push={push} />}
              {flow === "dashboard" && sidebarActive === "brandkit" && <BrandKit push={push} />}
              {flow === "dashboard" && sidebarActive === "analytics" && <AnalyticsPage />}
              {flow === "dashboard" && sidebarActive === "settings" && <SettingsPage push={push} />}
            </div>
          </div>
        </div>
      )}
      <ToastStack toasts={toasts} />
    </div>
  );
}
