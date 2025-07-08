"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Eye, Copy, Save } from "lucide-react"
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

// Mock data for templates
const mockTemplates = [
  {
    id: 1,
    title: "Welcome Email",
    subject: "Welcome to our platform!",
    body: `Hi {{name}},

Welcome to our amazing platform! We're excited to have you on board.

Here's what you can do next:
- Complete your profile
- Explore our features
- Contact support if you need help

Best regards,
The Team

---
You can unsubscribe at any time by clicking here.`,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Product Update",
    subject: "New features available now",
    body: `Hello {{name}},

We've just released some exciting new features that we think you'll love!

New Features:
- Enhanced dashboard
- Better reporting
- Mobile app improvements

Check them out at: https://example.com/features

Thanks,
Product Team`,
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-01-12T09:15:00Z",
  },
  {
    id: 3,
    title: "Monthly Newsletter",
    subject: "Your monthly update - January 2024",
    body: `Dear {{name}},

Here's what happened this month:

📈 Company Updates:
- 50% growth in user base
- New office opening
- Team expansion

🚀 Product News:
- Version 2.0 released
- Bug fixes and improvements
- New integrations available

Stay tuned for more updates!

Best,
Newsletter Team`,
    created_at: "2024-01-01T12:00:00Z",
    updated_at: "2024-01-01T12:00:00Z",
  },
]

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    subject: "",
    body: "",
  })

  const handleCreateTemplate = () => {
    if (!newTemplate.title || !newTemplate.subject || !newTemplate.body) {
      alert("Please fill in all fields")
      return
    }

    const template = {
      id: Date.now(),
      ...newTemplate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setTemplates([template, ...templates])
    setNewTemplate({ title: "", subject: "", body: "" })
    setIsCreateDialogOpen(false)
    alert("Template created successfully!")
  }

  const handleEditTemplate = () => {
    if (!editingTemplate) return

    setTemplates(
      templates.map((t) =>
        t.id === editingTemplate.id ? { ...editingTemplate, updated_at: new Date().toISOString() } : t,
      ),
    )
    setEditingTemplate(null)
    alert("Template updated successfully!")
  }

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(templates.filter((t) => t.id !== id))
      alert("Template deleted successfully!")
    }
  }

  const handleDuplicateTemplate = (template: any) => {
    const duplicated = {
      ...template,
      id: Date.now(),
      title: `${template.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTemplates([duplicated, ...templates])
    alert("Template duplicated successfully!")
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

                                const response = await fetch("/api/upload-image", {
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
              <Button onClick={handleCreateTemplate}>
                <Save className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                  <p className="text-sm text-gray-600 line-clamp-3">{template.body.substring(0, 100)}...</p>
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
                          <div className="mt-1 p-4 bg-white border rounded max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm">{previewTemplate.body}</pre>
                          </div>
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
                              {/* Edit Toolbar */}
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

                                          const response = await fetch("/api/upload-image", {
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
                      <Button onClick={handleEditTemplate}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
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

      {/* Empty State */}
      {templates.length === 0 && (
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
    </div>
  )
}
