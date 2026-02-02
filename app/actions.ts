
'use server'

import { createClient } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const linkSchema = z.object({
  url: z.url({ message: '请输入有效的 URL' }),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  expiresAt: z.string().optional().nullable(),
})

export type LinkInput = z.infer<typeof linkSchema>

export async function createLink(data: LinkInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录' }
  }

  const rawData = {
    url: data.url,
    description: data.description,
    isPublic: data.isPublic ?? false,
    expiresAt: data.expiresAt || null,
  }

  const validatedFields = linkSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message || 'Invalid data' }
  }

  const { url, description, isPublic, expiresAt } = validatedFields.data

  // Retry mechanism for short_code collision
  const maxRetries = 3
  let lastError: { code?: string; message?: string } | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const shortCode = nanoid(6)

    const { error } = await supabase.from('links').insert({
      original_url: url,
      short_code: shortCode,
      user_id: user.id,
      description: description || null,
      is_public: isPublic,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    })

    if (!error) {
      revalidatePath('/dashboard')
      return { success: true }
    }

    lastError = error
    if (error.code !== '23505') {
      // Not a unique violation, return error immediately
      return { error: error.message }
    }
    // If it's a unique violation, continue to next attempt
  }

  // All retries failed
  return { error: lastError?.message || '生成短链失败，请稍后重试' }
}

export async function updateLink(linkId: string, data: LinkInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录' }
  }

  const rawData = {
    url: data.url,
    description: data.description,
    isPublic: data.isPublic,
    expiresAt: data.expiresAt || null,
  }

  const validatedFields = linkSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message || 'Invalid data' }
  }

  const { url, description, isPublic, expiresAt } = validatedFields.data

  const { error } = await supabase
    .from('links')
    .update({
      original_url: url,
      description: description || null,
      is_public: isPublic,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    })
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteLink(linkId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录' }
  }

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateLinkState(linkId: string, isPublic: boolean) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user) {
      return { error: '请先登录' }
    }
  
    const { error } = await supabase
      .from('links')
      .update({ is_public: isPublic })
      .eq('id', linkId)
      .eq('user_id', user.id)
  
    if (error) {
      return { error: error.message }
    }
  
    revalidatePath('/dashboard')
    return { success: true }
  }
