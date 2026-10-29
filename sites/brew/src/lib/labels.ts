import type { Lang } from "@twin/kit/i18n";

// Category codes are stored in frontmatter; labels are shown per language.
// Array order is the display order of the category filter (kept by hand).
export const NEWS_CATEGORIES = ["event", "column", "opening", "notice"] as const;
export const CAFE_CATEGORIES = ["roaster", "kissaten", "kominka", "chain"] as const;

const LABELS: Record<string, Record<Lang, string>> = {
  event: { ja: "イベント", en: "Events" },
  column: { ja: "コラム", en: "Columns" },
  opening: { ja: "新店情報", en: "New Openings" },
  notice: { ja: "お知らせ", en: "Notices" },
  roaster: { ja: "自家焙煎", en: "Roasters" },
  kissaten: { ja: "喫茶店", en: "Kissaten" },
  chain: { ja: "県内チェーン", en: "Regional Chains" },
  kominka: { ja: "古民家カフェ", en: "Traditional Houses" },
};

export function label(code: string, lang: Lang): string {
  return LABELS[code]?.[lang] ?? code;
}

export const UI = {
  ja: {
    siteName: "Brew Tsukuba",
    tagline: "つくばのカフェとコーヒーの話題",
    home: "ホーム",
    news: "お知らせ",
    cafes: "カフェガイド",
    about: "このサイトについて",
    contact: "お問合せ",
    policy: "サイトポリシー",
    search: "検索",
    searchPlaceholder: "サイト内検索",
    more: "一覧を見る",
    all: "すべて",
    siblingHeading: "BeanDaCs の新着",
    siblingEmpty: "現在、表示できる新着情報はありません。",
    siblingLink: "BeanDaCs（コーヒー豆カタログ）へ",
    switchTo: "English",
    disclaimer: "これは静的サイト構成の実験用デモです。お知らせはすべてサイト構築用の架空の記事です。カフェガイドは実在の店舗を公開情報をもとに紹介していますが、各店舗とは関係がなく、内容の正確さは保証しません。",
    readMore: "続きを読む",
    eventDate: "開催日",
    updated: "更新日",
    website: "公式サイト",
    backToList: "一覧へ戻る",
    notTranslated: "この記事には英語版がありません。",
  },
  en: {
    siteName: "Brew Tsukuba",
    tagline: "Cafés and coffee talk from Tsukuba",
    home: "Home",
    news: "News",
    cafes: "Café Guide",
    about: "About",
    contact: "Contact",
    policy: "Site Policy",
    search: "Search",
    searchPlaceholder: "Search this site",
    more: "See all",
    all: "All",
    siblingHeading: "Latest from BeanDaCs",
    siblingEmpty: "No headlines are available right now.",
    siblingLink: "Visit BeanDaCs, the coffee bean catalog",
    switchTo: "日本語",
    disclaimer: "This is a demo for a static-site experiment. All news items are fictional, written to build this site. The café guide introduces real cafés based on public information, with no affiliation and no guarantee of accuracy.",
    readMore: "Read more",
    eventDate: "Event date",
    updated: "Updated",
    website: "Website",
    backToList: "Back to list",
    notTranslated: "This article is available in Japanese only.",
  },
} satisfies Record<Lang, Record<string, string>>;
