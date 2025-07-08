"use client"

import { useState, useEffect, useCallback } from "react"
import { batchesApi, type Batch, type BatchesResponse, type ImportResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useBatches() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [pagination, setPagination] = useState<Omit<BatchesResponse, "data"> | null>(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatchDetail, setSelectedBatchDetail] = useState<Batch | null>(null)
  const [loadingBatchDetail, setLoadingBatchDetail] = useState(false)
  const { toast } = useToast()

  const fetchBatches = useCallback(
    async (page = 1, search = "") => {
      try {
        setLoading(true)
        setError(null)
        const response = await batchesApi.getBatches(page, search)

        setBatches(response.data)
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
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch batches"
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

  // Import batch from file
  const importBatch = async (file: File, batchName: string): Promise<ImportResponse> => {
    try {
      setImporting(true)
      const response = await batchesApi.importBatch(file, batchName)

      if (response.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported batch "${batchName}" with ${response.imported_count || 0} contacts${
            response.failed_count ? `. ${response.failed_count} failed.` : ""
          }`,
        })

        // Refresh batches after successful import
        await fetchBatches(1, searchTerm)
      } else {
        toast({
          title: "Import Failed",
          description: response.message || "Failed to import batch",
          variant: "destructive",
        })
      }

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to import batch"
      toast({
        title: "Import Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setImporting(false)
    }
  }

  // Get batch detail with contacts and campaigns
  const fetchBatchDetail = async (batchId: number) => {
    try {
      setLoadingBatchDetail(true)
      const batchDetail = await batchesApi.getBatchDetail(batchId)
      setSelectedBatchDetail(batchDetail)
      return batchDetail
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch batch details"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoadingBatchDetail(false)
    }
  }

  const deleteBatch = async (id: number) => {
    try {
      await batchesApi.deleteBatch(id)
      toast({
        title: "Success",
        description: "Batch deleted successfully",
      })
      // Refresh the current page
      await fetchBatches(currentPage, searchTerm)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete batch"
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
      fetchBatches(page, searchTerm)
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

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
    fetchBatches(1, term)
  }

  const clearSearch = () => {
    setSearchTerm("")
    fetchBatches(1, "")
  }

  // Initial load
  useEffect(() => {
    fetchBatches(1, "")
  }, [fetchBatches])

  return {
    batches,
    pagination,
    loading,
    importing,
    error,
    currentPage,
    searchTerm,
    selectedBatchDetail,
    loadingBatchDetail,
    fetchBatches,
    importBatch,
    fetchBatchDetail,
    deleteBatch,
    goToPage,
    goToNextPage,
    goToPrevPage,
    handleSearch,
    clearSearch,
    refetch: () => fetchBatches(currentPage, searchTerm),
    setSelectedBatchDetail,
  }
}

export function setSelectedBatchDetail(batch: Batch | null) {
  // This function is intentionally left blank.
  // It's only here to satisfy the type checker and prevent runtime errors.
  // The actual state update happens within the useBatches hook.
}
