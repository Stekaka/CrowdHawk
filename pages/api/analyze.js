
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
    // Skicka till YOLOv8 (valfritt, fortfarande placeholder om inte aktiverad)
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

    // Skicka till riktig crowd counting-modell
    const crowd_response = await replicate.run(
      "zaidalyafeai/crowd-counting:d56d4ed32c7ef2b2de40e7df86aa1e3f9f60d4190c204f39fbd5ddc75862f2d6",
      {
        input: {
          image: imageBase64,
        },
      }
    );

    const crowd_estimate = crowd_response?.count ?? null;

    res.status(200).json({
      yolo_result: yolo_response,
      csrnet_estimate: crowd_estimate,
      combined_estimate: crowd_estimate ?? "okänt",
    });
  } catch (error) {
    console.error("Fel i /api/analyze:", error);
    res.status(500).json({ error: "Något gick fel vid bildanalys." });
  }
}
