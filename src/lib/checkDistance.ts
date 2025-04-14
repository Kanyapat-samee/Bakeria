/* // lib/checkDistance.ts
export async function isWithin20Km(origin: string, destination: string): Promise<boolean> {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  
    const response = await fetch(url)
    const data = await response.json()
  
    const meters = data?.rows?.[0]?.elements?.[0]?.distance?.value
    if (!meters) return false
  
    const km = meters / 1000
    return km <= 20
  }   */