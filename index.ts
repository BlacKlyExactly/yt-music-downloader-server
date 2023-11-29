import express from "express";
import ytdl from "ytdl-core";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const PORT = process.env.PORT || "1339";

const app = express();

app.use(express.json());
app.use(cors());

const getVideoTitle = async (url: string) => {
  try {
    const {
      videoDetails: { title },
    } = await ytdl.getBasicInfo(url as string);

    return title;
  } catch {
    return;
  }
};

app.get("/", async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).send({ error: "No url" });

  const name =
    (await getVideoTitle(url as string)) ||
    crypto.randomBytes(3).toString("hex");

  res.header("Content-Disposition", `attachment; filename="${name}.mp3"`);

  ytdl(url as string, {
    filter: "audioonly",
    requestOptions: {
      headers: {
        "x-youtube-identity-token": process.env.YT_TOKEN,
      },
    },
  }).pipe(res);
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
