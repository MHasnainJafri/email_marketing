"use client"

import { useState } from "react"
import { Send, Calendar, CheckCircle, AlertCircle, Loader2, Plus, Eye, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useToast } from "@/hooks/use-toast"
import type { Template } from "@/lib/api"

export default function CampaignScreen() {
  const {
    campaigns,
    pagination,
    contacts,
    templates,
    loading,
    creating,
    error,
    currentPage,
    createCampaign,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch,
  } = useCampaigns()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [sendToAll, setSendToAll] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const { toast } = useToast()

  const handleCreateCampaign = async () => {
    if (!campaignName || !selectedTemplate) {
      toast({
        title: "Error",
        description: "Please fill in campaign name and select a template.",
        variant: "destructive",
      })
      return
    }

    if (!sendToAll && selectedContacts.length === 0) {
      toast({
        title: "Error",
        description: "Please select recipients or choose 'Send to All'.",
        variant: "destructive",
      })
      return
    }

    try {
      await createCampaign({
        template_id: selectedTemplate,
        name: campaignName,
        contact_ids: sendToAll ? [] : selectedContacts,
      })

      // Reset form
      setCampaignName("")
      setSelectedTemplate(null)
      setSelectedContacts([])
      setSendToAll(false)
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleContactSelection = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId])
    } else {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(contacts.map((contact) => contact.id))
    } else {
      setSelectedContacts([])
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
      case "sending":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "sent":
        return "bg-green-500"
      case "processing":
      case "sending":
        return "bg-blue-500"
      case "failed":
      case "error":
        return "bg-red-500"
      case "pending":
      case "queued":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
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

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 mb-4">Error loading campaigns: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Create and manage your email campaigns</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Email Campaign</DialogTitle>
              <DialogDescription>Create and send an email campaign to your subscribers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-template">Email Template</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedTemplate?.toString() || ""}
                      onValueChange={(value) => setSelectedTemplate(Number.parseInt(value))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewTemplate(templates.find((t) => t.id === selectedTemplate) || null)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{previewTemplate?.title}</DialogTitle>
                            <DialogDescription>Template Preview</DialogDescription>
                          </DialogHeader>
                          {previewTemplate && (
                            <div className="space-y-4">
                              <div>
                                <Label>Subject:</Label>
                                <p className="mt-1 p-2 bg-gray-50 rounded">{previewTemplate.subject}</p>
                              </div>
                              <div>
                                <Label>Content:</Label>
                                <div
                                  className="mt-1 p-4 bg-white border rounded max-h-64 overflow-y-auto"
                                  dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                                />
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Select Recipients</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-to-all"
                        checked={sendToAll}
                        onCheckedChange={(checked) => {
                          setSendToAll(checked as boolean)
                          if (checked) {
                            setSelectedContacts([])
                          }
                        }}
                      />
                      <Label htmlFor="send-to-all" className="text-sm font-medium">
                        Send to All Users ({contacts.length} contacts)
                      </Label>
                    </div>
                  </div>
                </div>

                {!sendToAll && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {selectedContacts.length} of {contacts.length} contacts selected
                      </span>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all-contacts"
                          checked={selectedContacts.length === contacts.length}
                          onCheckedChange={handleSelectAll}
                        />
                        <Label htmlFor="select-all-contacts" className="text-sm">
                          Select All
                        </Label>
                      </div>
                    </div>

                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      <div className="p-4 space-y-3">
                        {contacts.map((contact) => (
                          <div key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={`contact-${contact.id}`}
                              checked={selectedContacts.includes(contact.id)}
                              onCheckedChange={(checked) => handleContactSelection(contact.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{contact.name || "N/A"}</p>
                                  <p className="text-sm text-gray-600">{contact.email}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {sendToAll && (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      This campaign will be sent to all {contacts.length} contacts in your database.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading campaigns...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription className="mt-1">Template: {campaign.template.title}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Contacts:</p>
                        <p className="text-lg font-semibold text-blue-600">{campaign.total_contacts}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Emails Sent:</p>
                        <p className="text-lg font-semibold text-green-600">{campaign.emails_sent}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Created:</p>
                      <p className="text-sm text-gray-600">{formatDate(campaign.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated:</p>
                      <p className="text-sm text-gray-600">{formatDate(campaign.updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full text-center text-sm text-gray-500">Campaign ID: {campaign.id}</div>
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
          {campaigns.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first email campaign to get started.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
