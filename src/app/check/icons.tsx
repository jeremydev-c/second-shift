// Line icons for the household checker, drawn to match the site's stroke weight.
const paths = {
  laptop: "M5 6h14v9H5zM3 18h18",
  desktop: "M4 4h16v11H4zM9 20h6M12 15v5",
  monitor: "M3 5h18v11H3zM8 20h8M12 16v4",
  keyboard: "M3 7h18v10H3zM6 10h1M9 10h1M12 10h1M15 10h1M18 10h0M7 14h10",
  headset: "M5 14v-2a7 7 0 0 1 14 0v2M5 14h3v5H5zM16 14h3v5h-3z",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  plug: "M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4",
  printer: "M7 9V3h10v6M5 9h14v7H5zM7 14h10v7H7z",
  tv: "M3 6h18v11H3zM8 3l4 3 4-3M8 21h8",
  crt: "M4 4h16v13H4zM7 7h10v7H7zM9 21h6M12 17v4",
  phone: "M8 2h8v20H8zM11 18h2",
  pan: "M3 11h14v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM17 12h4",
} as const;

export type IconName = keyof typeof paths;

export function ItemIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
