import axios from "axios"

const API_BASE_URL = "/api"

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

// Update the Contact interface to include batch_id
export interface Contact {
  id: number
  name: string | null
  email: string
  batch_id?: number
  created_at: string
  updated_at: string
}

// Update the Batch interface to include contacts directly
export interface Batch {
  id: number
  name: string
  file_path: string
  created_at: string
  updated_at: string
  contacts_count?: number // This comes from the list API
  contacts?: Contact[] // This comes from the detail API
  campaigns: BatchCampaign[]
}

export interface Template {
  id: number
  title: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: number
  name: string
  email_template_id: number
  total_contacts: number
  emails_sent: number
  status: string
  created_at: string
  updated_at: string
  template: {
    id: number
    title: string
  }
}

export interface BatchCampaign {
  id: number
  batch_id: number
  email_template_id: number
  created_at: string
  updated_at: string
  email_template: {
    id: number
    title: string
    subject: string
    body: string
    created_at: string
    updated_at: string
  }
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface ContactsResponse {
  current_page: number
  data: Contact[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface BatchesResponse {
  current_page: number
  data: Batch[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface TemplatesResponse {
  current_page: number
  data: Template[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface CampaignsResponse {
  current_page: number
  data: Campaign[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface ImportResponse {
  success: boolean
  message: string
  imported_count?: number
  failed_count?: number
  errors?: string[]
}

export interface CreateCampaignRequest {
  template_id: number
  name: string
  contact_ids: number[] // Empty array means send to all users
}

export interface CreateCampaignResponse {
  success: boolean
  message: string
  campaign_id?: number
}

// Add new interface for batch campaign request
export interface CreateBatchCampaignRequest {
  template_id: number
}

export const contactsApi = {
  // Get contacts with pagination and search
  getContacts: async (page = 1, search = ""): Promise<ContactsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
    })

    if (search.trim()) {
      params.append("search", search.trim())
    }

    const response = await apiClient.get(`/contacts?${params.toString()}`)
    return response.data
  },

  // Get all contacts (for campaign selection) - without pagination
  getAllContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get("/contacts?per_page=1000") // Get large number
    return response.data.data || []
  },

  // Import contacts from file
  importContacts: async (file: File): Promise<ImportResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await axios.post(`${API_BASE_URL}/contacts/import`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Create contact
  createContact: async (contact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
    const response = await apiClient.post("/contacts", contact)
    return response.data
  },

  // Update contact
  updateContact: async (id: number, contact: Partial<Omit<Contact, "id" | "created_at" | "updated_at">>) => {
    const response = await apiClient.put(`/contacts/${id}`, contact)
    return response.data
  },

  // Delete contact
  deleteContact: async (id: number) => {
    const response = await apiClient.delete(`/contacts/${id}`)
    return response.data
  },
}

// Add getBatchDetail method to batchesApi
export const batchesApi = {
  // Get batches with pagination and search
  getBatches: async (page = 1, search = ""): Promise<BatchesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
    })

    if (search.trim()) {
      params.append("search", search.trim())
    }

    const response = await apiClient.get(`/batches?${params.toString()}`)
    return response.data
  },

  // Get single batch with contacts and campaigns
  getBatchDetail: async (batchId: number): Promise<Batch> => {
    const response = await apiClient.get(`/batches/${batchId}`)
    return response.data
  },

  // Import batch from file - Updated to use correct endpoint
  importBatch: async (file: File, batchName: string): Promise<ImportResponse> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("batch_name", batchName)

    const response = await axios.post(`${API_BASE_URL}/contacts/import`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Get batch contacts (deprecated - use getBatchDetail instead)
  getBatchContacts: async (batchId: number): Promise<Contact[]> => {
    const response = await apiClient.get(`/batches/${batchId}/contacts`)
    return response.data
  },

  // Delete batch
  deleteBatch: async (id: number) => {
    const response = await apiClient.delete(`/batches/${id}`)
    return response.data
  },
}

export const templatesApi = {
  // Get templates with pagination
  getTemplates: async (page = 1): Promise<TemplatesResponse> => {
    const response = await apiClient.get(`/templates?page=${page}`)
    return response.data
  },

  // Get all templates (for campaign selection) - without pagination
  getAllTemplates: async (): Promise<Template[]> => {
    const response = await apiClient.get("/templates?per_page=1000") // Get large number
    return response.data.data || []
  },

  // Create template
  createTemplate: async (template: Omit<Template, "id" | "created_at" | "updated_at">): Promise<Template> => {
    const response = await apiClient.post("/templates", template)
    return response.data
  },

  // Update template
  updateTemplate: async (id: number, template: Partial<Omit<Template, "id" | "created_at" | "updated_at">>) => {
    const response = await apiClient.put(`/templates/${id}`, template)
    return response.data
  },

  // Delete template
  deleteTemplate: async (id: number) => {
    const response = await apiClient.delete(`/templates/${id}`)
    return response.data
  },

  // Get single template
  getTemplate: async (id: number): Promise<Template> => {
    const response = await apiClient.get(`/templates/${id}`)
    return response.data
  },
}

export const campaignsApi = {
  // Get campaigns with pagination
  getCampaigns: async (page = 1): Promise<CampaignsResponse> => {
    const response = await apiClient.get(`/campaigns?page=${page}`)
    return response.data
  },

  // Create campaign (send email)
  createCampaign: async (request: CreateCampaignRequest): Promise<CreateCampaignResponse> => {
    const response = await apiClient.post("/send-email", request)
    return response.data
  },

  // Send email to batch - New method
  sendEmailToBatch: async (batchId: number, request: CreateBatchCampaignRequest): Promise<CreateCampaignResponse> => {
    const response = await apiClient.post(`/send-email/batch/${batchId}`, request)
    return response.data
  },
}
