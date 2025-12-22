"use client"

import React, { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import * as XLSX from "xlsx"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MobileTestHelper } from "@/components/admin/mobile-test-helper"

export default function EmailSendingPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Email state
  type RecipientType =
    | "all-users"
    | "all-parents"
    | "complete-users"
    | "event-parents"
    | "event-users"
    | "event-all-users"
    | "single-user";

  const [emailData, setEmailData] = useState<{
    subject: string;
    content: string;
    recipients: RecipientType;
    attachments: any[];
    template: string;
    eventId: string;
    singleUserEmail: string;
  }>({
    subject: "",
    content: "",
    recipients: "all-users",
    attachments: [],
    template: "default",
    eventId: "",
    singleUserEmail: "",
  })

  // Template state
  const [templateData, setTemplateData] = useState({
    id: null as number | null,
    name: "",
    subject: "",
    content: "",
    created_at: "",
    updated_at: ""
  })
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0)

  // Events state
  const [events, setEvents] = useState<any[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // Fetch all events
  const fetchEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const res = await fetch("/api/events/get-all")
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch (e) {
      setEvents([])
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Fetch all templates
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true)
    try {
      const res = await fetch("https://ai.nibog.in/webhook/v1/nibog/emailtemplate/get-all")
      const data = await res.json()
      setTemplates(Array.isArray(data) ? data : [])
    } catch (e) {
      setTemplates([])
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  // Get template by id (for edit/view)
  const fetchTemplateById = async (id: number) => {
    // fetchTemplateById called (debug log removed)
    setIsLoadingTemplates(true)
    try {
      // Try with number id first
      let res = await fetch("https://ai.nibog.in/webhook/v1/nibog/emailtemplate/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      let data = await res.json();
      // API response for template by id (number) (debug log removed)

      let tpl = null;
      if (Array.isArray(data) && data.length > 0) {
        tpl = data[0];
      } else if (data && typeof data === "object" && data.id) {
        tpl = data;
      }

      // If not found, try with string id
      if (!tpl) {
        res = await fetch("https://ai.nibog.in/webhook/v1/nibog/emailtemplate/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id.toString() }),
        });
        data = await res.json();
        // API response for template by id (string) (debug log removed)
        if (Array.isArray(data) && data.length > 0) {
          tpl = data[0];
        } else if (data && typeof data === "object" && data.id) {
          tpl = data;
        }
      }

      if (tpl) {
        setTemplateData({
          id: tpl.id,
          name: tpl.template_name,
          subject: tpl.default_subject,
          content: tpl.template_content,
          created_at: tpl.created_at,
          updated_at: tpl.updated_at
        });
        setIsEditing(true);
        setTimeout(() => {
          // templateData after edit (debug log removed)
        }, 100);
      } else {
        toast({ title: "Error", description: "Template not found or API returned empty.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch template.", variant: "destructive" });
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  // On mount, fetch templates
  React.useEffect(() => {
    fetchTemplates()
    fetchEvents()
  }, [refreshFlag])

  // NOTE: Replace this with your real send email API endpoint if available
  const recipientTypeMap = {
    "all-users": "1",
    "all-parents": "2",
    "complete-users": "3",
    "event-parents": "4",
    "event-users": "5",
    "event-all-users": "6",
    "single-user": "7"
  };

  async function sendBulkEmail() {
    setIsLoading(true);
    const typeNum = recipientTypeMap[emailData.recipients];
    const templateId = emailData.template && emailData.template !== "custom"
      ? emailData.template
      : null;
    let payload: any = {
      template_id: templateId,
      type: typeNum
    };
    if (
      (typeNum === "4" || typeNum === "5" || typeNum === "6") &&
      emailData.eventId
    ) {
      payload.event_id = emailData.eventId;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    await fetch("https://ai.nibog.in/webhook/v1/nibog/bulk/email/sending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setIsLoading(false);
    toast({
      title: "Success!",
      description: "Email sent successfully.",
    });
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      let res, data;
      if (isEditing && templateData.id) {
        // Update template
        res = await fetch("https://ai.nibog.in/webhook/v1/nibog/emailtemplate/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: templateData.id,
            template_name: templateData.name,
            default_subject: templateData.subject,
            template_content: templateData.content,
          }),
        });
        data = await res.json();
        toast({ title: "Success!", description: "Template updated." });
      } else {
        // Create template
        res = await fetch("https://ai.nibog.in/webhook/v1/nibog/emailtemplate/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template_name: templateData.name,
            default_subject: templateData.subject,
            template_content: templateData.content,
          }),
        });
        data = await res.json();
        toast({ title: "Success!", description: "Template created." });
      }
      setTemplateData({ id: null, name: "", subject: "", content: "", created_at: "", updated_at: "" });
      setIsEditing(false)
      setRefreshFlag(f => f + 1) // trigger refresh
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-0">
      <div className="w-full max-w-full">
        <div className="mb-6 sm:mb-8 flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2 w-full text-center flex items-center justify-center gap-2">
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#e0e7ef"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
            Email Management
          </h1>
        </div>
        <Tabs defaultValue="send">
          <TabsList className="mb-4 w-full mobile-tabs">
            <TabsTrigger value="send" className="mobile-tab-trigger">Send Email</TabsTrigger>
            <TabsTrigger value="templates" className="mobile-tab-trigger">Email Templates</TabsTrigger>
            <TabsTrigger value="bulk" className="mobile-tab-trigger">Bulk Email</TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <Card className="w-full shadow border-blue-100">
              <CardHeader className="mobile-card-header bg-blue-50 rounded-t-lg border-b border-blue-100 w-full">
                <CardTitle className="mobile-text-lg font-semibold text-blue-800">Send Email</CardTitle>
                <CardDescription className="mobile-text-sm text-blue-600">Compose and send emails to users</CardDescription>
              </CardHeader>
              <CardContent className="mobile-card-content">
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    await sendBulkEmail();
                  }}
                  className="mobile-space-y w-full"
                >
                  <div className="mobile-space-y">
                    <Label className="mobile-text-sm font-medium">Recipients</Label>
                    <div className="mobile-form-grid-3">
                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id="recipients-all-users"
                          checked={emailData.recipients === "all-users"}
                          onCheckedChange={() => setEmailData({ ...emailData, recipients: "all-users" })}
                        />
                        <Label htmlFor="recipients-all-users" className="mobile-text-sm cursor-pointer">All Users</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id="recipients-all-parents"
                          checked={emailData.recipients === "all-parents"}
                          onCheckedChange={() => setEmailData({ ...emailData, recipients: "all-parents" })}
                        />
                        <Label htmlFor="recipients-all-parents" className="mobile-text-sm cursor-pointer">All Parents</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id="recipients-complete-users"
                          checked={emailData.recipients === "complete-users"}
                          onCheckedChange={() => setEmailData({ ...emailData, recipients: "complete-users" })}
                        />
                        <Label htmlFor="recipients-complete-users" className="mobile-text-sm cursor-pointer">Complete Users</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id="recipients-event-parents"
                          checked={emailData.recipients === "event-parents"}
                          onCheckedChange={() => setEmailData({ ...emailData, recipients: "event-parents" })}
                        />
                        <Label htmlFor="recipients-event-parents" className="mobile-text-sm cursor-pointer">Event Parents</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id="recipients-event-users"
                          checked={emailData.recipients === "event-users"}
                          onCheckedChange={() => setEmailData({ ...emailData, recipients: "event-users" })}
                        />
                        <Label htmlFor="recipients-event-users" className="mobile-text-sm cursor-pointer">Event Users</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id="recipients-event-all-users"
                          checked={emailData.recipients === "event-all-users"}
                          onCheckedChange={() => setEmailData({ ...emailData, recipients: "event-all-users" })}
                        />
                        <Label htmlFor="recipients-event-all-users" className="mobile-text-sm cursor-pointer">Event All Users</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id="recipients-single-user"
                          checked={emailData.recipients === "single-user"}
                          onCheckedChange={() => setEmailData({ ...emailData, recipients: "single-user" })}
                        />
                        <Label htmlFor="recipients-single-user" className="mobile-text-sm cursor-pointer">Single User</Label>
                      </div>
                    </div>

                    {/* Show single user email input if selected */}
                    {emailData.recipients === "single-user" && (
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="single-user-email" className="text-sm sm:text-base font-medium">User Email</Label>
                        <Input
                          id="single-user-email"
                          type="email"
                          value={emailData.singleUserEmail || ""}
                          onChange={e => setEmailData({ ...emailData, singleUserEmail: e.target.value })}
                          placeholder="Enter user email address"
                          className="mobile-input touch-manipulation"
                          required
                        />
                      </div>
                    )}
                    {(emailData.recipients === "event-parents" ||
                      emailData.recipients === "event-users" ||
                      emailData.recipients === "event-all-users") && (
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="event-select" className="text-sm sm:text-base font-medium">Select Event</Label>
                        <Select
                          value={emailData.eventId}
                          onValueChange={(value) => setEmailData({...emailData, eventId: value})}
                        >
                          <SelectTrigger className="touch-manipulation h-10 sm:h-10">
                            <SelectValue placeholder="Select an event" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingEvents ? (
                              <SelectItem value="" disabled>Loading events...</SelectItem>
                            ) : events.length === 0 ? (
                              <SelectItem value="" disabled>No events found</SelectItem>
                            ) : (
                              events.map((event: any) => (
                                <SelectItem key={event.event_id || event.id} value={String(event.event_id || event.id)}>
                                  {event.event_title || event.title || `Event #${event.event_id || event.id}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-template" className="text-sm sm:text-base font-medium">Email Template</Label>
                    <Select
                      value={emailData.template}
                      onValueChange={(value) => setEmailData({...emailData, template: value})}
                    >
                      <SelectTrigger className="touch-manipulation h-10 sm:h-10">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((tpl) => (
                          <SelectItem key={tpl.id} value={tpl.id.toString()}>
                            {tpl.template_name}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom (No Template)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show subject/content fields if "custom" is selected */}
                  {emailData.template === "custom" && (
                    <div className="mobile-space-y">
                      <div className="space-y-2">
                        <Label htmlFor="custom-subject" className="mobile-text-sm font-medium">Subject</Label>
                        <Input
                          id="custom-subject"
                          value={emailData.subject}
                          onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                          placeholder="Enter email subject"
                          className="mobile-input"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-content" className="mobile-text-sm font-medium">Content</Label>
                        <Textarea
                          id="custom-content"
                          value={emailData.content}
                          onChange={e => setEmailData({ ...emailData, content: e.target.value })}
                          placeholder="Enter email content"
                          rows={6}
                          className="mobile-input min-h-[120px] sm:min-h-[160px]"
                          required
                        />
                      </div>
                      {/* <div className="pt-2">
                        <p className="text-sm text-muted-foreground mb-2">Available placeholders:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-muted px-2 py-1 rounded">{"{{name}}"}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{"{{email}}"}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{"{{event_name}}"}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{"{{event_date}}"}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{"{{venue}}"}</span>
                        </div>
                      </div> */}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button type="submit" disabled={isLoading} className="mobile-button w-full sm:w-auto">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/></svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" opacity="0.1"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
                          Send Email
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates">
            <Card className="w-full shadow border-blue-100">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 w-full p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800">Email Templates</CardTitle>
                <CardDescription>Create and manage email templates</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isLoadingTemplates && (
                  <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
                    <span className="text-blue-600 font-semibold flex items-center gap-2">
                      <svg className="animate-spin" width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/></svg>
                      Loading template...
                    </span>
                  </div>
                )}
                <form onSubmit={handleSaveTemplate} className="space-y-4 sm:space-y-6 w-full relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">
                      {isEditing ? "Edit Email Template" : "Add Email Template"}
                    </h3>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto touch-manipulation"
                        onClick={() => {
                          setTemplateData({ id: null, name: "", subject: "", content: "", created_at: "", updated_at: "" });
                          setIsEditing(false);
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="template-name" className="text-sm sm:text-base font-medium">Template Name</Label>
                      <Input
                        id="template-name"
                        value={templateData.name}
                        onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                        placeholder="Template name"
                        className="mobile-input touch-manipulation"
                        required
                        autoFocus={isEditing}
                        />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-subject" className="mobile-text-sm font-medium">Default Subject</Label>
                      <Input
                        id="template-subject"
                        value={templateData.subject}
                        onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
                        placeholder="Default subject"
                        className="mobile-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-content" className="text-sm sm:text-base font-medium">Template Content</Label>
                    <Textarea
                      id="template-content"
                      value={templateData.content}
                      onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
                      placeholder="Create your template"
                      rows={6}
                      className="mobile-input touch-manipulation min-h-[120px] sm:min-h-[160px]"
                      required
                    />
                  </div>
                  {/* <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">Available placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{name}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{email}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{event_name}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{event_date}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{venue}}"}</span>
                    </div>
                  </div> */}
                  <div className="pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto touch-manipulation h-12 sm:h-10">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/></svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" opacity="0.1"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
                          Save Template
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
                    {/* List of created templates */}
                    <div className="mt-6 sm:mt-8">
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-2 flex items-center gap-2">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#e0e7ef"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
                        Created Email Templates
                      </h3>
                      <div className="overflow-x-auto mobile-scroll rounded-lg border border-gray-200 bg-white w-full">
                        <table className="min-w-full w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="px-3 sm:px-4 py-3 font-semibold text-left text-blue-900 min-w-[120px]">Name</th>
                              <th className="px-3 sm:px-4 py-3 font-semibold text-left text-blue-900 min-w-[150px]">Subject</th>
                              <th className="px-3 sm:px-4 py-3 font-semibold text-left text-blue-900 min-w-[200px] hidden sm:table-cell">Preview</th>
                              <th className="px-3 sm:px-4 py-3 font-semibold text-center text-blue-900 min-w-[120px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoadingTemplates ? (
                              <tr>
                                <td colSpan={4} className="text-center py-6">Loading...</td>
                              </tr>
                            ) : templates.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center py-6 text-muted-foreground">No templates found.</td>
                              </tr>
                            ) : (
                              templates.map((tpl) => (
                                <tr key={tpl.id}>
                                  <td className="px-3 sm:px-4 py-3 font-medium">{tpl.template_name}</td>
                                  <td className="px-3 sm:px-4 py-3">{tpl.default_subject}</td>
                                  <td className="px-3 sm:px-4 py-3 truncate max-w-xs hidden sm:table-cell">{tpl.template_content}</td>
                                  <td className="px-3 sm:px-4 py-3 text-center">
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-center">
                                      <button
                                        className="text-blue-600 hover:underline touch-manipulation text-sm sm:text-base py-1 sm:py-0"
                                        onClick={() => {
                                          // Always use the backend id and show a toast if not found
                                          if (!tpl.id) {
                                            toast({ title: "Error", description: "Template ID not found.", variant: "destructive" });
                                            return;
                                          }
                                          fetchTemplateById(tpl.id);
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <span className="hidden sm:inline mx-2 text-gray-300">|</span>
                                      <button
                                        className="text-red-600 hover:underline touch-manipulation text-sm sm:text-base py-1 sm:py-0"
                                        onClick={async () => {
                                          if (!window.confirm("Delete this template?")) return;
                                          setIsLoadingTemplates(true);
                                          try {
                                            await fetch("https://ai.nibog.in/webhook/v1/nibog/emailtemplate/delete", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ id: tpl.id }),
                                            });
                                            toast({ title: "Deleted", description: "Template deleted." });
                                            setRefreshFlag(f => f + 1) // trigger refresh
                                          } catch (e) {
                                            toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
                                          } finally {
                                            setIsLoadingTemplates(false);
                                          }
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bulk Email Tab */}
              <TabsContent value="bulk">
                <Card className="w-full shadow border-blue-100">
                  <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 w-full p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800">Bulk Email (CSV/XLSX)</CardTitle>
                    <CardDescription>Upload a CSV/XLSX of recipients, preview, personalize, and send</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <BulkEmailUploader />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )
    }

    // -------- Bulk Email Uploader Component --------
    function BulkEmailUploader() {
  const { toast } = useToast()
  const [fileName, setFileName] = React.useState<string>("")
  const [rawData, setRawData] = React.useState<any[]>([])
  const [columns, setColumns] = React.useState<string[]>([])
  const [previewRows, setPreviewRows] = React.useState<any[]>([])
  const [invalidEmails, setInvalidEmails] = React.useState<number[]>([])
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])
  const [progress, setProgress] = React.useState<number>(0)
  const [isParsing, setIsParsing] = React.useState<boolean>(false)
  const [isSending, setIsSending] = React.useState<boolean>(false)
  const [subject, setSubject] = React.useState<string>("Welcome to NIBOG ✨")
  const [body, setBody] = React.useState<string>(
    "Hi {{name}},\n\nWe're excited to have you!\n\nRegards,\nNIBOG Team"
  )
  const [sendResult, setSendResult] = React.useState<{success: number; failure: number}>({ success: 0, failure: 0 })
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function validateEmails(rows: any[]): number[] {
    const invalidIdx: number[] = []
    rows.forEach((row, idx) => {
      const email = row.email || row.Email || row.EMAIL || row.user_email
      if (!email || !emailRegex.test(String(email).trim())) {
        invalidIdx.push(idx)
      }
    })
    return invalidIdx
  }

  function validateFileStructure(rows: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (rows.length === 0) {
      errors.push("File is empty or has no data rows")
      return { isValid: false, errors }
    }

    // Check for required email column
    const firstRow = rows[0]
    const hasEmailColumn = firstRow.hasOwnProperty('email') ||
                          firstRow.hasOwnProperty('Email') ||
                          firstRow.hasOwnProperty('EMAIL') ||
                          firstRow.hasOwnProperty('user_email')
    
    if (!hasEmailColumn) {
      errors.push("Required 'email' column not found. Please ensure your file has an 'email' column.")
    }

    // Check for name column (optional but recommended)
    const hasNameColumn = firstRow.hasOwnProperty('name') ||
                         firstRow.hasOwnProperty('Name') ||
                         firstRow.hasOwnProperty('NAME')
    
    if (!hasNameColumn) {
      errors.push("Recommended 'name' column not found. Add a 'name' column for personalized emails.")
    }

    // Check for minimum required data
    if (rows.length > 100) {
      errors.push("File contains more than 100 rows. Please split into smaller batches for better performance.")
    }

    return { isValid: errors.length === 0, errors }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Reset validation state
    setValidationErrors([])
    setInvalidEmails([])
    
    setIsParsing(true)
    setProgress(5)
    setFileName(file.name)

    try {
      const buf = await file.arrayBuffer()
      setProgress(20)
      const wb = XLSX.read(buf, { type: 'array' })
      setProgress(40)
      const firstSheet = wb.SheetNames[0]
      const ws = wb.Sheets[firstSheet]
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[]
      setProgress(60)

      // Validate file structure
      const structureValidation = validateFileStructure(json)
      if (!structureValidation.isValid) {
        setValidationErrors(structureValidation.errors)
        toast({
          title: "File validation failed",
          description: `${structureValidation.errors.length} issues found. Check the validation messages below.`,
          variant: "destructive"
        })
      }

      const cols = json.length > 0 ? Object.keys(json[0]) : []
      setColumns(cols)
      setRawData(json)
      setPreviewRows(json.slice(0, 10))

      const invalid = validateEmails(json)
      setInvalidEmails(invalid)

      setProgress(100)
      
      const successMessage = structureValidation.isValid
        ? `Found ${json.length} rows. Invalid emails: ${invalid.length}`
        : `Found ${json.length} rows. ${structureValidation.errors.length} validation issues and ${invalid.length} invalid emails.`
      
      toast({
        title: structureValidation.isValid ? "File parsed successfully" : "File parsed with warnings",
        description: successMessage,
        variant: structureValidation.isValid ? "default" : "destructive"
      })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to parse the file. Please upload a valid CSV/XLSX.", variant: "destructive" })
    } finally {
      setIsParsing(false)
      setTimeout(() => setProgress(0), 800)
    }
  }

  function renderTemplate(str: string, row: any): string {
    return str.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => String(row[key] ?? ''))
  }

  async function handleSend() {
    if (rawData.length === 0) {
      toast({ title: "No data", description: "Please upload a CSV/XLSX file first.", variant: "destructive" })
      return
    }
    if (invalidEmails.length > 0) {
      toast({ title: "Invalid emails", description: `Please fix ${invalidEmails.length} invalid email(s) before sending.`, variant: "destructive" })
      return
    }
    setConfirmOpen(true)
  }

  async function confirmSend() {
    setConfirmOpen(false)
    setIsSending(true)
    setSendResult({ success: 0, failure: 0 })

    // Fetch email settings from existing API
    let settings: any = null
    try {
      const res = await fetch('/api/emailsetting/get', { cache: 'no-store' })
      const data = await res.json()
      settings = Array.isArray(data) ? data[0] : data
    } catch (e) {
      // continue; settings may be null leading to API error
    }

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i]
      const to = String(row.email || row.Email || row.EMAIL || row.user_email || '').trim()
      const renderedSubject = renderTemplate(subject, row)
      const renderedBody = renderTemplate(body, row).replace(/\n/g, '<br/>')

      try {
        const resp = await fetch('/api/send-receipt-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject: renderedSubject, html: renderedBody, settings })
        })
        if (resp.ok) {
          setSendResult(s => ({ ...s, success: s.success + 1 }))
        } else {
          console.error(`Failed to send email to ${to}:`, await resp.text())
          setSendResult(s => ({ ...s, failure: s.failure + 1 }))
        }
      } catch (err) {
        console.error(`Error sending email to ${to}:`, err)
        setSendResult(s => ({ ...s, failure: s.failure + 1 }))
      }
      const pct = Math.round(((i + 1) / rawData.length) * 100)
      setProgress(pct)
      
      // Add a small delay to prevent overwhelming the server
      await new Promise(r => setTimeout(r, 100))
    }

    setIsSending(false)

    // Log activity
    try {
      await fetch('/api/bulk-email/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: rawData.length,
          success: sendResult.success,
          failure: sendResult.failure,
          sample: rawData.slice(0, 3)
        })
      })
    } catch {}

    toast({ title: "Bulk email completed", description: `Success: ${sendResult.success}, Failed: ${sendResult.failure}` })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sample Template Download Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Download Sample Template</h3>
            <p className="text-xs sm:text-sm text-blue-700 mb-3">
              Download our sample CSV template to see the required format for bulk email uploads.
              The template includes columns for recipient emails, names, and custom fields that can be used with placeholders.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/bulk-email/sample-template')
                    if (response.ok) {
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'bulk-email-template.csv'
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                      toast({ title: "Downloaded", description: "CSV template downloaded successfully!" })
                    } else {
                      throw new Error('Download failed')
                    }
                  } catch (error) {
                    toast({ title: "Error", description: "Failed to download CSV template", variant: "destructive" })
                  }
                }}
                className="text-blue-700 border-blue-300 hover:bg-blue-100 w-full sm:w-auto touch-manipulation h-10"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/bulk-email/sample-template/excel')
                    if (response.ok) {
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'bulk-email-template.xlsx'
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                      toast({ title: "Downloaded", description: "Excel template downloaded successfully!" })
                    } else {
                      throw new Error('Download failed')
                    }
                  } catch (error) {
                    toast({ title: "Error", description: "Failed to download Excel template", variant: "destructive" })
                  }
                }}
                className="text-green-700 border-green-300 hover:bg-green-100 w-full sm:w-auto touch-manipulation h-10"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-2">
          <Label className="text-sm sm:text-base font-medium">Upload CSV/XLSX</Label>
          <Input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className="mobile-input touch-manipulation"
          />
          {fileName && <p className="text-xs sm:text-sm text-muted-foreground">Selected: {fileName}</p>}
          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {isParsing ? "Processing file..." : "File processed"}
              </p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-yellow-800 mb-1">File Validation Issues:</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Invalid Emails */}
          {invalidEmails.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-red-800 mb-1">Invalid Email Addresses:</h4>
                  <p className="text-xs text-red-700">
                    {invalidEmails.length} invalid email address(es) detected. These rows will be highlighted in red in the preview below.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3 sm:space-y-2">
          <Label className="text-sm sm:text-base font-medium">Subject</Label>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Email subject"
            className="mobile-input touch-manipulation"
          />
          <Label className="text-sm sm:text-base font-medium">Body</Label>
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            placeholder="Use placeholders like {{name}}, {{email}}"
            className="mobile-input touch-manipulation min-h-[120px] sm:min-h-[160px]"
          />
          <p className="text-xs text-muted-foreground">Placeholders available: {"{{name}}"}, {"{{email}}"}, plus any column from your file.</p>
        </div>
      </div>

      {/* Preview Table */}
      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-medium">Preview (first 10 rows)</Label>
        <div className="overflow-x-auto mobile-scroll rounded-lg border border-gray-200 bg-white w-full">
          <table className="min-w-full w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-blue-50">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-2 sm:px-4 py-2 sm:py-3 text-left text-blue-900 font-semibold min-w-[100px] whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.length === 0 ? (
                <tr><td className="px-2 sm:px-4 py-3 text-center" colSpan={columns.length}>No data loaded</td></tr>
              ) : previewRows.map((row, idx) => (
                <tr key={idx} className={invalidEmails.includes(idx) ? 'bg-red-50' : ''}>
                  {columns.map(col => (
                    <td key={col} className="px-2 sm:px-4 py-2 max-w-[150px] truncate" title={String(row[col])}>
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary and Actions */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
        <div className="text-xs sm:text-sm text-muted-foreground">
          Total rows: <b>{rawData.length}</b> • Invalid emails: <b className={invalidEmails.length ? 'text-destructive' : ''}>{invalidEmails.length}</b>
        </div>
        <Button
          onClick={handleSend}
          disabled={isParsing || isSending || rawData.length === 0 || invalidEmails.length > 0}
          className="w-full sm:w-auto touch-manipulation h-10 sm:h-10"
        >
          {isSending ? 'Sending...' : 'Send Bulk Emails'}
        </Button>
        {isSending && (
          <div className="w-full sm:min-w-[200px] sm:w-auto">
            <Progress value={progress} className="h-2" />
          </div>
        )}
        <div className="text-xs sm:text-sm text-muted-foreground">
          Success: {sendResult.success} • Failed: {sendResult.failure}
        </div>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send bulk emails?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send emails to {rawData.length} recipients. Please confirm to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend}>Confirm & Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <MobileTestHelper />
    </div>
  )
}

