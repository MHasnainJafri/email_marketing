"use client"

import { useState } from "react"
import { Send, Package, Mail, Loader2, CheckCircle, Eye, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSendToBatch } from "@/hooks/use-send-to-batch"
import type { Template } from "@/lib/api"

export default function SendToBatchScreen() {
  const { batches, templates, loading, sending, error, sendEmailToBatch, refetch } = useSendToBatch()

  const [selectedBatch, setSelectedBatch] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const handleSendCampaign = async () => {
    if (!selectedBatch || !selectedTemplate) {
      alert("Please select both a batch and an email template")
      return
    }

    try {
      await sendEmailToBatch(selectedBatch, selectedTemplate)
      // Reset form after successful send
      setSelectedBatch(null)
      setSelectedTemplate(null)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const selectedBatchData = batches.find((batch) => batch.id === selectedBatch)
  const selectedTemplateData = templates.find((template) => template.id === selectedTemplate)

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading batches and templates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Send Mail to Batch</h1>
          <p className="text-gray-600">Select a batch and email template to send a campaign</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-cyan-500" />
                Campaign Setup
              </CardTitle>
              <CardDescription>Configure your email campaign settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Batch</Label>
                <Select
                  value={selectedBatch?.toString() || ""}
                  onValueChange={(value) => setSelectedBatch(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{batch.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {batch.contacts_count || 0} users
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email Template</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedTemplate?.toString() || ""}
                    onValueChange={(value) => setSelectedTemplate(Number(value))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a template" />
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
                          onClick={() => setPreviewTemplate(selectedTemplateData || null)}
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

              {selectedBatchData && selectedTemplateData && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ready to send "{selectedTemplateData.title}" to {selectedBatchData.contacts_count || 0} users in "
                    {selectedBatchData.name}" batch.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSendCampaign}
                disabled={!selectedBatch || !selectedTemplate || sending}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Campaign...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Batch Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-cyan-500" />
                  Available Batches
                </CardTitle>
                <CardDescription>Select from your imported user batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {batches.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No batches available</h3>
                      <p className="mt-1 text-sm text-gray-500">Import some user batches first.</p>
                    </div>
                  ) : (
                    batches.map((batch) => (
                      <div
                        key={batch.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedBatch === batch.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedBatch(batch.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{batch.name}</h4>
                            <p className="text-sm text-gray-600">Created: {formatDate(batch.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-cyan-600">{batch.contacts_count || 0}</div>
                            <div className="text-xs text-gray-500">users</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-500" />
                  Email Templates
                </CardTitle>
                <CardDescription>Choose from your created templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {templates.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No templates available</h3>
                      <p className="mt-1 text-sm text-gray-500">Create some email templates first.</p>
                    </div>
                  ) : (
                    templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate === template.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <h4 className="font-medium">{template.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
