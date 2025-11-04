"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Download, Eye, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CertificateTemplate } from "@/types/certificate"
import { getCertificateTemplateById } from "@/services/certificateTemplateService"
import { generateCertificatePreview } from "@/services/certificatePdfService"

export default function ViewCertificateTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const templateId = parseInt(params.id as string)
  
  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        const templateData = await getCertificateTemplateById(templateId)
        console.log("Template data received:", templateData)
        setTemplate(templateData)
      } catch (error) {
        console.error("Error fetching template:", error)
        toast({
          title: "Error",
          description: "Failed to load certificate template",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (templateId) {
      fetchTemplate()
    }
  }, [templateId, toast])

  const createCertificatePreview = (template: CertificateTemplate, sampleData: any) => {
    // Calculate certificate dimensions based on paper size and orientation
    const getDimensions = () => {
      const sizes = {
        a4: { width: 794, height: 1123 }, // A4 in pixels at 96 DPI
        letter: { width: 816, height: 1056 }, // Letter in pixels at 96 DPI
        a3: { width: 1123, height: 1587 } // A3 in pixels at 96 DPI
      };

      const size = sizes[template.paper_size as keyof typeof sizes] || sizes.a4;

      if (template.orientation === 'landscape') {
        return { width: size.height, height: size.width };
      }
      return size;
    };

    const dimensions = getDimensions();

    // Generate background styling
    let backgroundStyle = 'background: white;';
    if (template.background_style) {
      if (template.background_style.type === 'image' && template.background_style.image_url) {
        const imageUrl = template.background_style.image_url.startsWith('http')
          ? template.background_style.image_url
          : window.location.origin + (template.background_style.image_url.startsWith('/') ? '' : '/') + template.background_style.image_url;
        backgroundStyle = `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
      } else if (template.background_style.type === 'solid' && template.background_style.solid_color) {
        backgroundStyle = `background-color: ${template.background_style.solid_color};`;
      } else if (template.background_style.type === 'gradient' && template.background_style.gradient_colors?.length === 2) {
        backgroundStyle = `background: linear-gradient(135deg, ${template.background_style.gradient_colors[0]}, ${template.background_style.gradient_colors[1]});`;
      }
    } else if (template.background_image) {
      // Fallback to legacy background image
      const imageUrl = template.background_image.startsWith('http')
        ? template.background_image
        : window.location.origin + (template.background_image.startsWith('/') ? '' : '/') + template.background_image;
      backgroundStyle = `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }

    // Generate certificate title styling and content
    let certificateTitleHTML = '';
    if (template.certificate_title && template.certificate_title_style) {
      const titleStyle = template.certificate_title_style;
      certificateTitleHTML = `
        <div class="certificate-title" style="
          position: absolute;
          left: ${titleStyle.x}%;
          top: ${titleStyle.y}%;
          transform: translate(-50%, -50%);
          text-align: ${titleStyle.alignment || 'center'};
          font-size: ${titleStyle.font_size || 32}px;
          font-weight: ${titleStyle.font_weight || 'bold'};
          color: ${titleStyle.color || '#333'};
          font-family: '${titleStyle.font_family || 'Arial'}', sans-serif;
          max-width: ${titleStyle.max_width || 90}%;
          line-height: ${titleStyle.line_height || 1.2};
          ${titleStyle.text_transform ? `text-transform: ${titleStyle.text_transform};` : ''}
          ${titleStyle.letter_spacing ? `letter-spacing: ${titleStyle.letter_spacing}px;` : ''}
          ${titleStyle.text_decoration && titleStyle.text_decoration !== 'none' ? `text-decoration: ${titleStyle.text_decoration};` : ''}
          ${titleStyle.text_shadow?.enabled ? `text-shadow: ${titleStyle.text_shadow.offset_x}px ${titleStyle.text_shadow.offset_y}px ${titleStyle.text_shadow.blur_radius}px ${titleStyle.text_shadow.color};` : ''}
          ${titleStyle.background_enabled ? `background-color: ${titleStyle.background_color};` : ''}
          ${titleStyle.border_enabled ? `border: ${titleStyle.border_width}px ${titleStyle.border_style} ${titleStyle.border_color}; border-radius: ${titleStyle.border_radius}px;` : ''}
          ${titleStyle.padding_top || titleStyle.padding_bottom || titleStyle.padding_left || titleStyle.padding_right ? `padding: ${titleStyle.padding_top}px ${titleStyle.padding_right}px ${titleStyle.padding_bottom}px ${titleStyle.padding_left}px;` : ''}
        ">
          ${template.certificate_title}
        </div>
      `;
    }

    // Generate appreciation text styling and content
    let appreciationTextHTML = '';
    if (template.appreciation_text && template.appreciation_text_style) {
      const textStyle = template.appreciation_text_style;
      appreciationTextHTML = `
        <div class="appreciation-text" style="
          position: absolute;
          left: ${textStyle.x}%;
          top: ${textStyle.y}%;
          transform: translate(-50%, -50%);
          text-align: ${textStyle.alignment || 'center'};
          font-size: ${textStyle.font_size || 16}px;
          color: ${textStyle.color || '#333'};
          font-family: '${textStyle.font_family || 'Arial'}', sans-serif;
          max-width: ${textStyle.max_width || 80}%;
          line-height: ${textStyle.line_height || 1.6};
        ">
          ${template.appreciation_text.replace(/\n/g, '<br>')}
        </div>
      `;
    }

    // Generate signature styling and content
    let signatureHTML = '';
    if (template.signature_image && template.signature_style) {
      const sigStyle = template.signature_style;
      const signatureUrl = template.signature_image.startsWith('http')
        ? template.signature_image
        : window.location.origin + (template.signature_image.startsWith('/') ? '' : '/') + template.signature_image;

      signatureHTML = `
        <div class="signature" style="
          position: absolute;
          left: ${sigStyle.x}%;
          top: ${sigStyle.y}%;
          transform: translate(-50%, -50%);
          text-align: ${sigStyle.alignment || 'center'};
          max-width: ${sigStyle.max_width || 30}%;
        ">
          <img src="${signatureUrl}" alt="Signature" style="
            width: ${sigStyle.image_width || 150}px;
            height: ${sigStyle.image_height || 50}px;
            opacity: ${sigStyle.image_opacity || 1};
            ${sigStyle.image_filter && sigStyle.image_filter !== 'none' ? `filter: ${sigStyle.image_filter};` : ''}
          " />
        </div>
      `;
    }

    // Generate dynamic fields HTML
    let fieldsHTML = '';
    if (template.fields && template.fields.length > 0) {
      fieldsHTML = template.fields.map((field: any) => {
        // Get sample value for this field
        let fieldValue = '';
        switch (field.name.toLowerCase()) {
          case 'participant name':
          case 'participant_name':
            fieldValue = sampleData.participant_name;
            break;
          case 'event name':
          case 'event_name':
            fieldValue = sampleData.event_name;
            break;
          case 'event date':
          case 'event_date':
            fieldValue = sampleData.event_date;
            break;
          case 'venue name':
          case 'venue_name':
            fieldValue = sampleData.venue_name;
            break;
          case 'certificate number':
          case 'certificate_number':
            fieldValue = sampleData.certificate_number;
            break;
          case 'position':
            fieldValue = sampleData.position;
            break;
          case 'achievement':
            fieldValue = sampleData.achievement;
            break;
          case 'instructor':
            fieldValue = sampleData.instructor;
            break;
          case 'organization':
            fieldValue = sampleData.organization;
            break;
          case 'city':
          case 'city_name':
            fieldValue = sampleData.city_name;
            break;
          default:
            fieldValue = field.name; // Fallback to field name
        }

        return `
          <div class="field-${field.id}" style="
            position: absolute;
            left: ${field.x}%;
            top: ${field.y}%;
            transform: translate(-50%, -50%);
            font-size: ${field.font_size || 16}px;
            color: ${field.color || '#333'};
            font-family: '${field.font_family || 'Arial'}', sans-serif;
            text-align: ${field.alignment || 'center'};
            font-weight: ${field.font_weight || 'normal'};
            ${field.width ? `width: ${field.width}px;` : ''}
            ${field.height ? `height: ${field.height}px;` : ''}
            ${field.underline ? 'text-decoration: underline;' : ''}
          ">
            ${fieldValue}
          </div>
        `;
      }).join('');
    }

    // Calculate modal and iframe dimensions
    const maxModalWidth = window.innerWidth * 0.85;
    const maxModalHeight = window.innerHeight * 0.85;

    // Calculate scale to fit certificate in modal
    const scaleX = maxModalWidth / dimensions.width;
    const scaleY = maxModalHeight / dimensions.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

    // Generate complete certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate Preview</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
          }
          .certificate-container {
            transform: scale(${scale});
            transform-origin: center center;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .certificate {
            width: ${dimensions.width}px;
            height: ${dimensions.height}px;
            position: relative;
            ${backgroundStyle}
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            ${template.background_style?.border_enabled ? `
              border: ${template.background_style.border_width || 2}px ${template.background_style.border_style || 'solid'} ${template.background_style.border_color || '#000000'};
            ` : ''}
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="certificate">
            ${certificateTitleHTML}
            ${appreciationTextHTML}
            ${signatureHTML}
            ${fieldsHTML}
          </div>
        </div>
      </body>
      </html>
    `;

    const modalWidth = dimensions.width * scale;
    const modalHeight = dimensions.height * scale;

    // Create modal
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      width: ${modalWidth}px;
      height: ${modalHeight}px;
      position: relative;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(255, 255, 255, 0.95);
      border: none;
      font-size: 24px;
      cursor: pointer;
      z-index: 10001;
      color: #333;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
      font-weight: bold;
    `;

    // Add hover effect to close button
    closeButton.onmouseenter = () => {
      closeButton.style.background = 'rgba(255, 255, 255, 1)';
      closeButton.style.transform = 'scale(1.1)';
    };
    closeButton.onmouseleave = () => {
      closeButton.style.background = 'rgba(255, 255, 255, 0.9)';
      closeButton.style.transform = 'scale(1)';
    };

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      width: ${modalWidth}px;
      height: ${modalHeight}px;
      border: none;
      border-radius: 8px;
      display: block;
    `;

    // Close modal function
    const closeModal = () => {
      document.body.removeChild(overlay);
    };

    closeButton.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    };

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Set iframe content
    iframe.onload = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(certificateHTML);
        iframeDoc.close();
      }
    };

    // Assemble modal
    modal.appendChild(closeButton);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Trigger iframe load
    iframe.src = 'about:blank';
  };

  const handlePreview = async () => {
    if (!template) {
      toast({
        title: "Error",
        description: "Template data not available",
        variant: "destructive"
      })
      return
    }

    try {
      setIsPreviewLoading(true)

      // Generate sample certificate data for preview based on template type
      const getSampleDataForTemplate = (templateType: string) => {
        const baseData = {
          event_date: new Date().toLocaleDateString(),
          venue_name: "Community Center Hall",
          city_name: "Mumbai",
          certificate_number: "CERT-001",
          instructor: "Ms. Sarah Johnson",
          organization: "Nibog Events"
        };

        switch (templateType) {
          case 'participation':
            return {
              ...baseData,
              participant_name: "Alex Johnson",
              event_name: "Baby Crawling Championship 2024",
              achievement: "Active Participation",
              position: "Participant"
            };
          case 'winner':
            return {
              ...baseData,
              participant_name: "Sarah Williams",
              event_name: "Baby Crawling Championship 2024",
              achievement: "First Place Winner",
              position: "1st Place",
              score: "95 points"
            };
          case 'event_specific':
            return {
              ...baseData,
              participant_name: "Michael Chen",
              event_name: "Special Event Recognition",
              achievement: "Outstanding Contribution",
              position: "Special Recognition"
            };
          default:
            return {
              ...baseData,
              participant_name: "Sample Participant",
              event_name: "Sample Event",
              achievement: "Sample Achievement",
              position: "Sample Position"
            };
        }
      };

      const sampleData = getSampleDataForTemplate(template.type);

      // Create certificate preview
      createCertificatePreview(template, sampleData);

      toast({
        title: "Preview Generated",
        description: "Certificate preview opened in modal"
      })
    } catch (error) {
      console.error("Error generating preview:", error)
      toast({
        title: "Error",
        description: `Failed to generate certificate preview: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsPreviewLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading template...</span>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/certificate-templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Template Not Found</h1>
            <p className="text-muted-foreground">The requested certificate template could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'participation':
        return 'bg-blue-100 text-blue-800'
      case 'winner':
        return 'bg-green-100 text-green-800'
      case 'event_specific':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/certificate-templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/certificate-templates/${template.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isPreviewLoading}
          >
            {isPreviewLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Template Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <div className="mt-1">
                <Badge className={getTypeColor(template.type)}>
                  {template.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Paper Size</label>
              <p className="mt-1 text-sm">{template.paper_size.toUpperCase()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Orientation</label>
              <p className="mt-1 text-sm capitalize">{template.orientation}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            {template.certificate_title && (
              <div>
                <label className="text-sm font-medium text-gray-500">Certificate Title</label>
                <p className="mt-1 text-sm font-medium">{template.certificate_title}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fields Information */}
        <Card>
          <CardHeader>
            <CardTitle>Fields ({template.fields?.length || 0})</CardTitle>
            <CardDescription>Dynamic fields configured for this template</CardDescription>
          </CardHeader>
          <CardContent>
            {template.fields && template.fields.length > 0 ? (
              <div className="space-y-4">
                {template.fields.map((field, index) => (
                  <div key={field.id || index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-medium text-lg">{field.name}</span>
                        <span className="ml-2 text-sm text-gray-500">({field.type})</span>
                      </div>
                      <div className="flex gap-2">
                        {field.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <label className="text-gray-500">Position</label>
                        <p>X: {field.x}%, Y: {field.y}%</p>
                      </div>
                      {field.font_size && (
                        <div>
                          <label className="text-gray-500">Font Size</label>
                          <p>{field.font_size}px</p>
                        </div>
                      )}
                      {field.font_family && (
                        <div>
                          <label className="text-gray-500">Font</label>
                          <p>{field.font_family}</p>
                        </div>
                      )}
                      {field.alignment && (
                        <div>
                          <label className="text-gray-500">Alignment</label>
                          <p className="capitalize">{field.alignment}</p>
                        </div>
                      )}
                      {field.color && (
                        <div>
                          <label className="text-gray-500">Color</label>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded border"
                              style={{ backgroundColor: field.color }}
                            ></div>
                            <span>{field.color}</span>
                          </div>
                        </div>
                      )}
                      {field.width && (
                        <div>
                          <label className="text-gray-500">Size</label>
                          <p>{field.width}×{field.height}px</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-2">No fields configured for this template.</p>
                <p className="text-xs text-gray-400">This template will generate static certificates without dynamic content.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificate Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Certificate Title Style */}
        {template.certificate_title_style && (
          <Card>
            <CardHeader>
              <CardTitle>Certificate Title Style</CardTitle>
              <CardDescription>Styling configuration for the certificate title</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-sm">X: {template.certificate_title_style.x}%, Y: {template.certificate_title_style.y}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Font Size</label>
                  <p className="text-sm">{template.certificate_title_style.font_size}px</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Font Family</label>
                  <p className="text-sm">{template.certificate_title_style.font_family}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Alignment</label>
                  <p className="text-sm capitalize">{template.certificate_title_style.alignment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Color</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: template.certificate_title_style.color }}
                    ></div>
                    <span className="text-sm">{template.certificate_title_style.color}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Font Weight</label>
                  <p className="text-sm capitalize">{template.certificate_title_style.font_weight}</p>
                </div>
              </div>
              {template.certificate_title_style.underline && (
                <div>
                  <Badge variant="outline" className="text-xs">Underlined</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Appreciation Text */}
        {(template.appreciation_text || template.appreciation_text_style) && (
          <Card>
            <CardHeader>
              <CardTitle>Appreciation Text</CardTitle>
              <CardDescription>Custom appreciation message configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.appreciation_text && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Text</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{template.appreciation_text}</p>
                </div>
              )}
              {template.appreciation_text_style && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    <p className="text-sm">X: {template.appreciation_text_style.x}%, Y: {template.appreciation_text_style.y}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Font Size</label>
                    <p className="text-sm">{template.appreciation_text_style.font_size}px</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Font Family</label>
                    <p className="text-sm">{template.appreciation_text_style.font_family}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Alignment</label>
                    <p className="text-sm capitalize">{template.appreciation_text_style.alignment}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Signature Information */}
      {(template.signature_image || template.signature_style) && (
        <Card>
          <CardHeader>
            <CardTitle>Signature Configuration</CardTitle>
            <CardDescription>E-signature image and styling settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.signature_image && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Signature Image</label>
                <div className="border rounded-lg p-4 bg-gray-50 inline-block">
                  <img
                    src={template.signature_image.startsWith('http')
                      ? template.signature_image
                      : `http://localhost:3111${template.signature_image}`}
                    alt="Signature"
                    className="max-h-20 max-w-40 object-contain"
                  />
                </div>
              </div>
            )}
            {template.signature_style && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-sm">X: {template.signature_style.x}%, Y: {template.signature_style.y}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Image Size</label>
                  <p className="text-sm">{template.signature_style.image_width}×{template.signature_style.image_height}px</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Opacity</label>
                  <p className="text-sm">{((template.signature_style.image_opacity || 1) * 100).toFixed(0)}%</p>
                </div>
                {template.signature_style.image_filter && template.signature_style.image_filter !== 'none' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Filter</label>
                    <p className="text-sm capitalize">{template.signature_style.image_filter}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Background Configuration */}
      {template.background_style && (
        <Card>
          <CardHeader>
            <CardTitle>Background Configuration</CardTitle>
            <CardDescription>Background styling and image settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-sm capitalize">{template.background_style.type}</p>
              </div>
              {template.background_style.border_enabled && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Border</label>
                    <p className="text-sm">{template.background_style.border_width}px {template.background_style.border_style}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Border Color</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: template.background_style.border_color }}
                      ></div>
                      <span className="text-sm">{template.background_style.border_color}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {template.background_style.image_url && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Background Image</label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={template.background_style.image_url.startsWith('http')
                      ? template.background_style.image_url
                      : `http://localhost:3111${template.background_style.image_url}`}
                    alt="Certificate background"
                    className="max-w-full h-auto max-h-96 mx-auto rounded"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-sm">{new Date(template.created_at).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-sm">{new Date(template.updated_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
