import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, itemSchema, type ItemForm } from "@/lib/items";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Lost or Found Item — Campus Lost & Found" },
      {
        name: "description",
        content:
          "Post an item you lost or found on campus. Add the place, date and how people can reach you.",
      },
      { property: "og:title", content: "Report a Lost or Found Item" },
      {
        property: "og:description",
        content: "Add your lost or found item to the campus board in a minute.",
      },
    ],
  }),
  component: ReportPage,
});

const emptyForm: ItemForm = {
  type: "lost",
  item_name: "",
  category: "Electronics",
  description: "",
  place: "",
  item_date: new Date().toISOString().slice(0, 10),
  reporter_name: "",
  contact_email: "",
  contact_whatsapp: "",
};

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

function ReportPage() {
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const set = <K extends keyof ItemForm>(key: K, value: ItemForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: async (values: ItemForm) => {
      const { error } = await supabase.from("items").insert({
        type: values.type,
        item_name: values.item_name,
        category: values.category,
        description: values.description || null,
        place: values.place,
        item_date: values.item_date,
        reporter_name: values.reporter_name,
        contact_email: values.contact_email || null,
        contact_whatsapp: values.contact_whatsapp || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Posted! Your item is on the board.");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate({ to: "/" });
    },
    onError: () => toast.error("Could not post the item. Please try again."),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = itemSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to board
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
        Report an item
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill this short form. Everyone on campus will see it right away.
      </p>

      <form onSubmit={onSubmit} className="board-card mt-8 space-y-6 p-6 sm:p-8">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-foreground">
            What happened?
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(["lost", "found"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                aria-pressed={form.type === t}
                className={[
                  "rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-colors",
                  form.type === t
                    ? t === "lost"
                      ? "border-lost bg-lost text-lost-foreground"
                      : "border-found bg-found text-found-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                I {t} something
              </button>
            ))}
          </div>
        </fieldset>

        <Field label="Item name" error={errors["item_name"]}>
          <input
            className={fieldClass}
            value={form.item_name}
            maxLength={80}
            onChange={(e) => set("item_name", e.target.value)}
            placeholder="Blue student ID card"
          />
        </Field>

        <Field label="Category" error={errors["category"]}>
          <select
            className={fieldClass}
            value={form.category}
            onChange={(e) =>
              set("category", e.target.value as ItemForm["category"])
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label={form.type === "lost" ? "Where did you lose it?" : "Where did you find it?"}
            error={errors["place"]}
          >
            <input
              className={fieldClass}
              value={form.place}
              maxLength={120}
              onChange={(e) => set("place", e.target.value)}
              placeholder="Library, 2nd floor"
            />
          </Field>

          <Field label="Date" error={errors["item_date"]}>
            <input
              type="date"
              className={fieldClass}
              value={form.item_date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("item_date", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Details (optional)" error={errors["description"]}>
          <textarea
            className={`${fieldClass} min-h-24 resize-y`}
            value={form.description}
            maxLength={500}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Colour, marks, what was inside…"
          />
        </Field>

        <Field label="Your name" error={errors["reporter_name"]}>
          <input
            className={fieldClass}
            value={form.reporter_name}
            maxLength={60}
            onChange={(e) => set("reporter_name", e.target.value)}
            placeholder="Ananya R"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email (optional)" error={errors["contact_email"]}>
            <input
              type="email"
              className={fieldClass}
              value={form.contact_email}
              maxLength={255}
              onChange={(e) => set("contact_email", e.target.value)}
              placeholder="you@campus.edu"
            />
          </Field>

          <Field
            label="WhatsApp number (optional)"
            error={errors["contact_whatsapp"]}
            hint="With country code, numbers only. Example: 919876543210"
          >
            <input
              inputMode="numeric"
              className={fieldClass}
              value={form.contact_whatsapp}
              maxLength={15}
              onChange={(e) =>
                set("contact_whatsapp", e.target.value.replace(/\D/g, ""))
              }
              placeholder="919876543210"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-pin transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          Post to the board
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </span>
      {children}
      {hint && !error ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}
