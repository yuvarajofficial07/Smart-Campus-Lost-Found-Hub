import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { CATEGORIES, itemsQuery, type Item } from "@/lib/items";
import { ItemCard } from "@/components/ItemCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Lost & Found Hub — Find your lost things" },
      {
        name: "description",
        content:
          "One place for our college to post lost and found items. Search, filter and contact the person directly on WhatsApp or email.",
      },
      { property: "og:title", content: "Campus Lost & Found Hub" },
      {
        property: "og:description",
        content:
          "Post lost or found items on campus and reach the right person in one tap.",
      },
    ],
  }),
  component: Dashboard,
});

type Tab = "all" | "lost" | "found";

function Dashboard() {
  const { data, isLoading, error } = useQuery(itemsQuery);
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  const items: Item[] = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (tab !== "all" && it.type !== tab) return false;
      if (category !== "All" && it.category !== category) return false;
      if (!q) return true;
      return [it.item_name, it.place, it.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, tab, category, search]);

  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <section className="board-card relative overflow-hidden px-6 py-10 sm:px-10">
        <span className="absolute right-8 top-8 hidden size-3 rounded-full bg-accent shadow-pin sm:block" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
          Smart Campus
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Lost something on campus? Look here first.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          No more digging through WhatsApp groups. Post what you lost or found,
          and talk to the right person in one tap.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to="/report"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-pin transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" aria-hidden />
            Report an item
          </Link>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-lost">{lostCount} lost</span>
            {" · "}
            <span className="font-semibold text-found">{foundCount} found</span>
          </p>
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            maxLength={80}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item, place or words…"
            aria-label="Search items"
            className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(["all", "lost", "found"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors",
                tab === t
                  ? t === "lost"
                    ? "bg-lost text-lost-foreground"
                    : t === "found"
                      ? "bg-found text-found-foreground"
                      : "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              category === c
                ? "border-accent bg-accent text-accent-foreground font-semibold"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </section>

      <section className="mt-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="board-card h-56 animate-pulse bg-muted"
                aria-hidden
              />
            ))}
          </div>
        ) : error ? (
          <p className="board-card p-8 text-center text-sm text-muted-foreground">
            Could not load items right now. Please refresh the page.
          </p>
        ) : filtered.length === 0 ? (
          <div className="board-card p-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Nothing here yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another search, or post the item yourself.
            </p>
            <Link
              to="/report"
              className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Report an item
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
