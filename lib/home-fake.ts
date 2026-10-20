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
