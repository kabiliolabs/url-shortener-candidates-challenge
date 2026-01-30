import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigation, useActionData, useSubmit } from 'react-router'
import type { ShortenFormSchema } from '../lib/schemas'
import { shortenFormSchema } from '../lib/schemas'

export const useUrlShortener = () => {
  const submit = useSubmit()
  const navigation = useNavigation()
  const actionData = useActionData<{ shortenedUrl?: string; error?: string }>()
  const isSubmitting = navigation.state === 'submitting'
  const shortUrl = actionData?.shortenedUrl as string | null
  const serverError = actionData?.error as string | null

  const form = useForm<ShortenFormSchema>({
    resolver: zodResolver(shortenFormSchema),
    defaultValues: {
      url: '',
    },
  })

  const shorten = useCallback(
    (data: ShortenFormSchema) => {
      submit(data, { method: 'post' })
    },
    [submit]
  )

  const reset = useCallback(() => {
    form.reset()
  }, [form])

  useEffect(() => {
    if (shortUrl) {
      reset()
    }
  }, [shortUrl, reset])

  return {
    form,
    shorten: form.handleSubmit(shorten),
    isSubmitting,
    shortUrl,
    serverError,
    reset,
    fieldError: form.formState.errors.url?.message,
  }
}