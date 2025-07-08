"use client"

import { useState, useEffect, useCallback } from "react"
import {
  batchesApi,
  templatesApi,
  campaignsApi,
  type Batch,
  type Template,
  type CreateBatchCampaignRequest,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useSendToBatch() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch batches and templates in parallel
      const [batchesResponse, templatesResponse] = await Promise.all([
        batchesApi.getBatches(1, ""), // Get first page of batches
        templatesApi.getAllTemplates(),
      ])

      setBatches(batchesResponse.data)
      setTemplates(templatesResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const sendEmailToBatch = async (batchId: number, templateId: number) => {
    try {
      setSending(true)

      const request: CreateBatchCampaignRequest = {
        template_id: templateId,
      }

      const response = await campaignsApi.sendEmailToBatch(batchId, request)

      if (response.success) {
        toast({
          title: "Campaign Sent",
          description: response.message || "Email campaign has been sent to the batch successfully.",
        })
      } else {
        toast({
          title: "Campaign Failed",
          description: response.message || "Failed to send campaign to batch",
          variant: "destructive",
        })
      }

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send campaign"
      toast({
        title: "Campaign Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setSending(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    batches,
    templates,
    loading,
    sending,
    error,
    sendEmailToBatch,
    refetch: fetchData,
  }
}
