"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { contactsApi, type Contact, type ContactsResponse, type ImportResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState<Omit<ContactsResponse, "data"> | null>(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const { toast } = useToast()
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounce search term
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // 500ms delay

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm])

  const fetchContacts = useCallback(
    async (page = 1, search = "") => {
      try {
        setLoading(true)
        setError(null)
        const response = await contactsApi.getContacts(page, search)

        setContacts(response.data)
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
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch contacts"
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

  // Import contacts from file
  const importContacts = async (file: File): Promise<ImportResponse> => {
    try {
      setImporting(true)
      const response = await contactsApi.importContacts(file)

      if (response.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${response.imported_count || 0} contacts${
            response.failed_count ? `. ${response.failed_count} failed.` : ""
          }`,
        })

        // Refresh contacts after successful import
        await fetchContacts(1, debouncedSearchTerm)
      } else {
        toast({
          title: "Import Failed",
          description: response.message || "Failed to import contacts",
          variant: "destructive",
        })
      }

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to import contacts"
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

  // Fetch contacts when debounced search term changes
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when searching
    fetchContacts(1, debouncedSearchTerm)
  }, [debouncedSearchTerm, fetchContacts])

  // Initial load
  useEffect(() => {
    fetchContacts(1, "")
  }, [])

  const createContact = async (contact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
    try {
      await contactsApi.createContact(contact)
      toast({
        title: "Success",
        description: "Contact created successfully",
      })
      // Refresh the current page with current search
      await fetchContacts(currentPage, debouncedSearchTerm)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create contact"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateContact = async (id: number, contact: Partial<Omit<Contact, "id" | "created_at" | "updated_at">>) => {
    try {
      await contactsApi.updateContact(id, contact)
      toast({
        title: "Success",
        description: "Contact updated successfully",
      })
      // Refresh the current page with current search
      await fetchContacts(currentPage, debouncedSearchTerm)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update contact"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteContact = async (id: number) => {
    try {
      await contactsApi.deleteContact(id)
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      })
      // Refresh the current page with current search
      await fetchContacts(currentPage, debouncedSearchTerm)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete contact"
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
      fetchContacts(page, debouncedSearchTerm)
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
  }

  const clearSearch = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
  }

  return {
    contacts,
    pagination,
    loading,
    importing,
    error,
    currentPage,
    searchTerm,
    debouncedSearchTerm,
    fetchContacts,
    importContacts,
    createContact,
    updateContact,
    deleteContact,
    goToPage,
    goToNextPage,
    goToPrevPage,
    handleSearch,
    clearSearch,
    refetch: () => fetchContacts(currentPage, debouncedSearchTerm),
  }
}
