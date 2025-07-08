"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Eye, Copy, Save, Loader2 } from "lucide-react"
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
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  ImageIcon,
  Link,
} from "lucide-react"
import { useTemplates } from "@/hooks/use-templates"
import type { Template } from "@/lib/api"

export default function TemplatesScreen() {
  const {
    templates,
    pagination,
    loading,
    creating,
    updating,
    deleting,
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

  const handleCreateTemplate = async () => {
    if (!newTemplate.title || !newTemplate.subject || !newTemplate.body) {
      alert("Please fill in all fields")
      return
    }

    try {
      await createTemplate(newTemplate)
      setNewTemplate({ title: "", subject: "", body: "" })
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleEditTemplate = async () => {
    if (!editingTemplate) return

    try {
      await updateTemplate(editingTemplate.id, {
        title: editingTemplate.title,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
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

  const insertVariable = (variable: string, isEdit = false) => {
    const variableHtml = `<span style="background-color: #e0f2fe; padding: 2px 4px; border-radius: 3px; font-weight: bold;">{{${variable}}}</span>`

    if (isEdit) {
      document.execCommand("insertHTML", false, variableHtml)
    } else {
      document.execCommand("insertHTML", false, variableHtml)
    }
  }

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
            <Button disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Label>Email Body</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" variant="outline" size="sm" onClick={() => insertVariable("name")}>
                      Add {"{{ name }}"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => insertVariable("email")}>
                      Add {"{{ email }}"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => insertVariable("company")}>
                      Add {"{{ company }}"}
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("bold")}
                        className="h-8 w-8 p-0"
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("italic")}
                        className="h-8 w-8 p-0"
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("underline")}
                        className="h-8 w-8 p-0"
                        title="Underline"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          document.execCommand("formatBlock", false, "<h1>")
                          // Apply inline styles for better visibility
                          const selection = window.getSelection()
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0)
                            const element = range.commonAncestorContainer.parentElement
                            if (element && element.tagName === "H1") {
                              element.style.fontSize = "2em"
                              element.style.fontWeight = "bold"
                              element.style.marginBottom = "0.5em"
                            }
                          }
                        }}
                        className="h-8 px-2"
                        title="Heading 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          document.execCommand("formatBlock", false, "<h2>")
                          // Apply inline styles for better visibility
                          const selection = window.getSelection()
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0)
                            const element = range.commonAncestorContainer.parentElement
                            if (element && element.tagName === "H2") {
                              element.style.fontSize = "1.5em"
                              element.style.fontWeight = "bold"
                              element.style.marginBottom = "0.4em"
                            }
                          }
                        }}
                        className="h-8 px-2"
                        title="Heading 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("justifyLeft")}
                        className="h-8 w-8 p-0"
                        title="Align Left"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("justifyCenter")}
                        className="h-8 w-8 p-0"
                        title="Align Center"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("justifyRight")}
                        className="h-8 w-8 p-0"
                        title="Align Right"
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("insertUnorderedList")}
                        className="h-8 w-8 p-0"
                        title="Bullet List"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.execCommand("insertOrderedList")}
                        className="h-8 w-8 p-0"
                        title="Numbered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              try {
                                const formData = new FormData()
                                formData.append("file", file)

                                const response = await fetch("/api/store-file", {
                                  method: "POST",
                                  body: formData,
                                })

                                if (response.ok) {
                                  const data = await response.json()
                                  const imageUrl = data.url
                                  document.execCommand("insertImage", false, imageUrl)
                                } else {
                                  alert("Failed to upload image")
                                }
                              } catch (error) {
                                console.error("Upload error:", error)
                                alert("Error uploading image")
                              }
                            }
                          }
                          input.click()
                        }}
                        className="h-8 w-8 p-0"
                        title="Insert Image"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = prompt("Enter link URL:")
                          if (url) document.execCommand("createLink", false, url)
                        }}
                        className="h-8 w-8 p-0"
                        title="Insert Link"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Rich Text Editor */}
                    <div
                      contentEditable
                      className="min-h-[300px] p-4 focus:outline-none bg-white"
                      style={{
                        lineHeight: "1.6",
                        fontFamily: "Arial, sans-serif",
                      }}
                      onInput={(e) => {
                        const content = e.currentTarget.innerHTML
                        setNewTemplate({ ...newTemplate, body: content })
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          newTemplate.body ||
                          "<p>Write your email content here...</p><p>Use the toolbar above to format your text, add images, and create beautiful emails!</p>",
                      }}
                      suppressContentEditableWarning={true}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Use variables like {"{{ name }}"}, {"{{ email }}"}, {"{{ company }}"} for personalization. They will
                  be replaced with actual values when sending.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Template
                  </>
                )}
              </Button>
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
                      <div
                        className="text-sm text-gray-600 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: template.body.replace(/<[^>]*>/g, "").substring(0, 100) + "...",
                        }}
                      />
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
                              <Label>Email Content:</Label>
                              <div
                                className="mt-1 p-4 bg-white border rounded max-h-64 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                              />
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingTemplate({ ...template })}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                              <Label>Email Body</Label>
                              <div className="space-y-2">
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertVariable("name", true)}
                                  >
                                    Add {"{{ name }}"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertVariable("email", true)}
                                  >
                                    Add {"{{ email }}"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertVariable("company", true)}
                                  >
                                    Add {"{{ company }}"}
                                  </Button>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                  {/* Edit Toolbar - Same as create toolbar */}
                                  <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("bold")}
                                      className="h-8 w-8 p-0"
                                      title="Bold"
                                    >
                                      <Bold className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("italic")}
                                      className="h-8 w-8 p-0"
                                      title="Italic"
                                    >
                                      <Italic className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("underline")}
                                      className="h-8 w-8 p-0"
                                      title="Underline"
                                    >
                                      <Underline className="h-4 w-4" />
                                    </Button>

                                    <div className="w-px h-6 bg-gray-300 mx-1" />

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        document.execCommand("formatBlock", false, "<h1>")
                                        const selection = window.getSelection()
                                        if (selection && selection.rangeCount > 0) {
                                          const range = selection.getRangeAt(0)
                                          const element = range.commonAncestorContainer.parentElement
                                          if (element && element.tagName === "H1") {
                                            element.style.fontSize = "2em"
                                            element.style.fontWeight = "bold"
                                            element.style.marginBottom = "0.5em"
                                          }
                                        }
                                      }}
                                      className="h-8 px-2"
                                      title="Heading 1"
                                    >
                                      <Heading1 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        document.execCommand("formatBlock", false, "<h2>")
                                        const selection = window.getSelection()
                                        if (selection && selection.rangeCount > 0) {
                                          const range = selection.getRangeAt(0)
                                          const element = range.commonAncestorContainer.parentElement
                                          if (element && element.tagName === "H2") {
                                            element.style.fontSize = "1.5em"
                                            element.style.fontWeight = "bold"
                                            element.style.marginBottom = "0.4em"
                                          }
                                        }
                                      }}
                                      className="h-8 px-2"
                                      title="Heading 2"
                                    >
                                      <Heading2 className="h-4 w-4" />
                                    </Button>

                                    <div className="w-px h-6 bg-gray-300 mx-1" />

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("justifyLeft")}
                                      className="h-8 w-8 p-0"
                                      title="Align Left"
                                    >
                                      <AlignLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("justifyCenter")}
                                      className="h-8 w-8 p-0"
                                      title="Align Center"
                                    >
                                      <AlignCenter className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("justifyRight")}
                                      className="h-8 w-8 p-0"
                                      title="Align Right"
                                    >
                                      <AlignRight className="h-4 w-4" />
                                    </Button>

                                    <div className="w-px h-6 bg-gray-300 mx-1" />

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("insertUnorderedList")}
                                      className="h-8 w-8 p-0"
                                      title="Bullet List"
                                    >
                                      <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => document.execCommand("insertOrderedList")}
                                      className="h-8 w-8 p-0"
                                      title="Numbered List"
                                    >
                                      <ListOrdered className="h-4 w-4" />
                                    </Button>

                                    <div className="w-px h-6 bg-gray-300 mx-1" />

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const input = document.createElement("input")
                                        input.type = "file"
                                        input.accept = "image/*"
                                        input.onchange = async (e) => {
                                          const file = (e.target as HTMLInputElement).files?.[0]
                                          if (file) {
                                            try {
                                              const formData = new FormData()
                                              formData.append("file", file)

                                              const response = await fetch("/api/store-file", {
                                                method: "POST",
                                                body: formData,
                                              })

                                              if (response.ok) {
                                                const data = await response.json()
                                                const imageUrl = data.url
                                                document.execCommand("insertImage", false, imageUrl)
                                              } else {
                                                alert("Failed to upload image")
                                              }
                                            } catch (error) {
                                              console.error("Upload error:", error)
                                              alert("Error uploading image")
                                            }
                                          }
                                        }
                                        input.click()
                                      }}
                                      className="h-8 w-8 p-0"
                                      title="Insert Image"
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const url = prompt("Enter link URL:")
                                        if (url) document.execCommand("createLink", false, url)
                                      }}
                                      className="h-8 w-8 p-0"
                                      title="Insert Link"
                                    >
                                      <Link className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Rich Text Editor for Edit */}
                                  <div
                                    contentEditable
                                    className="min-h-[300px] p-4 focus:outline-none bg-white"
                                    style={{
                                      lineHeight: "1.6",
                                      fontFamily: "Arial, sans-serif",
                                    }}
                                    onInput={(e) => {
                                      const content = e.currentTarget.innerHTML
                                      setEditingTemplate({ ...editingTemplate, body: content })
                                    }}
                                    dangerouslySetInnerHTML={{ __html: editingTemplate.body }}
                                    suppressContentEditableWarning={true}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditTemplate} disabled={updating}>
                            {updating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                      disabled={creating}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deleting}
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
