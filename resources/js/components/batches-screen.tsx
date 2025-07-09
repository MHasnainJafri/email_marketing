"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Upload,
  Users,
  Mail,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  Send,
  Search,
  X,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBatches } from "@/hooks/use-batches"
import type { Batch } from "@/lib/api"
import { setSelectedBatchDetail } from "@/hooks/use-batches" // Import setSelectedBatchDetail
import { templatesApi, campaignsApi } from "@/lib/api"
import { toast } from "sonner"

export default function BatchesScreen() {
  const {
    batches,
    pagination,
    loading,
    importing,
    error,
    currentPage,
    searchTerm,
    selectedBatchDetail,
    loadingBatchDetail,
    importBatch,
    fetchBatchDetail,
    deleteBatch,
    goToPage,
    goToNextPage,
    goToPrevPage,
    handleSearch,
    clearSearch,
    refetch,
  } = useBatches()

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [viewMode, setViewMode] = useState<"users" | "campaigns">("users")
  const [batchName, setBatchName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [selectedTemplateForCampaign, setSelectedTemplateForCampaign] = useState<number | null>(null)
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()
      if (fileExtension === "csv" || fileExtension === "xlsx" || fileExtension === "xls") {
        setSelectedFile(file)
        setImportResult(null)
      } else {
        alert("Please select a CSV or Excel file")
        setSelectedFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !batchName.trim()) {
      alert("Please select a file and enter a batch name")
      return
    }

    try {
      const result = await importBatch(selectedFile, batchName.trim())
      setImportResult(result)

      if (result.success) {
        // Close dialog after successful import
        setTimeout(() => {
          setIsImportDialogOpen(false)
          resetImportDialog()
        }, 3000)
      }
    } catch (error) {
      // Error is handled in the hook
      setImportResult({
        success: false,
        message: "Failed to import batch. Please try again.",
      })
    }
  }

  const resetImportDialog = () => {
    setSelectedFile(null)
    setImportResult(null)
    setBatchName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleViewBatch = async (batch: Batch) => {
    setSelectedBatch(batch)
    await fetchBatchDetail(batch.id)
  }

  const handleDeleteBatch = async (id: number) => {
    if (confirm("Are you sure you want to delete this batch? This action cannot be undone.")) {
      try {
        await deleteBatch(id)
      } catch (error) {
        // Error is handled in the hook
      }
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

  const getStatusColor = (contactsCount: number) => {
    return contactsCount > 0 ? "bg-green-500" : "bg-gray-500"
  }

  const loadTemplates = async () => {
    try {
      const templatesData = await templatesApi.getAllTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error("Failed to load templates:", error)
    }
  }

  const handleSendCampaign = async () => {
    if (!selectedTemplateForCampaign || !selectedBatch) {
      alert("Please select a template")
      return
    }

    try {
      setSendingCampaign(true)
      const response = await campaignsApi.sendEmailToBatch(selectedBatch.id, {
        template_id: selectedTemplateForCampaign,
      })

      if (response.success) {
        toast({
          title: "Campaign Sent",
          description: response.message || "Campaign has been sent successfully.",
        })
        setIsCampaignModalOpen(false)
        setSelectedTemplateForCampaign(null)
        // Refresh batch detail to show new campaign
        await fetchBatchDetail(selectedBatch.id)
      }
    } catch (error) {
      // Error handled in API
    } finally {
      setSendingCampaign(false)
    }
  }

  useEffect(() => {
    if (isCampaignModalOpen) {
      loadTemplates()
    }
  }, [isCampaignModalOpen])

  if (selectedBatch && selectedBatchDetail) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBatch(null)
                setSelectedBatchDetail(null) // Use setSelectedBatchDetail
              }}
            >
              ← Back to Batches
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedBatchDetail.name}</h1>
              <p className="text-gray-600">
                Created on {formatDate(selectedBatchDetail.created_at)} • {selectedBatchDetail.contacts?.length || 0}{" "}
                users
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "users" ? "default" : "outline"}
              onClick={() => setViewMode("users")}
              size="sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Users ({selectedBatchDetail.contacts?.length || 0})
            </Button>
            <Button
              variant={viewMode === "campaigns" ? "default" : "outline"}
              onClick={() => setViewMode("campaigns")}
              size="sm"
            >
              <Mail className="mr-2 h-4 w-4" />
              Campaigns ({selectedBatchDetail.campaigns.length})
            </Button>
            <Button
              onClick={() => setIsCampaignModalOpen(true)}
              disabled={!selectedBatchDetail.contacts || selectedBatchDetail.contacts.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Campaign
            </Button>
          </div>
        </div>
        <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Campaign to Batch</DialogTitle>
              <DialogDescription>
                Send an email campaign to all {selectedBatchDetail.contacts?.length || 0} users in "
                {selectedBatchDetail.name}" batch.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Email Template</Label>
                <Select
                  value={selectedTemplateForCampaign?.toString() || ""}
                  onValueChange={(value) => setSelectedTemplateForCampaign(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        <div>
                          <div className="font-medium">{template.title}</div>
                          <div className="text-sm text-gray-500">{template.subject}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplateForCampaign && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    This campaign will be sent to {selectedBatchDetail.contacts?.length || 0} users in this batch.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCampaignModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendCampaign} disabled={!selectedTemplateForCampaign || sendingCampaign}>
                {sendingCampaign ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="bg-white rounded-lg shadow">
          {viewMode === "users" ? (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Batch Users</h2>
                <p className="text-gray-600">Users imported in this batch</p>
              </div>
              {loadingBatchDetail ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading contacts...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Imported At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBatchDetail.contacts?.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name || "N/A"}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{formatDate(contact.created_at)}</TableCell>
                      </TableRow>
                    )) || []}
                  </TableBody>
                </Table>
              )}
              {(!selectedBatchDetail.contacts || selectedBatchDetail.contacts.length === 0) && !loadingBatchDetail && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
                  <p className="mt-1 text-sm text-gray-500">This batch doesn't have any contacts yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Campaign History</h2>
                <p className="text-gray-600">Campaigns sent to this batch</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign ID</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBatchDetail.campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">#{campaign.id}</TableCell>
                      <TableCell>{campaign.email_template.title}</TableCell>
                      <TableCell>{campaign.email_template.subject}</TableCell>
                      <TableCell>{formatDate(campaign.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {selectedBatchDetail.campaigns.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns sent</h3>
                  <p className="mt-1 text-sm text-gray-500">No campaigns have been sent to this batch yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 mb-4">Error loading batches: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Batches</h1>
          <p className="text-gray-600">Manage your user import batches and track campaigns</p>
        </div>
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
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Import New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import User Batch</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file and give your batch a name to organize your users.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!importResult && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="batch-name">Batch Name</Label>
                    <Input
                      id="batch-name"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      placeholder="e.g., Q1 2024 Customers"
                    />
                  </div>

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
                    <span className="text-sm">Creating batch "{batchName}"...</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}

              {importResult && (
                <div className="space-y-3">
                  <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
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
                    <div className="text-center p-4 bg-green-100 rounded">
                      <div className="font-semibold text-green-800 text-lg">{importResult.imported_count || 0}</div>
                      <div className="text-green-600">Users imported to "{batchName}"</div>
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
                  <Button onClick={handleImport} disabled={!selectedFile || !batchName.trim() || importing}>
                    {importing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Batch
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-6 w-6 p-0" onClick={clearSearch}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading batches...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-cyan-500" />
                        {batch.name}
                      </CardTitle>
                      <CardDescription className="mt-1">Created: {formatDate(batch.created_at)}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(batch.contacts_count)} text-white`}>
                      {batch.contacts_count > 0 ? "Active" : "Empty"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{batch.contacts_count}</div>
                        <div className="text-sm text-blue-800">Total Users</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{batch.campaigns.length}</div>
                        <div className="text-sm text-green-800">Campaigns Sent</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated:</p>
                      <p className="text-sm text-gray-600">{formatDate(batch.updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleViewBatch(batch)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={batch.contacts_count === 0}>
                      <Send className="h-3 w-3 mr-1" />
                      Send Campaign
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBatch(batch.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={!pagination.prev_page_url}>
                  Previous
                </Button>
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
                <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!pagination.next_page_url}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {batches.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "No batches match your search criteria." : "Import your first user batch to get started."}
              </p>
              <Button onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import New Batch
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
