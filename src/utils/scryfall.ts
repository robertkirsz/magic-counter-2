interface ScryfallCardRaw {
  id: string
  name: string
  type_line: string
  color_identity?: string[]
  colors?: string[]
  card_faces?: Array<{ image_uris?: { art_crop?: string } }>
  image_uris?: { art_crop?: string }
}

interface ScryfallError {
  object: 'error'
  code: string
  status: number
  warnings?: string[]
  details: string
}

export interface CommanderData {
  id: string
  name: string
  type: string
  colors: ManaColor[]
  image: string
}

// Rate limiting: 50-100ms delay between requests (10 requests per second)
let lastRequestTime = 0
const MIN_REQUEST_DELAY = 100 // 100ms delay

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const ensureRateLimit = async () => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
    await delay(MIN_REQUEST_DELAY - timeSinceLastRequest)
  }

  lastRequestTime = Date.now()
}

const makeScryfallRequest = async (url: string): Promise<ScryfallCardRaw | { data: ScryfallCardRaw[] }> => {
  await ensureRateLimit()

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Magic Counter 2 (https://github.com/robertkirsz/magic-counter-2)',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate'
    }
  })

  if (response.status === 429) {
    console.warn('Rate limit exceeded. Please wait before making more requests.')
    throw new Error('Rate limit exceeded')
  }

  if (!response.ok) {
    const errorData: ScryfallError = await response.json()
    console.warn(`Scryfall API error: ${errorData.status} ${errorData.details}`)
    throw new Error(`API Error: ${errorData.details}`)
  }

  return response.json() as Promise<ScryfallCardRaw | { data: ScryfallCardRaw[] }>
}

export const fetchCommanderSuggestions = async (query: string): Promise<ScryfallCard[]> => {
  if (query.length < 2) {
    return []
  }

  try {
    const data = (await makeScryfallRequest(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`${query} is:commander`)}&unique=cards`
    )) as { data: ScryfallCardRaw[] }

    // Only keep properties that exist in ScryfallCard type
    const scryfallCards: ScryfallCard[] = (data.data || []).map((card: ScryfallCardRaw) => ({
      id: card.id,
      name: card.name,
      type: card.type_line,
      colors: card.color_identity || card.colors || [],
      image: card.card_faces?.[0]?.image_uris?.art_crop || card.image_uris?.art_crop || null
    }))

    return scryfallCards
  } catch (error) {
    console.error('Error fetching commander suggestions:', error)
    return []
  }
}

export const fetchCardByName = async (cardName: string): Promise<ScryfallCard | null> => {
  try {
    const card = (await makeScryfallRequest(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
    )) as ScryfallCardRaw

    return {
      id: card.id,
      name: card.name,
      type: card.type_line,
      colors: card.color_identity || card.colors || [],
      image: card.card_faces?.[0]?.image_uris?.art_crop || card.image_uris?.art_crop || null
    }
  } catch (error) {
    console.error('Error fetching card by name:', error)
    return null
  }
}

export const fetchRandomCommander = async (): Promise<ScryfallCard | null> => {
  try {
    const card = (await makeScryfallRequest('https://api.scryfall.com/cards/random?q=is:commander')) as ScryfallCardRaw

    return {
      id: card.id,
      name: card.name,
      type: card.type_line,
      colors: card.color_identity || card.colors || [],
      image: card.card_faces?.[0]?.image_uris?.art_crop || card.image_uris?.art_crop || null
    }
  } catch (error) {
    console.error('Error fetching random commander:', error)
    return null
  }
}
