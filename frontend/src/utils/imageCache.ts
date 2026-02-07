class ImageCache {
  private cache: Map<string, string> = new Map()
  private maxSize: number = 20 // Maximum number of cached images

  generateKey(params: Record<string, any>): string {
    return JSON.stringify(params)
  }

  get(params: Record<string, any>): string | null {
    const key = this.generateKey(params)
    return this.cache.get(key) || null
  }

  set(params: Record<string, any>, imageUrl: string): void {
    const key = this.generateKey(params)

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      const oldUrl = this.cache.get(firstKey)
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl)
      }
      this.cache.delete(firstKey)
    }

    this.cache.set(key, imageUrl)
  }

  has(params: Record<string, any>): boolean {
    const key = this.generateKey(params)
    return this.cache.has(key)
  }

  clear(): void {
    // Revoke all object URLs before clearing
    this.cache.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    this.cache.clear()
  }
}

export const imageCache = new ImageCache()
