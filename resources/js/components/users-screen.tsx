"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Upload,
  Search,
  Copy,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useContacts } from "@/hooks/use-contacts"
import { useToast } from "@/hooks/use-toast"
import type { Contact } from "@/lib/api"

export default function UsersScreen() {
  const {
    contacts,
    pagination,
    loading,
    importing,
    error,
    currentPage,
    searchTerm,
    debouncedSearchTerm,
    importContacts,
    createContact,
    updateContact,
    deleteContact,
    goToPage,
    goToNextPage,
    goToPrevPage,
    handleSearch,
    clearSearch,
    refetch,
  } = useContacts()

  const [sortField, setSortField] = useState<keyof Contact | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState({ name: "", email: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    imported_count?: number
    failed_count?: number
    errors?: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Apply sorting to the contacts from API (which are already filtered server-side)
  const sortedContacts = [...contacts].sort((a, b) => {
    if (!sortField) return 0

    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === null && bValue === null) return 0
    if (aValue === null) return sortDirection === "asc" ? 1 : -1
    if (bValue === null) return sortDirection === "asc" ? -1 : 1

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension === "csv" || fileExtension === "xlsx" || fileExtension === "xls") {
        setSelectedFile(file)
        setImportResult(null)
      } else {
        toast({
          title: "Invalid file format",
          description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls).",
          variant: "destructive",
        })
        setSelectedFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await importContacts(selectedFile)
      setImportResult(result)

      if (result.success) {
        // Close dialog after successful import
        setTimeout(() => {
          setIsImportDialogOpen(false)
          setSelectedFile(null)
          setImportResult(null)
        }, 3000)
      }
    } catch (error) {
      // Error is handled in the hook
      setImportResult({
        success: false,
        message: "Failed to import contacts. Please try again.",
      })
    }
  }

  const resetImportDialog = () => {
    setSelectedFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const SearchSection = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Search:</span>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8 w-64"
        />
        {searchTerm && (
          <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-6 w-6 p-0" onClick={clearSearch}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {debouncedSearchTerm && (
        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Searching: "{debouncedSearchTerm}"</span>
      )}
    </div>
  )

  const handleExport = (type: string) => {
    toast({
      title: `Export ${type}`,
      description: `User data exported as ${type} format.`,
    })
  }

  const handleCreateContact = async () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await createContact(newContact)
      setNewContact({ name: "", email: "" })
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const SortIcon = ({ field }: { field: keyof Contact }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 mb-4">Error loading contacts: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
          <p className="text-gray-600">Manage your email subscribers</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>Add a new contact to your email list.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Enter contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateContact}>Add Contact</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isImportDialogOpen}
            onOpenChange={(open) => {
              setIsImportDialogOpen(open)
              if (!open) {
                resetImportDialog()
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gray-600 hover:bg-gray-700">
                <Upload className="mr-2 h-4 w-4" />
                Import Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Import Contacts</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file to import contacts. The file should contain columns for Name and Email.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {!importResult && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Select File</Label>
                      <input
                        id="file-upload"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".csv,.xlsx,.xls"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    {selectedFile && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>
                    )}

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Make sure your file has columns named "name" and "email". The first row should contain headers.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {importing && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Importing contacts...</span>
                    </div>
                    <Progress value={undefined} className="w-full" />
                  </div>
                )}

                {importResult && (
                  <div className="space-y-3">
                    <Alert
                      className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                    >
                      {importResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={importResult.success ? "text-green-800" : "text-red-800"}>
                        {importResult.message}
                      </AlertDescription>
                    </Alert>

                    {importResult.success && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-green-100 rounded">
                          <div className="font-semibold text-green-800">{importResult.imported_count || 0}</div>
                          <div className="text-green-600">Imported</div>
                        </div>
                        {importResult.failed_count && importResult.failed_count > 0 && (
                          <div className="text-center p-2 bg-red-100 rounded">
                            <div className="font-semibold text-red-800">{importResult.failed_count}</div>
                            <div className="text-red-600">Failed</div>
                          </div>
                        )}
                      </div>
                    )}

                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="max-h-32 overflow-y-auto">
                        <div className="text-sm font-medium text-red-800 mb-1">Errors:</div>
                        <ul className="text-xs text-red-600 space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                {!importResult && (
                  <>
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!selectedFile || importing}>
                      {importing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import
                        </>
                      )}
                    </Button>
                  </>
                )}
                {importResult && (
                  <Button onClick={() => setIsImportDialogOpen(false)} className="w-full">
                    Close
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">User Data</h2>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("copy")}>
                <Copy className="mr-1 h-3 w-3" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("CSV")}>
                <FileText className="mr-1 h-3 w-3" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("print")}>
                <Printer className="mr-1 h-3 w-3" />
                Print
              </Button>
            </div>

            <SearchSection />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading contacts...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("email")}>
                    <div className="flex items-center gap-1">
                      Email
                      <SortIcon field="email" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("created_at")}>
                    <div className="flex items-center gap-1">
                      Created At
                      <SortIcon field="created_at" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("updated_at")}>
                    <div className="flex items-center gap-1">
                      Updated At
                      <SortIcon field="updated_at" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name || "N/A"}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{formatDate(contact.created_at)}</TableCell>
                    <TableCell>{formatDate(contact.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {pagination && (
              <>
                Showing {pagination.from} to {pagination.to} of {pagination.total} entries (Page{" "}
                {pagination.current_page} of {pagination.last_page})
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={!pagination?.prev_page_url}>
              Previous
            </Button>
            {pagination && pagination.last_page > 1 && (
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!pagination?.next_page_url}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
