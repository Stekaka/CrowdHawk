import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64 } = req.body;

  try {
    // YOLOv8 (valfritt, kan tas bort om du vill)
    const yolo_response = await replicate.run(
      "roboflow/yolov8:6f31d4f2c635f72b9575d6f1a218c65754efb9ff9c81f762c64e6f10348d65e6",
      {
        input: {
          image: imageBase64,
          confidence: 30,
          overlap: 30,
        },
      }
    );

    // Crowd Counting (på riktigt!)
    const crowd_response = await replicate.run(
      "zaidalyafeai/crowd-counting:d56d4ed32c7ef2b2de40e7df86aa1e3f9f60d4190c204f39fbd5ddc75862f2d6",
      {
        input: {
          image: imageBase64,
        },
      }
    );
console.log("Crowd response från Replicate:", JSON.stringify(crowd_response, null, 2));
    
    const crowd_estimate = crowd_response?.count ?? null;
    const heatmap_url = crowd_response?.heatmap ?? null;

    res.status(200).json({
      yolo_result: yolo_response,
      csrnet_estimate: crowd_estimate,
      heatmap_url,
      combined_estimate: crowd_estimate ?? "okänt",
    });
  } catch (error) {
    console.error("Fel i /api/analyze:", error);
    res.status(500).json({ error: "Något gick fel vid bildanalys." });
  }
}
