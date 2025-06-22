"use client"

import { useState, useEffect, useCallback } from "react"
import {
  contactsApi,
  templatesApi,
  campaignsApi,
  type Contact,
  type Template,
  type Campaign,
  type CampaignsResponse,
  type CreateCampaignRequest,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [pagination, setPagination] = useState<Omit<CampaignsResponse, "data"> | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const fetchCampaigns = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        setError(null)
        const response = await campaignsApi.getCampaigns(page)

        setCampaigns(response.data)
        setPagination({
          current_page: response.current_page,
          first_page_url: response.first_page_url,
          from: response.from,
          last_page: response.last_page,
          last_page_url: response.last_page_url,
          links: response.links,
          next_page_url: response.next_page_url,
          path: response.path,
          per_page: response.per_page,
          prev_page_url: response.prev_page_url,
          to: response.to,
          total: response.total,
        })
        setCurrentPage(page)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch campaigns"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  // Load contacts and templates for campaign creation
  useEffect(() => {
    const loadData = async () => {
      try {
        const [contactsData, templatesData] = await Promise.all([
          contactsApi.getAllContacts(),
          templatesApi.getAllTemplates(),
        ])
        setContacts(contactsData)
        setTemplates(templatesData)
      } catch (err) {
        console.error("Failed to load contacts/templates:", err)
      }
    }

    loadData()
  }, [])

  // Load campaigns
  useEffect(() => {
    fetchCampaigns(1)
  }, [fetchCampaigns])

  const createCampaign = async (request: CreateCampaignRequest) => {
    try {
      setCreating(true)
      const response = await campaignsApi.createCampaign(request)

      if (response.success) {
        toast({
          title: "Campaign Created",
          description: response.message || "Campaign has been created and is being processed.",
        })

        // Refresh campaigns list
        await fetchCampaigns(currentPage)
      } else {
        toast({
          title: "Campaign Failed",
          description: response.message || "Failed to create campaign",
          variant: "destructive",
        })
      }

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create campaign"
      toast({
        title: "Campaign Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setCreating(false)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && pagination && page <= pagination.last_page) {
      fetchCampaigns(page)
    }
  }

  const goToNextPage = () => {
    if (pagination?.next_page_url) {
      goToPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (pagination?.prev_page_url) {
      goToPage(currentPage - 1)
    }
  }

  return {
    campaigns,
    pagination,
    contacts,
    templates,
    loading,
    creating,
    error,
    currentPage,
    fetchCampaigns,
    createCampaign,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch: () => fetchCampaigns(currentPage),
  }
}
