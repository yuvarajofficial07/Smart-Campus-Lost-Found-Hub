import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = [
  "Electronics",
  "Documents",
  "Keys",
  "Clothing",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Item = {
  id: string;
  type: "lost" | "found";
  item_name: string;
  category: Category;
  description: string | null;
  place: string;
  item_date: string;
  reporter_name: string;
  contact_email: string | null;
  contact_whatsapp: string | null;
  image_url: string | null;
  is_resolved: boolean;
  created_at: string;
};

export const itemSchema = z
  .object({
    type: z.enum(["lost", "found"]),
    item_name: z.string().trim().min(2, "Please write the item name").max(80),
    category: z.enum(CATEGORIES),
    description: z.string().trim().max(500).optional(),
    place: z.string().trim().min(2, "Please write the place").max(120),
    item_date: z.string().min(1, "Please pick a date"),
    reporter_name: z.string().trim().min(2, "Please write your name").max(60),
    contact_email: z
      .string()
      .trim()
      .max(255)
      .email("Please write a correct email")
      .optional()
      .or(z.literal("")),
    contact_whatsapp: z
      .string()
      .trim()
      .max(20)
      .regex(/^[0-9]{8,15}$/, "Only numbers, with country code")
      .optional()
      .or(z.literal("")),
  })
  .refine((v) => !!v.contact_email || !!v.contact_whatsapp, {
    message: "Give at least one contact: email or WhatsApp",
    path: ["contact_whatsapp"],
  });

export type ItemForm = z.infer<typeof itemSchema>;

export const itemsQuery = {
  queryKey: ["items"],
  queryFn: async (): Promise<Item[]> => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Item[];
  },
};

export function whatsappLink(item: Item) {
  if (!item.contact_whatsapp) return null;
  const text =
    item.type === "found"
      ? `Hi ${item.reporter_name}, I think the "${item.item_name}" you found at ${item.place} is mine. Can we meet?`
      : `Hi ${item.reporter_name}, I think I found your "${item.item_name}". Can we meet?`;
  return `https://wa.me/${item.contact_whatsapp}?text=${encodeURIComponent(text)}`;
}

export function mailLink(item: Item) {
  if (!item.contact_email) return null;
  const subject = `Campus Lost & Found: ${item.item_name}`;
  const body =
    item.type === "found"
      ? `Hi ${item.reporter_name},\n\nI think the "${item.item_name}" you found at ${item.place} is mine.\n\nThanks!`
      : `Hi ${item.reporter_name},\n\nI think I found your "${item.item_name}".\n\nThanks!`;
  return `mailto:${encodeURIComponent(item.contact_email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
