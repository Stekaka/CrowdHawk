export async function compressImage(file, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('Window not defined (SSR)')

    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(newFile)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
      img.src = event.target.result
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
