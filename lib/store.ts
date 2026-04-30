export const STORE = {
  name: "Green Life Cannabis",
  tagline: "Wenatchee's Premier Cannabis Dispensary",
  address: {
    street: "3012 Center Road Ste A",
    city: "Wenatchee",
    state: "WA",
    zip: "98801",
    full: "3012 Center Road Ste A, Wenatchee, WA 98801",
  },
  phone: "(509) 663-9980",
  phoneTel: "+15096639980",
  email: "info@greenlifecannabis.com",
  website: "https://www.greenlifecannabis.com",
  geo: { lat: 47.4116, lng: -120.3108 },
  googleMapsUrl: "https://maps.google.com/?q=3012+Center+Road+Ste+A+Wenatchee+WA+98801",
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2716.0!2d-120.3108!3d47.4116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI0JzQyLjAiTiAxMjDCsDE4JzM4LjkiVw!5e0!3m2!1sen!2sus!4v1",
  hours: [
    { day: "Monday",    open: "8:00 AM", close: "9:00 PM" },
    { day: "Tuesday",   open: "8:00 AM", close: "9:00 PM" },
    { day: "Wednesday", open: "8:00 AM", close: "9:00 PM" },
    { day: "Thursday",  open: "8:00 AM", close: "9:00 PM" },
    { day: "Friday",    open: "8:00 AM", close: "10:00 PM" },
    { day: "Saturday",  open: "8:00 AM", close: "10:00 PM" },
    { day: "Sunday",    open: "8:00 AM", close: "9:00 PM" },
  ],
  iheartjaneStoreId: 5294,
  social: {
    instagram: "https://www.instagram.com/greenlifewenatchee",
    facebook: "https://www.facebook.com/greenlifecannabis",
  },
} as const;

export function isOpenNow(): boolean {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const hours = STORE.hours.find((h) => h.day === day);
  if (!hours) return false;
  const toMin = (t: string) => {
    const [time, ampm] = t.split(" ");
    const [h, m] = time.split(":").map(Number);
    return (ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h) * 60 + m;
  };
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= toMin(hours.open) && cur < toMin(hours.close);
}
