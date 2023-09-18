import { getInfo } from "ytdl-core";

console.log("Starting ytdl server...");

const ytRegex =
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

const CorsResponse = (body: any, options?: ResponseInit) => {
  const res = new Response(body, options);

  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  return res;
};

Bun.serve({
  port: 1338,
  fetch: async (req) => {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) return CorsResponse("No url has been given", { status: 400 });
    if (!ytRegex.test(url)) return CorsResponse("Bad yt link", { status: 400 });

    try {
      const info = await getInfo(url, {
        requestOptions: {
          headers: {
            cookie: Bun.env.YT_COOKIES,
            "x-youtube-identity-token": Bun.env.YT_TOKEN,
          },
        },
      });

      const videoInfo = info.formats.filter(
        ({ audioQuality }) => audioQuality
      )[0];

      return CorsResponse(
        JSON.stringify({
          url: videoInfo.url,
          name: info.videoDetails.title,
        })
      );
    } catch {
      return CorsResponse("ytdl-core error", { status: 400 });
    }
  },
});
