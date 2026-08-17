"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const GITHUB_URL = "https://github.com/devboluwatife53/stellar-payment-dapp";
const CONTRACT_URL =
  "https://stellar.expert/explorer/testnet/contract/CC5MICUKQBZ736HE5ECZF3OQ3DZWRTRZSIDWYZK4Y2IQMOCPN5JAQC23";

/* ---------------------------------- icons --------------------------------- */

function IconWallet({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14.5 12h3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H14.5a1.5 1.5 0 0 1 0-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M6 6V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconUsers({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.5 6.5A3 3 0 0 1 16 12.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 13.2c2.4.4 4.5 1.7 5.5 3.9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconContract({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V5A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12h8M8 15.5h8M8 8.5h3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconHistory({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGithub({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function IconShield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 5 6v5.5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconZap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 5 13h5.5L11 21l7-10h-5.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------- motion ----------------------------------- */

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({ to, decimals = 2 }: { to: number; decimals?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf: number;
    const duration = 900;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}

/* ------------------------------- primitives ------------------------------- */

function PillButton({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-pill px-5 py-2 text-[14px] font-normal leading-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-bone text-ink shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] hover:bg-white"
      : "bg-white/5 text-snow hover:bg-white/10";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xs border border-mint px-1.5 py-0.5 text-[9px] font-medium text-mint">
      <span className="h-1 w-1 animate-pulse-dot rounded-full bg-mint" />
      {children}
    </span>
  );
}

/* --------------------------------- content --------------------------------- */

const NAV_ITEMS = [
  { label: "Product", href: "#product" },
  { label: "On-chain proof", href: "#contract" },
  { label: "How it works", href: "#workflow" },
];

const TABS = [
  {
    key: "payments",
    label: "Batch Payments",
    icon: IconUsers,
    description: "Send XLM to up to 20 recipients in one atomic transaction.",
  },
  {
    key: "contract",
    label: "Smart Contract",
    icon: IconContract,
    description: "Soroban contract records every batch run on-chain.",
  },
  {
    key: "wallet",
    label: "Wallet",
    icon: IconWallet,
    description: "Freighter connect with automatic Testnet detection.",
  },
  {
    key: "history",
    label: "History",
    icon: IconHistory,
    description: "Every payment linked to Stellar Expert, saved locally.",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const RECIPIENTS = [
  { addr: "GABC…7X2Q", amount: "125.00", status: "confirmed" },
  { addr: "GDEF…9K1M", amount: "125.00", status: "confirmed" },
  { addr: "GHIJ…3P8N", amount: "250.00", status: "confirmed" },
  { addr: "GKLM…5R4T", amount: "125.00", status: "pending" },
];

const CONTRACT_BENEFITS = [
  "Every batch run is written permanently to the Stellar ledger — no separate logbook to maintain.",
  "Anyone can verify a payroll run happened, without trusting a database you control.",
  "Total paid and full payment history are queryable on-chain, anytime.",
];

const WORKFLOW_STEPS = [
  { title: "Connect wallet", desc: "Link Freighter, auto-detect Testnet.", icon: IconWallet, tone: "text-signal-blue" },
  { title: "Add recipients", desc: "Paste up to 20 addresses, same or custom amounts.", icon: IconUsers, tone: "text-arc-blue" },
  { title: "Review total", desc: "See the exact XLM debit before confirming.", icon: IconZap, tone: "text-ember" },
  { title: "Recorded on-chain", desc: "Batch settles atomically, logged via Soroban.", icon: IconContract, tone: "text-mint" },
];

const BUILT_WITH = ["Stellar", "Soroban", "Freighter", "Next.js", "Horizon"];

/* ---------------------------------- page ----------------------------------- */

export default function LandingPage() {
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("payments");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main>
      {announcementOpen && (
        <div className="flex items-center justify-center gap-2 bg-void px-4 py-2 text-center text-[14px] font-normal text-chalk">
          <span>Stellar Testnet demo — test XLM only, no real funds. Every batch is recorded by a live Soroban contract.</span>
          <a href={CONTRACT_URL} target="_blank" rel="noreferrer" className="text-snow underline underline-offset-2">
            View contract
          </a>
          <button
            aria-label="Dismiss"
            onClick={() => setAnnouncementOpen(false)}
            className="ml-2 text-snow/92 hover:text-snow"
          >
            ×
          </button>
        </div>
      )}

      {/* Nav */}
      <header
        className={`sticky top-0 z-20 h-[72px] border-b-[0.5px] transition-colors duration-300 ${
          scrolled ? "border-white/7 bg-void/80 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1080px] items-center justify-between px-6">
          <span className="text-[15px] font-medium tracking-[-0.02em] text-snow">Stellar Payroll</span>
          <nav className="hidden gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="text-[14px] font-normal text-snow/92 hover:text-snow">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden text-[14px] font-normal text-snow/92 hover:text-snow sm:inline"
            >
              GitHub
            </a>
            <PillButton href="/app">Launch App</PillButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="product" className="mx-auto max-w-[1080px] px-6 pt-20">
        <div className="grid gap-10 md:grid-cols-[60%_40%] md:items-start">
          <Reveal>
            <h1 className="text-[42px] font-normal leading-[1.05] tracking-[-0.02em] text-snow sm:text-[52px] sm:leading-[1.0] sm:tracking-[-1.3px]">
              Pay twenty people the way you&apos;d pay one.
            </h1>
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-6">
            <p className="text-[18px] font-normal leading-[1.5] tracking-[-0.61px] text-fog">
              Connect Freighter, add up to 20 recipients, and settle payroll in
              a single atomic transaction — with on-chain record-keeping via
              Soroban.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PillButton href="/app">
                Launch App
                <IconArrowRight className="h-3.5 w-3.5" />
              </PillButton>
              <PillButton href={GITHUB_URL} variant="secondary">
                <IconGithub className="h-3.5 w-3.5" />
                View on GitHub
              </PillButton>
            </div>
            <div className="flex flex-col gap-2 border-t-[0.5px] border-white/7 pt-4">
              <div className="flex items-start gap-2">
                <IconShield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ash" />
                <span className="text-[12px] font-normal leading-[1.4] text-ash">
                  Non-custodial — your keys never leave Freighter. This app
                  never holds your funds.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <IconZap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ash" />
                <span className="text-[12px] font-normal leading-[1.4] text-ash">
                  Running on Stellar Testnet — test XLM only, not real money.
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Product mockup panel */}
        <Reveal
          delay={200}
          className="mt-16 overflow-hidden rounded-md border-[0.5px] border-white/7 bg-graphite/80 shadow-[0_100px_106px_rgba(0,0,0,0.05),0_42px_44px_rgba(0,0,0,0.04),0_22px_24px_rgba(0,0,0,0.03),0_12px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b-[0.5px] border-white/7 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-smoke" />
              <span className="text-[12px] font-normal text-fog">Batch Payment Preview</span>
            </div>
            <StatusBadge>Testnet</StatusBadge>
          </div>
          <div className="grid gap-0 sm:grid-cols-[1fr_280px]">
            <div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 text-[9px] font-medium uppercase tracking-wide text-ash">
                <span>Recipient</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {RECIPIENTS.map((r) => (
                <div
                  key={r.addr}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b-[0.5px] border-white/5 px-5 py-2"
                >
                  <span className="font-mono text-[12px] text-chalk">{r.addr}</span>
                  <span className="text-right text-[12px] text-snow">{r.amount} XLM</span>
                  {r.status === "confirmed" ? (
                    <StatusBadge>Confirmed</StatusBadge>
                  ) : (
                    <span className="text-[10px] font-normal text-ash">Pending</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-between gap-4 border-t-[0.5px] border-white/7 p-5 sm:border-l-[0.5px] sm:border-t-0">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wide text-ash">Total to send</p>
                <p className="mt-1 text-[32px] font-normal leading-[1.25] tracking-[-0.64px] text-snow">
                  <CountUp to={625} /> XLM
                </p>
              </div>
              <div className="rounded-sm border-[0.5px] border-white/8 bg-charcoal p-3">
                <p className="text-[10px] font-normal leading-[1.4] text-ash">
                  Reserve buffer (~1 XLM) held back automatically. Fees scale
                  100 stroops per operation.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Feature tabs */}
      <section id="contract" className="mx-auto max-w-[1080px] scroll-mt-[88px] px-6 py-24">
        <Reveal>
          <h2 className="max-w-xl text-[32px] font-normal leading-[1.25] tracking-[-0.64px] text-snow">
            Everything payroll needs, one interface.
          </h2>
          <p className="mt-3 max-w-lg text-[15px] font-normal leading-[1.47] text-fog">
            Wallet, batch logic, on-chain proof, and history — no separate
            tools, no spreadsheets.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-[30%_70%]">
          <div className="flex flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-start gap-3 rounded-md px-4 py-3 text-left transition-all duration-300 ${
                    active ? "bg-graphite" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-signal-blue" : "text-fog"}`} />
                  <span>
                    <span
                      className={`block text-[14px] font-normal ${
                        active ? "border-b border-snow text-snow" : "text-fog"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span className="mt-1 block text-[12px] font-normal leading-[1.4] text-steel">
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div key={activeTab} className="animate-fade-in-up rounded-md bg-[#121316] px-8 py-7">
            {activeTab === "payments" && (
              <div>
                <p className="text-[14px] font-normal text-snow">Recipients this run</p>
                <div className="mt-4 divide-y-[0.5px] divide-white/5">
                  {RECIPIENTS.map((r) => (
                    <div key={r.addr} className="flex items-center justify-between py-2.5">
                      <span className="font-mono text-[12px] text-chalk">{r.addr}</span>
                      <span className="text-[12px] text-snow">{r.amount} XLM</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "contract" && (
              <div>
                <p className="text-[14px] font-normal text-snow">Every batch, recorded on-chain</p>
                <div className="mt-4 flex flex-col gap-3">
                  {CONTRACT_BENEFITS.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2">
                      <IconShield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint" />
                      <p className="text-[12px] font-normal leading-[1.5] text-fog">{benefit}</p>
                    </div>
                  ))}
                </div>
                <PillButton href={CONTRACT_URL} variant="secondary" className="mt-5">
                  View contract
                  <IconArrowRight className="h-3.5 w-3.5" />
                </PillButton>
              </div>
            )}
            {activeTab === "wallet" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-sm border-[0.5px] border-white/8 bg-graphite p-4">
                  <div className="flex items-center gap-3">
                    <IconWallet className="h-5 w-5 text-signal-blue" />
                    <div>
                      <p className="text-[13px] font-normal text-snow">Freighter</p>
                      <p className="text-[11px] font-normal text-fog">GABC…7X2Q</p>
                    </div>
                  </div>
                  <StatusBadge>Connected</StatusBadge>
                </div>
                <p className="text-[12px] font-normal leading-[1.5] text-fog">
                  Network mismatches are caught automatically — the app warns
                  you if Freighter isn&apos;t set to Testnet before you send.
                </p>
              </div>
            )}
            {activeTab === "history" && (
              <div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-3 pb-2 text-[9px] font-medium uppercase tracking-wide text-ash">
                  <span>Hash</span>
                  <span>Recipients</span>
                  <span>Status</span>
                </div>
                {["a3f81c9e…44b2", "9a11c2f4…7ae2", "2bd4e901…f10c"].map((hash) => (
                  <div
                    key={hash}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t-[0.5px] border-white/5 py-2.5"
                  >
                    <span className="font-mono text-[11px] text-arc-blue underline underline-offset-2">{hash}</span>
                    <span className="text-[11px] text-chalk">4</span>
                    <StatusBadge>Confirmed</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="mx-auto max-w-[1080px] scroll-mt-[88px] px-6 py-24">
        <Reveal>
          <h2 className="max-w-xl text-[32px] font-normal leading-[1.25] tracking-[-0.64px] text-snow">
            Four steps, one transaction.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.title}
                delay={i * 100}
                className="relative rounded-sm border-[0.5px] border-white/8 bg-graphite p-3 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-4 w-4 ${step.tone}`} />
                  <span className="text-[9px] font-medium text-ash">0{i + 1}</span>
                </div>
                <p className="mt-3 text-[12px] font-medium text-snow">{step.title}</p>
                <p className="mt-1 text-[10px] font-normal leading-[1.4] text-ash">{step.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1080px] px-6 py-24 text-center">
        <Reveal>
          <h2 className="text-[42px] font-normal leading-[1.2] tracking-[-0.88px] text-snow sm:text-[52px] sm:tracking-[-1.3px]">
            Try it risk-free before it touches real money.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] font-normal leading-[1.5] text-fog">
            Free test XLM from Friendbot, a non-custodial wallet, and a
            verifiable receipt for every run on Stellar Expert.
          </p>
          <div className="mt-8 flex justify-center">
            <PillButton href="/app">
              Launch App
              <IconArrowRight className="h-3.5 w-3.5" />
            </PillButton>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t-[0.5px] border-white/7 bg-[#171717]">
        <div className="mx-auto grid max-w-[1080px] grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-3">
          <div>
            <p className="text-[9px] font-medium text-ash">Product</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/app" className="text-[12px] font-normal text-fog hover:text-snow">Launch App</Link>
              <a href="#workflow" className="text-[12px] font-normal text-fog hover:text-snow">How it works</a>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-medium text-ash">Resources</p>
            <div className="mt-3 flex flex-col gap-2">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-[12px] font-normal text-fog hover:text-snow">
                GitHub
              </a>
              <a href={CONTRACT_URL} target="_blank" rel="noreferrer" className="text-[12px] font-normal text-fog hover:text-snow">
                Contract
              </a>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-medium text-ash">Built with</p>
            <div className="mt-3 flex flex-col gap-2">
              {BUILT_WITH.map((name) => (
                <span key={name} className="text-[12px] font-normal text-fog">{name}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t-[0.5px] border-white/7 px-6 py-5 text-center text-[11px] font-normal text-ash">
          Stellar Payroll — a Stellar Testnet demo application. No real funds
          are used.
        </div>
      </footer>
    </main>
  );
}
