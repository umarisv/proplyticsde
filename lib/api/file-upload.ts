import { createClient } from "@/lib/supabase/client"
import type { UploadedFile, FileCategory, AIAnalysisResult } from "@/lib/types"

const BUCKET_NAME = "bewertung-files"

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadFileToStorage(
  file: File,
  bewertungId: string,
  category: FileCategory
): Promise<UploadedFile | null> {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${bewertungId}/${category}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
  
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      return null
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)
    
    return {
      id: data.path,
      name: file.name,
      type: file.type,
      size: file.size,
      category,
      url: urlData.publicUrl,
      thumbnailUrl: file.type.startsWith('image/') ? urlData.publicUrl : undefined,
    }
  } catch (err) {
    console.error('Upload failed:', err)
    return null
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFileFromStorage(filePath: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])
  
  return !error
}

/**
 * Lists all files for a specific bewertung
 */
export async function listFilesForBewertung(bewertungId: string): Promise<UploadedFile[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(bewertungId, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    })
  
  if (error || !data) {
    return []
  }
  
  return data.map(file => {
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${bewertungId}/${file.name}`)
    
    return {
      id: file.id || file.name,
      name: file.name,
      type: file.metadata?.mimetype || 'application/octet-stream',
      size: file.metadata?.size || 0,
      category: detectCategoryFromPath(file.name),
      url: urlData.publicUrl,
    }
  })
}

/**
 * Detects the file category from the file path
 */
function detectCategoryFromPath(path: string): FileCategory {
  const lowerPath = path.toLowerCase()
  if (lowerPath.includes('/aussen/')) return 'aussen'
  if (lowerPath.includes('/innen/')) return 'innen'
  if (lowerPath.includes('/grundriss/')) return 'grundriss'
  if (lowerPath.includes('/energie/')) return 'energie'
  if (lowerPath.includes('/expose/')) return 'expose'
  return 'sonstiges'
}

/**
 * Converts a File to base64 for AI analysis
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Analyzes an image using GPT-4 Vision API
 * This calls a server-side API route to protect the API key
 */
export async function analyzeImageWithAI(
  imageBase64: string,
  category: FileCategory
): Promise<AIAnalysisResult | null> {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        category,
      }),
    })
    
    if (!response.ok) {
      console.error('AI analysis failed:', response.statusText)
      return null
    }
    
    const result = await response.json()
    return result as AIAnalysisResult
  } catch (err) {
    console.error('AI analysis error:', err)
    return null
  }
}

/**
 * Batch upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bewertungId: string,
  detectCategory: (file: File) => FileCategory
): Promise<UploadedFile[]> {
  const results: UploadedFile[] = []
  
  for (const file of files) {
    const category = detectCategory(file)
    const uploaded = await uploadFileToStorage(file, bewertungId, category)
    if (uploaded) {
      results.push(uploaded)
    }
  }
  
  return results
}
