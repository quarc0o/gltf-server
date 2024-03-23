const express = require("express");
require("dotenv").config();
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function modifyGltf(gltfJson, newTextureUrl) {
  gltfJson.images[0].uri = newTextureUrl;
  return gltfJson;
}

app.get("/gltf", async (req, res) => {
  const newTextureUrl = req.query.textureUrl;
  const gltfUrl = req.query.gltfUrl;

  if (!newTextureUrl || !gltfUrl) {
    return res.status(400).send("Texture URL and GLTF URL are required");
  }

  try {
    const response = await axios.get(gltfUrl, {
      responseType: "json",
    });

    const gltfJson = response.data;
    const modifiedGltfJson = modifyGltf(gltfJson, newTextureUrl);
    const modifiedGltfString = JSON.stringify(modifiedGltfJson);

    const buffer = Buffer.from(modifiedGltfString, "utf8");
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading or modifying GLTF file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/create-gltf", async (req, res) => {
  const newTextureUrl = req.query.textureUrl;
  const gltfUrl = req.query.gltfUrl;
  const giftId = req.query.giftId;

  if (!newTextureUrl || !gltfUrl) {
    return res.status(400).send("Texture URL and GLTF URL are required");
  }

  try {
    const response = await axios.get(gltfUrl, { responseType: "arraybuffer" });
    const gltfJson = JSON.parse(response.data);
    const modifiedGltfJson = modifyGltf(gltfJson, newTextureUrl);
    const modifiedGltfString = JSON.stringify(modifiedGltfJson);

    const fileName = `${giftId}/greeting-card.gltf`;
    const { error: uploadError } = await supabase.storage
      .from("gifts")
      .upload(fileName, modifiedGltfString, {
        contentType: "model/gltf+json",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    res.send({ message: "GLTF file uploaded successfully", path: fileName });
  } catch (error) {
    console.error("Error processing GLTF file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
