import { CalendarDays, Mail, MapPin, MessageCircle } from "lucide-react";
import { mailLink, whatsappLink, type Item } from "@/lib/items";

const categoryLabel: Record<string, string> = {
  Electronics: "Electronics",
  Documents: "Documents",
  Keys: "Keys",
  Clothing: "Clothing",
  Other: "Other",
};

export function ItemCard({ item }: { item: Item }) {
  const isLost = item.type === "lost";
  const wa = whatsappLink(item);
  const mail = mailLink(item);

  return (
    <article className="board-card board-card-hover flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div>
          <span
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              isLost
                ? "bg-lost text-lost-foreground"
                : "bg-found text-found-foreground",
            ].join(" ")}
          >
            {isLost ? "Lost" : "Found"}
          </span>
          <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">
            {item.item_name}
          </h3>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {categoryLabel[item.category] ?? item.category}
        </span>
      </div>

      {item.description ? (
        <p className="px-5 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      ) : null}

      <div className="mt-4 space-y-1.5 px-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
          {item.place}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-accent" aria-hidden />
          {new Date(item.item_date).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border bg-secondary/50 px-5 py-4">
        <span className="mr-auto text-xs text-muted-foreground">
          Posted by {item.reporter_name}
        </span>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-found px-3 py-2 text-xs font-semibold text-found-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        ) : null}
        {mail ? (
          <a
            href={mail}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Mail className="size-4" aria-hidden />
            Email
          </a>
        ) : null}
      </div>
    </article>
  );
}
