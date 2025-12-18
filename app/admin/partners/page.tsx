"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Edit as Pencil,
  Trash2,
  Upload,
  X,
  Loader2,
  Eye,
  Image as ImageIcon
} from "lucide-react"
import Image from "next/image"

interface Partner {
  id: number
  partner_name: string
  image_url: string
  display_priority: number
  status: "Active" | "Inactive"
  created_at?: string
  updated_at?: string
}

import { getAllPartners, createPartner, updatePartner, deletePartner } from '@/services/partnerService'

export default function PartnersPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    partner_name: "",
    image_url: "",
    display_priority: 1,
    status: "Active" as "Active" | "Inactive"
  })

  // Fetch all partners
  const fetchPartners = async () => {
    setIsLoading(true)
    try {
      const data = await getAllPartners()
      setPartners(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching partners:', error)
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'partner')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, image_url: data.url }))
        setImagePreview(data.url)
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.partner_name.trim()) {
      toast({
        title: "Error",
        description: "Partner name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.image_url.trim()) {
      toast({
        title: "Error",
        description: "Partner image is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
        // Use service functions which handle auth and internal routes
      if (editingPartner) {
        await updatePartner(editingPartner.id, formData as any)
        toast({ title: 'Success', description: 'Partner updated successfully' })
      } else {
        await createPartner(formData as any)
        toast({ title: 'Success', description: 'Partner created successfully' })
      }

      // Reset and refresh
      resetForm()
      await fetchPartners()
    } catch (error) {
      console.error('Error saving partner:', error)
      toast({
        title: "Error",
        description: editingPartner
          ? "Failed to update partner"
          : "Failed to create partner",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!partnerToDelete) return

    setIsSubmitting(true)

    try {
      await deletePartner(partnerToDelete.id)

      toast({ title: 'Success', description: 'Partner deleted successfully' })

      setShowDeleteDialog(false)
      setPartnerToDelete(null)
      
      // Refresh partners list
      await fetchPartners()
    } catch (error) {
      console.error('Error deleting partner:', error)
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      partner_name: "",
      image_url: "",
      display_priority: 1,
      status: "Active"
    })
    setImagePreview("")
    setEditingPartner(null)
    setShowForm(false)
  }

  // Handle edit
  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData({
      partner_name: partner.partner_name,
      image_url: partner.image_url,
      display_priority: partner.display_priority,
      status: partner.status,
    })
    setImagePreview(partner.image_url)
    setShowForm(true)
  }

  // Handle create new
  const handleCreateNew = () => {
    resetForm()
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Partners</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage partner logos and information
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Form Card */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPartner ? "Edit Partner" : "Add New Partner"}
            </CardTitle>
            <CardDescription>
              {editingPartner
                ? "Update partner information"
                : "Add a new partner to display on your website"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Partner Name */}
                <div className="space-y-2">
                  <Label htmlFor="partner_name">
                    Partner Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="partner_name"
                    value={formData.partner_name}
                    onChange={(e) =>
                      setFormData({ ...formData, partner_name: e.target.value })
                    }
                    placeholder="Enter partner name"
                    required
                  />
                </div>

                {/* Display Priority */}
                <div className="space-y-2">
                  <Label htmlFor="display_priority">
                    Display Priority <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="display_priority"
                    type="number"
                    min="1"
                    value={formData.display_priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_priority: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Active" | "Inactive") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">
                    Partner Logo <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    {isUploading && (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG or JPG, max 5MB, transparent background recommended
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative w-48 h-48 border rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain p-4"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("")
                        setFormData({ ...formData, image_url: "" })
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Or Manual URL */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Or Enter Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value })
                    setImagePreview(e.target.value)
                  }}
                  placeholder="https://example.com/partner-logo.png"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingPartner ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingPartner ? "Update Partner" : "Create Partner"}</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Partners List */}
      <Card>
        <CardHeader>
          <CardTitle>All Partners ({partners.length})</CardTitle>
          <CardDescription>
            Manage and organize your partner logos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No partners yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Get started by adding your first partner
              </p>
              <Button onClick={handleCreateNew} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Logo</TableHead>
                    <TableHead>Partner Name</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners
                    .sort((a, b) => a.display_priority - b.display_priority)
                    .map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div className="relative w-16 h-16 border rounded overflow-hidden bg-gray-50">
                            <Image
                              src={partner.image_url}
                              alt={partner.partner_name}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {partner.partner_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {partner.display_priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              partner.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(partner)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPartnerToDelete(partner)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Partner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{partnerToDelete?.partner_name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
