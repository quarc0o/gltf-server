const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
