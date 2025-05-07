
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Endast POST tillåts' })
  }

  const replicateApiToken = process.env.REPLICATE_API_TOKEN
  if (!replicateApiToken) {
    return res.status(500).json({ message: 'Ingen Replicate API-nyckel' })
  }

  const { imageBase64 } = req.body

  try {
    // YOLOv8-anrop
    const yoloResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "4b7d69f7fc142c6e4d4d88ce9b8e51e3bfa3658ba02e75e2c10d77c7e4b3c43b",
        input: {
          image: imageBase64
        }
      })
    })

    const yoloData = await yoloResponse.json()

    // CSRNet-anrop (simulerat här)
    const csrnetEstimate = Math.floor(Math.random() * 50) + 250

    return res.status(200).json({
      yolo_result: yoloData,
      csrnet_estimate: csrnetEstimate,
      combined_estimate: Math.floor((csrnetEstimate + 275) / 2) // Förenklad för MVP
    })
  } catch (error) {
    return res.status(500).json({ message: 'Fel vid AI-analys', error: error.message })
  }
}
