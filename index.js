const express = require("express");
const app = express();
const fs = require("fs").promises;
const port = process.env.PORT || 3000;

function modifyGltf(gltfJson, newTextureUrl) {
  gltfJson.images[0].uri = newTextureUrl;
  return gltfJson;
}

app.get("/gltf", async (req, res) => {
  const newTextureUrl = req.query.textureUrl;
  if (!newTextureUrl) {
    return res.status(400).send("Texture URL is required");
  }

  try {
    const data = await fs.readFile("./assets/card.gltf", "utf8");
    const gltfJson = JSON.parse(data);

    console.log("Gltf file: ", gltfJson);

    const modifiedGltfJson = modifyGltf(gltfJson, newTextureUrl);

    res.json(modifiedGltfJson);
  } catch (error) {
    console.error("Error reading or modifying GLTF file:", error);
    res.status(500).send("Internal Server Error: ", error);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
