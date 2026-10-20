export type HomeLinkItem = {
  title: string;
  href: string;
  meta?: string;
  badge?: string;
};

export type HomeSection = {
  id: string;
  title: string;
  items: HomeLinkItem[];
};

export type HomeProjectCard = {
  title: string;
  href: string;
  image: string;
};

export const homeHero = {
  name: "محمد رستاقی",
  tagline: "آموزش نویسندگی، تفکر و توسعه فردی",
  portrait: "/img/me.png",
  pattern: "/01.jpg",
  avatar: "/img/me.png",
} as const;

export type HomeNavItem = {
  label: string;
  href: string;
  pin?: boolean;
  dropdown?: boolean;
};

export const homeNav: HomeNavItem[] = [
  { label: "خانه", href: "/" },
  { label: "تازه‌ها", href: "#", pin: true },
  { label: "نویسنده‌ساز", href: "#", dropdown: true },
  { label: "اصول نویسندگی", href: "#" },
  { label: "روزنویسی", href: "#" },
  { label: "دانلود", href: "#" },
  { label: "مدرسه نویسندگی", href: "#" },
  { label: "تلگرام", href: "#" },
  { label: "من", href: "#" },
  { label: "گزارش نیک", href: "#" },
  { label: "بایگانی", href: "#" },
];
