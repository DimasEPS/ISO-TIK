const deriveFileName = (fileUrl, fallback = "dokumen") => {
  if (fileUrl && typeof fileUrl === "string") {
    try {
      const url = new URL(fileUrl, window.location.origin)
      const pathname = url.pathname ?? ""
      const segments = pathname.split("/")
      const name = segments.pop() || segments.pop()
      if (name) {
        return decodeURIComponent(name)
      }
    } catch {
      const parts = fileUrl.split("/")
      const name = parts.pop() || parts.pop()
      if (name) return name
    }
  }
  return fallback
}

export const downloadDocumentFile = async ({ fileUrl, fileName }) => {
  if (!fileUrl) {
    throw new Error("File dokumen tidak ditemukan.")
  }

  try {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("iso_tik_token")
        : null

    const response = await fetch(fileUrl, {
      credentials: "include",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    })

    if (!response.ok) {
      throw new Error("Gagal mengunduh file dokumen.")
    }

    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = fileName?.trim() || deriveFileName(fileUrl)
    anchor.style.display = "none"
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    window.URL.revokeObjectURL(objectUrl)
  } catch (fetchError) {
    console.error("Gagal mengambil file secara langsung, fallback ke navigasi biasa.", fetchError)
    const anchor = document.createElement("a")
    anchor.href = fileUrl
    anchor.download = fileName?.trim() || deriveFileName(fileUrl)
    anchor.style.display = "none"
    anchor.rel = "noopener noreferrer"
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }
}
