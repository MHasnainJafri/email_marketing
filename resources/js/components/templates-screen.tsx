"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Loader2,
  ImageIcon,
  Video,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTemplates } from "@/hooks/use-templates"
import { useToast } from "@/hooks/use-toast"
import type { Template } from "@/lib/api"

export default function TemplatesScreen() {
  const {
    templates,
    pagination,
    loading,
    error,
    currentPage,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch,
  } = useTemplates()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    subject: "",
    body: "",
  })

  const [uploading, setUploading] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const editEditorRef = useRef<HTMLDivElement>(null)
  const editImageInputRef = useRef<HTMLInputElement>(null)
  const editVideoInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && newTemplate.body === "") {
      editorRef.current.innerHTML = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Start writing your email template here...</p>
          <p>You can use variables like {{name}} and {{email}} for personalization.</p>
        </div>
      `
    }
  }, [isCreateDialogOpen])

  const handleCreateTemplate = async () => {
    if (!newTemplate.title || !newTemplate.subject) {
      toast({
        title: "Error",
        description: "Please fill in template title and subject.",
        variant: "destructive",
      })
      return
    }

    const bodyContent = editorRef.current?.innerHTML || ""
    if (!bodyContent.trim() || bodyContent === "<div><br></div>") {
      toast({
        title: "Error",
        description: "Please add content to your email template.",
        variant: "destructive",
      })
      return
    }

    try {
      await createTemplate({
        title: newTemplate.title,
        subject: newTemplate.subject,
        body: bodyContent, // This will contain the full HTML with uploaded image URLs
      })
      setNewTemplate({ title: "", subject: "", body: "" })
      if (editorRef.current) {
        editorRef.current.innerHTML = ""
      }
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleEditTemplate = async () => {
    if (!editingTemplate) return

    const bodyContent = editEditorRef.current?.innerHTML || editingTemplate.body

    try {
      await updateTemplate(editingTemplate.id, {
        title: editingTemplate.title,
        subject: editingTemplate.subject,
        body: bodyContent, // This will contain the full HTML with any new uploaded image URLs
      })
      setEditingTemplate(null)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(id)
      } catch (error) {
        // Error is handled in the hook
      }
    }
  }

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      await duplicateTemplate(template)
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

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("http://localhost:8000/api/store-file", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Upload failed: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    return data.file_url
  }

  const insertAtCursor = (html: string, editorElement: HTMLDivElement) => {
    editorElement.focus()

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()

      const div = document.createElement("div")
      div.innerHTML = html
      const fragment = document.createDocumentFragment()

      while (div.firstChild) {
        fragment.appendChild(div.firstChild)
      }

      range.insertNode(fragment)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      // If no selection, append to end
      editorElement.innerHTML += html
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      const fileUrl = await uploadFile(file)

      const imgHtml = `
        <div style="margin: 15px 0; text-align: center;">
          <img src="${fileUrl}" alt="Email image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
        </div>
      `

      const targetEditor = isEdit ? editEditorRef.current : editorRef.current
      if (targetEditor) {
        insertAtCursor(imgHtml, targetEditor)
      }

      toast({
        title: "Image uploaded",
        description: "Image has been added to your template.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Clear the input
      event.target.value = ""
    }
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please select a video file.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      const fileUrl = await uploadFile(file)

      const videoHtml = `
        <div style="margin: 15px 0; text-align: center;">
          <video controls style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <source src="${fileUrl}" type="${file.type}">
            Your browser does not support the video tag.
          </video>
        </div>
      `

      const targetEditor = isEdit ? editEditorRef.current : editorRef.current
      if (targetEditor) {
        insertAtCursor(videoHtml, targetEditor)
      }

      toast({
        title: "Video uploaded",
        description: "Video has been added to your template.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Clear the input
      event.target.value = ""
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const ToolbarButton = ({
    onClick,
    children,
    title,
  }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} title={title} className="h-8 w-8 p-0">
      {children}
    </Button>
  )

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 mb-4">Error loading templates: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Create and manage your email templates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Email Template</DialogTitle>
              <DialogDescription>Create a new email template for your campaigns.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-title">Template Title</Label>
                  <Input
                    id="template-title"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    placeholder="Enter template title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-subject">Subject Line</Label>
                  <Input
                    id="template-subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Enter email subject"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Body (Rich Editor)</Label>
                <div className="border rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
                    <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
                      <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
                      <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCommand("underline")} title="Underline">
                      <Underline className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <ToolbarButton onClick={() => execCommand("justifyLeft")} title="Align Left">
                      <AlignLeft className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCommand("justifyCenter")} title="Align Center">
                      <AlignCenter className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCommand("justifyRight")} title="Align Right">
                      <AlignRight className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
                      <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="Numbered List">
                      <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={(e) => handleImageUpload(e, false)}
                      accept="image/*"
                      className="hidden"
                    />
                    <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Insert Image">
                      <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>

                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={(e) => handleVideoUpload(e, false)}
                      accept="video/*"
                      className="hidden"
                    />
                    <ToolbarButton onClick={() => videoInputRef.current?.click()} title="Insert Video">
                      <Video className="h-4 w-4" />
                    </ToolbarButton>

                    {uploading && (
                      <div className="flex items-center gap-2 ml-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Editor */}
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-[300px] p-4 focus:outline-none bg-white"
                    style={{
                      lineHeight: "1.6",
                      fontFamily: "Arial, sans-serif",
                    }}
                    suppressContentEditableWarning={true}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Use the toolbar to format text and add media. Variables like {`{{name}}`}, {`{{email}}`} will be
                  replaced with actual values when sending.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription className="mt-1">Created: {formatDate(template.created_at)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Subject:</p>
                      <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Content Preview:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {stripHtml(template.body).substring(0, 100)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated:</p>
                      <p className="text-sm text-gray-600">{formatDate(template.updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                              <Label>Email Preview:</Label>
                              <div
                                className="mt-1 p-4 bg-white border rounded max-h-96 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                              />
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Template</DialogTitle>
                          <DialogDescription>Make changes to your email template.</DialogDescription>
                        </DialogHeader>
                        {editingTemplate && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Template Title</Label>
                                <Input
                                  value={editingTemplate.title}
                                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Subject Line</Label>
                                <Input
                                  value={editingTemplate.subject}
                                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Email Body (Rich Editor)</Label>
                              <div className="border rounded-lg overflow-hidden">
                                {/* Edit Toolbar */}
                                <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
                                  <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
                                    <Bold className="h-4 w-4" />
                                  </ToolbarButton>
                                  <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
                                    <Italic className="h-4 w-4" />
                                  </ToolbarButton>
                                  <ToolbarButton onClick={() => execCommand("underline")} title="Underline">
                                    <Underline className="h-4 w-4" />
                                  </ToolbarButton>

                                  <div className="w-px h-6 bg-gray-300 mx-1" />

                                  <input
                                    type="file"
                                    ref={editImageInputRef}
                                    onChange={(e) => handleImageUpload(e, true)}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                  <ToolbarButton
                                    onClick={() => editImageInputRef.current?.click()}
                                    title="Insert Image"
                                  >
                                    <ImageIcon className="h-4 w-4" />
                                  </ToolbarButton>

                                  <input
                                    type="file"
                                    ref={editVideoInputRef}
                                    onChange={(e) => handleVideoUpload(e, true)}
                                    accept="video/*"
                                    className="hidden"
                                  />
                                  <ToolbarButton
                                    onClick={() => editVideoInputRef.current?.click()}
                                    title="Insert Video"
                                  >
                                    <Video className="h-4 w-4" />
                                  </ToolbarButton>
                                </div>

                                <div
                                  ref={editEditorRef}
                                  contentEditable
                                  className="min-h-[300px] p-4 focus:outline-none bg-white"
                                  style={{
                                    lineHeight: "1.6",
                                    fontFamily: "Arial, sans-serif",
                                  }}
                                  dangerouslySetInnerHTML={{ __html: editingTemplate.body }}
                                  suppressContentEditableWarning={true}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditTemplate}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
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
          {templates.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first email template.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
