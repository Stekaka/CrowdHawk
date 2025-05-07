
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { compressImage } from '../components/compressImage.js'


export default function Home() {
  const [image, setImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const compressed = await compressImage(file)
      setImage(compressed)
      setPreviewUrl(URL.createObjectURL(compressed))
      setResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!image) return

    setLoading(true)
    setResult(null)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64String })
      })

      const data = await response.json()
      setResult(data)
      setLoading(false)
    }
    reader.readAsDataURL(image)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>CrowdHawk</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 style={{ fontSize: '2rem', color: '#00c2ff' }}>
        Crowd<span style={{ color: '#1f2937' }}>Hawk</span>
      </h1>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      {previewUrl && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Förhandsvisning:</h3>
          <Image src={previewUrl} alt="Uploaded Image" width={600} height={400} />
          <button 
            onClick={handleAnalyze} 
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1f2937',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}>
            Analysera bild
          </button>
        </div>
      )}

      {loading && <p>Analyserar bild...</p>}

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Resultat:</h3>
          <p><strong>YOLOv8:</strong> {result.yolo_result?.prediction?.length || 'okänt'} personer</p>
          <p><strong>CSRNet (simulerat):</strong> {result.csrnet_estimate} personer</p>
          <p><strong>Slutlig uppskattning:</strong> {result.combined_estimate} personer</p>
        </div>
      )}
    </div>
  )
}
