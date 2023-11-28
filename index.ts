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

app.get("/", (req, res) => {
  const { url } = req.query;

  const name = crypto.randomBytes(3).toString("hex");

  if (!url) return res.status(400).send({ error: "No url" });

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
