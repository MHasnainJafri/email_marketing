"use client"

import { useState, useEffect, useCallback } from "react"
import { templatesApi, type Template, type TemplatesResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [pagination, setPagination] = useState<Omit<TemplatesResponse, "data"> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const fetchTemplates = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        setError(null)
        const response = await templatesApi.getTemplates(page)

        setTemplates(response.data)
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
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch templates"
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

  const createTemplate = async (template: Omit<Template, "id" | "created_at" | "updated_at">) => {
    try {
      await templatesApi.createTemplate(template)
      toast({
        title: "Success",
        description: "Template created successfully",
      })
      // Refresh the current page
      await fetchTemplates(currentPage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create template"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateTemplate = async (id: number, template: Partial<Omit<Template, "id" | "created_at" | "updated_at">>) => {
    try {
      await templatesApi.updateTemplate(id, template)
      toast({
        title: "Success",
        description: "Template updated successfully",
      })
      // Refresh the current page
      await fetchTemplates(currentPage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update template"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteTemplate = async (id: number) => {
    try {
      await templatesApi.deleteTemplate(id)
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
      // Refresh the current page
      await fetchTemplates(currentPage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete template"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const duplicateTemplate = async (template: Template) => {
    try {
      const duplicatedTemplate = {
        title: `${template.title} (Copy)`,
        subject: template.subject,
        body: template.body,
      }
      await templatesApi.createTemplate(duplicatedTemplate)
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      })
      // Refresh the current page
      await fetchTemplates(currentPage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to duplicate template"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && pagination && page <= pagination.last_page) {
      fetchTemplates(page)
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

  useEffect(() => {
    fetchTemplates(1)
  }, [fetchTemplates])

  return {
    templates,
    pagination,
    loading,
    error,
    currentPage,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch: () => fetchTemplates(currentPage),
  }
}
