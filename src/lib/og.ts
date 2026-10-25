// Barlow Condensed to match the site; falls back to the default font if Google Fonts can't be reached.
export async function condensed(): Promise<ArrayBuffer | undefined> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : undefined;
  } catch {
    return undefined;
  }
}
