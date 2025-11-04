"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, Plus, Trash2, Move, Loader2, Eye, ChevronLeft, ChevronRight, Zap, Palette, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ColorPicker } from "@/components/ui/color-picker"
import { useToast } from "@/hooks/use-toast"
import { CertificateField, CreateCertificateTemplateRequest, BackgroundStyle, AppreciationTextStyle, CertificateTitleStyle, SignatureStyle } from "@/types/certificate"
import { uploadCertificateBackground, createCertificateTemplate } from "@/services/certificateTemplateService"

export default function NewCertificateTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateType, setTemplateType] = useState<"participation" | "winner">("participation")
  const [certificateTitle, setCertificateTitle] = useState<string>("")
  const [appreciationText, setAppreciationText] = useState<string>("")

  // Certificate title styling
  const [certificateTitleStyle, setCertificateTitleStyle] = useState<CertificateTitleStyle>({
    // Position and Layout
    x: 50,
    y: 15,
    max_width: 90,

    // Typography
    font_size: 32,
    font_family: "Arial",
    font_weight: "bold",
    font_style: "normal",
    color: "#000000",
    alignment: "center",
    line_height: 1.2,

    // Text Styling
    underline: false,
    text_transform: "uppercase",
    text_decoration: "none",
    letter_spacing: 2,

    // Text Effects
    text_shadow: {
      enabled: false,
      color: "#000000",
      offset_x: 2,
      offset_y: 2,
      blur_radius: 4
    },

    // Background and Border
    background_color: "transparent",
    background_enabled: false,
    border_enabled: false,
    border_color: "#000000",
    border_width: 1,
    border_style: "solid",
    border_radius: 0,

    // Padding
    padding_top: 10,
    padding_bottom: 10,
    padding_left: 20,
    padding_right: 20
  })

  // New appreciation text positioning
  const [appreciationTextStyle, setAppreciationTextStyle] = useState<AppreciationTextStyle>({
    text: "",
    x: 50,
    y: 55,
    font_size: 16,
    font_family: "Arial",
    color: "#000000",
    alignment: "center",
    line_height: 1.5,
    max_width: 80
  })

  // Background style options
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>({
    type: "image",
    border_enabled: false,
    border_color: "#000000",
    border_width: 2,
    border_style: "solid"
  })

  // Signature styling
  const [signatureStyle, setSignatureStyle] = useState<SignatureStyle>({
    // Position and Layout
    x: 80,
    y: 85,
    max_width: 30,

    // Typography (for text signatures)
    font_size: 16,
    font_family: "Arial",
    font_weight: "normal",
    font_style: "italic",
    color: "#000000",
    alignment: "center",
    line_height: 1.2,

    // Text Styling
    underline: false,
    text_transform: "none",
    text_decoration: "none",
    letter_spacing: 0,

    // Text Effects
    text_shadow: {
      enabled: false,
      color: "#000000",
      offset_x: 1,
      offset_y: 1,
      blur_radius: 2
    },

    // Background and Border
    background_color: "transparent",
    background_enabled: false,
    border_enabled: false,
    border_color: "#000000",
    border_width: 1,
    border_style: "solid",
    border_radius: 0,

    // Padding
    padding_top: 5,
    padding_bottom: 5,
    padding_left: 10,
    padding_right: 10,

    // Image specific
    image_width: 150,
    image_height: 50,
    image_opacity: 1,
    image_filter: "none"
  })

  const [signatureImage, setSignatureImage] = useState<File | null>(null)
  const [signatureImageUrl, setSignatureImageUrl] = useState("")
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("")
  const [paperSize, setPaperSize] = useState<"a4" | "letter" | "a3">("a4")
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape")
  const [fields, setFields] = useState<CertificateField[]>([])
  const [defaultFontFamily, setDefaultFontFamily] = useState<string>("Arial")
  const [defaultFontColor, setDefaultFontColor] = useState<string>("#000000")

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingBackground(true)
      const imageUrl = await uploadCertificateBackground(file)
      setBackgroundImage(file)
      setBackgroundImageUrl(imageUrl)
      setBackgroundStyle(prev => ({ ...prev, image_url: imageUrl }))

      toast({
        title: "Success",
        description: "Background image uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading background:', error)
      toast({
        title: "Error",
        description: `Failed to upload background image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsUploadingBackground(false)
    }
  }

  // Smart positioning for certificate fields
  const getSmartPosition = (fieldCount: number, fieldName: string = "New Field") => {
    const name = fieldName.toLowerCase();

    // Define positions based on paper size and orientation
    const getPositionsForSize = () => {
      const basePositions = {
        a4: {
          landscape: {
            title: { x: 50, y: 15, font_size: 32 },
            subtitle: { x: 50, y: 25, font_size: 20 },
            participant_name: { x: 50, y: 35, font_size: 28 },
            event_name: { x: 50, y: 45, font_size: 18 },
            achievement: { x: 50, y: 55, font_size: 20 },
            position: { x: 50, y: 60, font_size: 18 },
            venue: { x: 25, y: 75, font_size: 16 },
            city: { x: 75, y: 75, font_size: 16 },
            score: { x: 50, y: 70, font_size: 16 },
            organization: { x: 50, y: 80, font_size: 16 },
            instructor: { x: 25, y: 90, font_size: 14 },
            date: { x: 25, y: 85, font_size: 16 },
            signature: { x: 75, y: 85, font_size: 16 },
            certificate_number: { x: 50, y: 92, font_size: 14 }
          },
          portrait: {
            title: { x: 50, y: 12, font_size: 32 },
            subtitle: { x: 50, y: 20, font_size: 20 },
            participant_name: { x: 50, y: 25, font_size: 28 },
            event_name: { x: 50, y: 32, font_size: 18 },
            achievement: { x: 50, y: 38, font_size: 20 },
            position: { x: 50, y: 43, font_size: 18 },
            venue: { x: 25, y: 65, font_size: 16 },
            city: { x: 75, y: 65, font_size: 16 },
            score: { x: 50, y: 48, font_size: 16 },
            organization: { x: 50, y: 70, font_size: 16 },
            instructor: { x: 25, y: 88, font_size: 14 },
            date: { x: 25, y: 85, font_size: 16 },
            signature: { x: 75, y: 85, font_size: 16 },
            certificate_number: { x: 50, y: 90, font_size: 14 }
          }
        },
        a3: {
          landscape: {
            title: { x: 50, y: 18, font_size: 36 },
            subtitle: { x: 50, y: 28, font_size: 24 },
            participant_name: { x: 50, y: 38, font_size: 32 },
            event_name: { x: 50, y: 48, font_size: 22 },
            achievement: { x: 50, y: 58, font_size: 24 },
            position: { x: 50, y: 63, font_size: 22 },
            venue: { x: 20, y: 78, font_size: 18 },
            city: { x: 80, y: 78, font_size: 18 },
            score: { x: 50, y: 68, font_size: 18 },
            organization: { x: 50, y: 83, font_size: 18 },
            instructor: { x: 20, y: 92, font_size: 16 },
            date: { x: 20, y: 88, font_size: 18 },
            signature: { x: 80, y: 88, font_size: 18 },
            certificate_number: { x: 50, y: 94, font_size: 16 }
          },
          portrait: {
            title: { x: 50, y: 10, font_size: 36 },
            subtitle: { x: 50, y: 18, font_size: 24 },
            participant_name: { x: 50, y: 22, font_size: 32 },
            event_name: { x: 50, y: 28, font_size: 22 },
            achievement: { x: 50, y: 34, font_size: 24 },
            position: { x: 50, y: 38, font_size: 22 },
            venue: { x: 25, y: 60, font_size: 18 },
            city: { x: 75, y: 60, font_size: 18 },
            score: { x: 50, y: 42, font_size: 18 },
            organization: { x: 50, y: 65, font_size: 18 },
            instructor: { x: 25, y: 90, font_size: 16 },
            date: { x: 25, y: 88, font_size: 18 },
            signature: { x: 75, y: 88, font_size: 18 },
            certificate_number: { x: 50, y: 92, font_size: 16 }
          }
        },
        letter: {
          landscape: {
            title: { x: 50, y: 16, font_size: 32 },
            subtitle: { x: 50, y: 26, font_size: 20 },
            participant_name: { x: 50, y: 36, font_size: 28 },
            event_name: { x: 50, y: 46, font_size: 18 },
            achievement: { x: 50, y: 56, font_size: 20 },
            position: { x: 50, y: 61, font_size: 18 },
            venue: { x: 22, y: 76, font_size: 16 },
            city: { x: 78, y: 76, font_size: 16 },
            score: { x: 50, y: 66, font_size: 16 },
            organization: { x: 50, y: 81, font_size: 16 },
            instructor: { x: 22, y: 91, font_size: 14 },
            date: { x: 22, y: 86, font_size: 16 },
            signature: { x: 78, y: 86, font_size: 16 },
            certificate_number: { x: 50, y: 92, font_size: 14 }
          },
          portrait: {
            title: { x: 50, y: 13, font_size: 32 },
            subtitle: { x: 50, y: 21, font_size: 20 },
            participant_name: { x: 50, y: 26, font_size: 28 },
            event_name: { x: 50, y: 33, font_size: 18 },
            achievement: { x: 50, y: 39, font_size: 20 },
            position: { x: 50, y: 44, font_size: 18 },
            venue: { x: 25, y: 66, font_size: 16 },
            city: { x: 75, y: 66, font_size: 16 },
            score: { x: 50, y: 49, font_size: 16 },
            organization: { x: 50, y: 71, font_size: 16 },
            instructor: { x: 25, y: 89, font_size: 14 },
            date: { x: 25, y: 86, font_size: 16 },
            signature: { x: 75, y: 86, font_size: 16 },
            certificate_number: { x: 50, y: 91, font_size: 14 }
          }
        }
      };

      // Get current paper size and orientation from state
      const currentSize = paperSize as keyof typeof basePositions;
      const currentOrientation = orientation as keyof typeof basePositions.a4;

      return basePositions[currentSize]?.[currentOrientation] || basePositions.a4.landscape;
    };

    const positions = getPositionsForSize();

    // Smart field name detection and positioning
    if (name.includes('participant') || (name.includes('name') && !name.includes('event'))) {
      return positions.participant_name;
    } else if ((name.includes('certificate') && name.includes('title')) || name.toLowerCase() === 'certificate title') {
      return positions.title;
    } else if ((name.includes('certificate') && name.includes('number')) || name.toLowerCase() === 'certificate number') {
      return positions.certificate_number;
    } else if (name.includes('event') && !name.includes('date')) {
      return positions.event_name;
    } else if (name.includes('date')) {
      return positions.date;
    } else if (name.includes('signature')) {
      return positions.signature;
    } else if (name.includes('venue')) {
      return positions.venue;
    } else if (name.includes('city')) {
      return positions.city;
    } else if (name.includes('position') || name.includes('rank')) {
      return positions.position;
    } else if (name.includes('score')) {
      return positions.score;
    } else if (name.includes('achievement')) {
      return positions.achievement;
    } else if (name.includes('organization') || name.includes('company')) {
      return positions.organization;
    } else if (name.includes('instructor') || name.includes('teacher')) {
      return positions.instructor;
    } else if (name.includes('title')) {
      return positions.title;
    }

    // Default positioning for unknown fields (stagger them)
    const defaultPositions = [
      { x: 50, y: 30 },
      { x: 50, y: 40 },
      { x: 50, y: 50 },
      { x: 50, y: 60 },
      { x: 50, y: 70 },
      { x: 30, y: 80 },
      { x: 70, y: 80 }
    ];

    const pos = defaultPositions[fieldCount % defaultPositions.length];
    return { ...pos, font_size: 18 };
  };

  const addField = (fieldName = "New Field") => {
    const position = getSmartPosition(fields.length, fieldName);

    // Generate unique ID with timestamp and random component to prevent duplicates
    const uniqueId = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newField: CertificateField = {
      id: uniqueId,
      name: fieldName,
      type: 'text' as 'text' | 'date' | 'image',
      required: false, // Default to optional, user can toggle as needed
      x: position.x,
      y: position.y,
      font_size: position.font_size || 16,
      font_family: defaultFontFamily,
      color: defaultFontColor,
      width: 200,
      height: 30,
      alignment: "center" as 'left' | 'center' | 'right'
    }
    setFields([...fields, newField])
    return newField
  }

  const addCommonFields = () => {
    // Save current fields
    const currentFields = [...fields]

    // Define common fields with their specific configurations
    const commonFieldsConfig = [
      {
        name: "Certificate Title",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        underline: true, // Certificate title should have underline by default
        font_size: 32,
        y: 20,
        required: true // Certificate title is typically required
      },
      {
        name: "Participant Name",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        font_size: 28,
        y: 40,
        required: true // Participant name is typically required
      },
      {
        name: "Date",
        type: 'date' as 'text' | 'date' | 'image' | 'signature',
        font_size: 16,
        y: 85,
        required: false // Date can be optional
      },
      {
        name: "Signature",
        type: 'signature' as 'text' | 'date' | 'image' | 'signature',
        signature_type: 'text' as 'text' | 'image',
        font_size: 16,
        y: 85,
        required: false // Signature can be optional
      },
      {
        name: "Certificate Number",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        font_size: 12,
        y: 90,
        required: false // Certificate number can be optional
      }
    ]

    // Add each common field with smart positioning
    const newFields: CertificateField[] = commonFieldsConfig.map((fieldConfig, index) => {
      // Use customized positioning based on field type
      const position = getSmartPosition(index, fieldConfig.name)

      // Generate unique ID with timestamp, field name, and random component
      const uniqueId = `field-${Date.now()}-${fieldConfig.name.replace(/\s+/g, '-').toLowerCase()}-${index}-${Math.random().toString(36).substr(2, 9)}`;

      const newField: CertificateField = {
        id: uniqueId,
        name: fieldConfig.name,
        type: fieldConfig.type,
        required: fieldConfig.required ?? false, // Use config setting or default to false
        x: position.x,
        y: fieldConfig.y || position.y,
        font_size: fieldConfig.font_size || position.font_size || 16,
        font_family: defaultFontFamily,
        color: defaultFontColor,
        width: 200,
        height: 30,
        alignment: "center" as 'left' | 'center' | 'right',
        underline: fieldConfig.underline || false,
        signature_type: fieldConfig.signature_type
      }

      return newField
    })

    // Update fields state with new fields added to existing ones
    setFields([...currentFields, ...newFields])

    toast({
      title: "Success",
      description: `Added ${newFields.length} common certificate fields`
    })
  }

  const updateField = (id: string, updates: Partial<CertificateField>) => {
    setFields(fields.map(field => {
      if (field.id === id) {
        const updatedField = { ...field, ...updates };

        // If name is being updated, auto-position the field
        if (updates.name && updates.name !== field.name) {
          const position = getSmartPosition(0, updates.name);
          updatedField.x = position.x;
          updatedField.y = position.y;
          updatedField.font_size = position.font_size || field.font_size;
        }

        return updatedField;
      }
      return field;
    }))
  }

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id))
  }

  const createCertificatePreview = () => {
    // Create a temporary template object from current form state
    const tempTemplate = {
      id: 0,
      name: templateName || "Preview Template",
      description: templateDescription || "Preview",
      type: templateType,
      certificate_title: certificateTitle,
      certificate_title_style: certificateTitleStyle,
      appreciation_text: appreciationText,
      appreciation_text_style: appreciationTextStyle,
      signature_image: signatureImageUrl,
      signature_style: signatureStyle,
      background_image: backgroundImageUrl,
      background_style: {
        ...backgroundStyle,
        image_url: backgroundImageUrl // Ensure image_url is set for preview
      },
      paper_size: paperSize,
      orientation: orientation,
      fields: fields,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Generate sample data for preview
    const sampleData = {
      participant_name: "John Doe",
      event_name: "Baby Crawling Championship 2024",
      event_date: new Date().toLocaleDateString(),
      venue_name: "Community Center Hall",
      city_name: "Mumbai",
      certificate_number: "CERT-001",
      position: "1st Place",
      score: "95 points",
      achievement: "Outstanding Performance",
      instructor: "Ms. Sarah Johnson",
      organization: "Nibog Events"
    }

    // Calculate certificate dimensions based on paper size and orientation
    const getDimensions = () => {
      const sizes = {
        a4: { width: 794, height: 1123 }, // A4 in pixels at 96 DPI
        letter: { width: 816, height: 1056 }, // Letter in pixels at 96 DPI
        a3: { width: 1123, height: 1587 } // A3 in pixels at 96 DPI
      };

      const size = sizes[tempTemplate.paper_size as keyof typeof sizes] || sizes.a4;

      if (tempTemplate.orientation === 'landscape') {
        return { width: size.height, height: size.width };
      }
      return size;
    };

    const dimensions = getDimensions();

    // Generate background styling
    let backgroundStyleCSS = 'background: white;';
    if (tempTemplate.background_style) {
      if (tempTemplate.background_style.type === 'image' && tempTemplate.background_style.image_url) {
        const imageUrl = tempTemplate.background_style.image_url.startsWith('http')
          ? tempTemplate.background_style.image_url
          : window.location.origin + tempTemplate.background_style.image_url;
        backgroundStyleCSS = `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
      } else if (tempTemplate.background_style.type === 'solid' && tempTemplate.background_style.solid_color) {
        backgroundStyleCSS = `background-color: ${tempTemplate.background_style.solid_color};`;
      } else if (tempTemplate.background_style.type === 'gradient' && tempTemplate.background_style.gradient_colors?.length === 2) {
        backgroundStyleCSS = `background: linear-gradient(135deg, ${tempTemplate.background_style.gradient_colors[0]}, ${tempTemplate.background_style.gradient_colors[1]});`;
      }
    } else if (backgroundImageUrl) {
      // Fallback to legacy background image
      const imageUrl = backgroundImageUrl.startsWith('http')
        ? backgroundImageUrl
        : window.location.origin + backgroundImageUrl;
      backgroundStyleCSS = `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }

    // Generate certificate title styling and content
    let certificateTitleHTML = '';
    if (tempTemplate.certificate_title && tempTemplate.certificate_title_style) {
      const titleStyle = tempTemplate.certificate_title_style;
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
          ${tempTemplate.certificate_title}
        </div>
      `;
    }

    // Generate appreciation text styling and content
    let appreciationTextHTML = '';
    if (tempTemplate.appreciation_text && tempTemplate.appreciation_text_style) {
      const textStyle = tempTemplate.appreciation_text_style;
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
          ${tempTemplate.appreciation_text.replace(/\n/g, '<br>')}
        </div>
      `;
    }

    // Generate signature styling and content
    let signatureHTML = '';
    if (tempTemplate.signature_image && tempTemplate.signature_style) {
      const sigStyle = tempTemplate.signature_style;
      const signatureUrl = tempTemplate.signature_image.startsWith('http')
        ? tempTemplate.signature_image
        : window.location.origin + tempTemplate.signature_image;

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
    if (tempTemplate.fields && tempTemplate.fields.length > 0) {
      fieldsHTML = tempTemplate.fields.map((field: any) => {
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
          case 'score':
            fieldValue = sampleData.score;
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
          }
          .certificate {
            width: ${dimensions.width}px;
            height: ${dimensions.height}px;
            position: relative;
            ${backgroundStyleCSS}
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          ${certificateTitleHTML}
          ${appreciationTextHTML}
          ${signatureHTML}
          ${fieldsHTML}
        </div>
      </body>
      </html>
    `;

    // Calculate modal and iframe dimensions
    const maxModalWidth = window.innerWidth * 0.9;
    const maxModalHeight = window.innerHeight * 0.9;

    // Calculate scale to fit certificate in modal
    const scaleX = maxModalWidth / dimensions.width;
    const scaleY = maxModalHeight / dimensions.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

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
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      font-size: 24px;
      cursor: pointer;
      z-index: 10000;
      color: #333;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
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
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 8px;
      transform: scale(${scale});
      transform-origin: top left;
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
    try {
      setIsPreviewLoading(true)

      // Basic validation - ensure we have at least a template name for preview
      if (!templateName) {
        toast({
          title: "Preview Unavailable",
          description: "Please enter a template name before previewing",
          variant: "destructive"
        })
        return
      }

      // Create certificate preview
      createCertificatePreview();

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(templateName && templateDescription && templateType)
      case 2:
        // Check if background is configured based on type
        if (backgroundStyle.type === "image") {
          return !!(backgroundImageUrl && paperSize && orientation)
        } else if (backgroundStyle.type === "solid") {
          return !!(backgroundStyle.solid_color && paperSize && orientation)
        } else if (backgroundStyle.type === "gradient") {
          return !!(backgroundStyle.gradient_colors?.length === 2 && paperSize && orientation)
        }
        return !!(paperSize && orientation)
      case 3:
        // Fields are now optional - templates can be created with zero fields
        // If no fields are provided, that's valid
        if (fields.length === 0) return true

        // If fields are provided, validate their structure
        if (fields.length > 0) {
          // Check for duplicate field IDs
          const fieldIds = fields.map(f => f.id)
          const uniqueIds = new Set(fieldIds)
          if (fieldIds.length !== uniqueIds.size) {
            console.error('Duplicate field IDs detected:', fieldIds)
            return false
          }

          // Validate each field has required properties
          return fields.every(field =>
            field.id &&
            field.name &&
            field.type &&
            typeof field.required === 'boolean' &&
            typeof field.x === 'number' &&
            typeof field.y === 'number'
          )
        }

        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Include all new fields
      const templateData: CreateCertificateTemplateRequest = {
        name: templateName,
        description: templateDescription,
        type: templateType as 'participation' | 'winner' | 'event_specific',
        certificate_title: certificateTitle,
        certificate_title_style: certificateTitleStyle, // Certificate title styling
        appreciation_text: appreciationText, // Keep for backward compatibility
        appreciation_text_style: appreciationTextStyle, // New structured appreciation text
        signature_image: signatureImageUrl,
        signature_style: signatureStyle, // Signature styling
        background_image: backgroundImageUrl, // Keep for backward compatibility
        background_style: backgroundStyle, // New structured background options
        paper_size: paperSize as 'a4' | 'letter' | 'a3',
        orientation: orientation as 'landscape' | 'portrait',
        fields: fields
      }
      
      const result = await createCertificateTemplate(templateData)
      
      toast({
        title: "Success",
        description: "Certificate template created successfully"
      })
      
      router.push("/admin/certificate-templates")
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: "Failed to create certificate template",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Basic Details"
      case 2: return "Background & Layout"
      case 3: return "Field Configuration"
      default: return ""
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                required
                className="mobile-input touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this certificate template"
                rows={3}
                required
                className="mobile-input touch-manipulation min-h-[80px] sm:min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Certificate Type *</Label>
              <Select
                value={templateType}
                onValueChange={(value: any) => {
                  setTemplateType(value);
                  // Update default certificate title and appreciation text based on type
                  if (value === "participation") {
                    setCertificateTitle("Certificate of Participation");
                    const participationText = "In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!";
                    setAppreciationText(participationText);
                    setAppreciationTextStyle(prev => ({ ...prev, text: participationText }));
                  } else if (value === "winner") {
                    setCertificateTitle("Certificate of Achievement");
                    const achievementText = "For outstanding performance in {event_name}.\nYour dedication, talent, and exceptional skills at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!";
                    setAppreciationText(achievementText);
                    setAppreciationTextStyle(prev => ({ ...prev, text: achievementText }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participation">Participation</SelectItem>
                  <SelectItem value="winner">Winner</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {templateType === "participation" ? "Includes appreciation text for participation." : "Includes achievement recognition text."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateTitle">Certificate Title</Label>
              <Input
                id="certificateTitle"
                value={certificateTitle}
                onChange={(e) => setCertificateTitle(e.target.value)}
                placeholder="e.g., Certificate of Participation, Certificate of Achievement"
                className="mobile-input touch-manipulation"
              />
              <p className="text-sm text-gray-500 mt-1">
                This title will appear prominently at the top of the certificate. You can use variables like <code>{`{event_name}`}</code> here.
              </p>
            </div>

            {/* Certificate Title Styling */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Certificate Title Styling</CardTitle>
                <CardDescription>Configure the complete appearance and positioning of the certificate title</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Position and Layout Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Position & Layout</h4>
                    <div className="mobile-form-grid gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>X Position (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={certificateTitleStyle.x}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Y Position (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={certificateTitleStyle.y}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Width (%)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="100"
                          value={certificateTitleStyle.max_width}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, max_width: parseInt(e.target.value) || 90 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typography Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Typography</h4>
                    <div className="mobile-form-grid gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          min="8"
                          max="72"
                          value={certificateTitleStyle.font_size}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, font_size: parseInt(e.target.value) || 32 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={certificateTitleStyle.font_family}
                          onValueChange={(value: string) => setCertificateTitleStyle(prev => ({ ...prev, font_family: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Calibri">Calibri</SelectItem>
                            <SelectItem value="Cambria">Cambria</SelectItem>
                            <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                            <SelectItem value="Pacifico">Pacifico</SelectItem>
                            <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Weight</Label>
                        <Select
                          value={certificateTitleStyle.font_weight}
                          onValueChange={(value: 'normal' | 'bold' | 'bolder' | 'lighter') => setCertificateTitleStyle(prev => ({ ...prev, font_weight: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                            <SelectItem value="bolder">Bolder</SelectItem>
                            <SelectItem value="lighter">Lighter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Style</Label>
                        <Select
                          value={certificateTitleStyle.font_style}
                          onValueChange={(value: 'normal' | 'italic' | 'oblique') => setCertificateTitleStyle(prev => ({ ...prev, font_style: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="italic">Italic</SelectItem>
                            <SelectItem value="oblique">Oblique</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <ColorPicker
                          label="Text Color"
                          value={certificateTitleStyle.color || '#000000'}
                          onChange={(color) => setCertificateTitleStyle(prev => ({ ...prev, color }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Text Alignment</Label>
                        <Select
                          value={certificateTitleStyle.alignment}
                          onValueChange={(value: 'left' | 'center' | 'right') => setCertificateTitleStyle(prev => ({ ...prev, alignment: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Line Height</Label>
                        <Input
                          type="number"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={certificateTitleStyle.line_height}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, line_height: parseFloat(e.target.value) || 1.2 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Styling Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Text Styling</h4>
                    <div className="mobile-form-grid gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>Text Transform</Label>
                        <Select
                          value={certificateTitleStyle.text_transform}
                          onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => setCertificateTitleStyle(prev => ({ ...prev, text_transform: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="uppercase">UPPERCASE</SelectItem>
                            <SelectItem value="lowercase">lowercase</SelectItem>
                            <SelectItem value="capitalize">Capitalize</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Text Decoration</Label>
                        <Select
                          value={certificateTitleStyle.text_decoration}
                          onValueChange={(value: 'none' | 'underline' | 'line-through' | 'overline') => setCertificateTitleStyle(prev => ({ ...prev, text_decoration: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="underline">Underline</SelectItem>
                            <SelectItem value="line-through">Strike Through</SelectItem>
                            <SelectItem value="overline">Overline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Letter Spacing (px)</Label>
                        <Input
                          type="number"
                          min="-5"
                          max="20"
                          step="0.5"
                          value={certificateTitleStyle.letter_spacing}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, letter_spacing: parseFloat(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Effects Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Text Effects</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="text-shadow-enabled"
                          checked={certificateTitleStyle.text_shadow?.enabled || false}
                          onChange={(e) => setCertificateTitleStyle(prev => ({
                            ...prev,
                            text_shadow: {
                              ...prev.text_shadow,
                              enabled: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 touch-manipulation"
                        />
                        <Label htmlFor="text-shadow-enabled" className="text-sm">Enable Text Shadow</Label>
                      </div>

                      {certificateTitleStyle.text_shadow?.enabled && (
                        <div className="mobile-form-grid gap-3 sm:gap-4 pl-6">
                          <div className="space-y-2">
                            <ColorPicker
                              label="Shadow Color"
                              value={certificateTitleStyle.text_shadow?.color || '#000000'}
                              onChange={(color) => setCertificateTitleStyle(prev => ({
                                ...prev,
                                text_shadow: {
                                  ...prev.text_shadow,
                                  enabled: prev.text_shadow?.enabled || false,
                                  color
                                }
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Offset X (px)</Label>
                            <Input
                              type="number"
                              min="-10"
                              max="10"
                              value={certificateTitleStyle.text_shadow?.offset_x}
                              onChange={(e) => setCertificateTitleStyle(prev => ({
                                ...prev,
                                text_shadow: {
                                  ...prev.text_shadow,
                                  enabled: prev.text_shadow?.enabled || false,
                                  offset_x: parseInt(e.target.value) || 0
                                }
                              }))}
                              className="mobile-input touch-manipulation"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Offset Y (px)</Label>
                            <Input
                              type="number"
                              min="-10"
                              max="10"
                              value={certificateTitleStyle.text_shadow?.offset_y}
                              onChange={(e) => setCertificateTitleStyle(prev => ({
                                ...prev,
                                text_shadow: {
                                  ...prev.text_shadow,
                                  enabled: prev.text_shadow?.enabled || false,
                                  offset_y: parseInt(e.target.value) || 0
                                }
                              }))}
                              className="mobile-input touch-manipulation"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Blur Radius (px)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              value={certificateTitleStyle.text_shadow?.blur_radius}
                              onChange={(e) => setCertificateTitleStyle(prev => ({
                                ...prev,
                                text_shadow: {
                                  ...prev.text_shadow,
                                  enabled: prev.text_shadow?.enabled || false,
                                  blur_radius: parseInt(e.target.value) || 0
                                }
                              }))}
                              className="mobile-input touch-manipulation"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Background and Border Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Background & Border</h4>
                    <div className="space-y-4">
                      {/* Background */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="background-enabled"
                          checked={certificateTitleStyle.background_enabled || false}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, background_enabled: e.target.checked }))}
                          className="rounded border-gray-300 touch-manipulation"
                        />
                        <Label htmlFor="background-enabled" className="text-sm">Enable Background</Label>
                      </div>

                      {certificateTitleStyle.background_enabled && (
                        <div className="pl-6">
                          <ColorPicker
                            label="Background Color"
                            value={certificateTitleStyle.background_color || 'transparent'}
                            onChange={(color) => setCertificateTitleStyle(prev => ({ ...prev, background_color: color }))}
                          />
                        </div>
                      )}

                      {/* Border */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="border-enabled"
                          checked={certificateTitleStyle.border_enabled || false}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, border_enabled: e.target.checked }))}
                          className="rounded border-gray-300 touch-manipulation"
                        />
                        <Label htmlFor="border-enabled" className="text-sm">Enable Border</Label>
                      </div>

                      {certificateTitleStyle.border_enabled && (
                        <div className="mobile-form-grid gap-3 sm:gap-4 pl-6">
                          <div className="space-y-2">
                            <ColorPicker
                              label="Border Color"
                              value={certificateTitleStyle.border_color || '#000000'}
                              onChange={(color) => setCertificateTitleStyle(prev => ({ ...prev, border_color: color }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Border Width (px)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={certificateTitleStyle.border_width}
                              onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, border_width: parseInt(e.target.value) || 1 }))}
                              className="mobile-input touch-manipulation"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Border Style</Label>
                            <Select
                              value={certificateTitleStyle.border_style}
                              onValueChange={(value: 'solid' | 'dashed' | 'dotted') => setCertificateTitleStyle(prev => ({ ...prev, border_style: value }))}
                            >
                              <SelectTrigger className="touch-manipulation">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solid">Solid</SelectItem>
                                <SelectItem value="dashed">Dashed</SelectItem>
                                <SelectItem value="dotted">Dotted</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Border Radius (px)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              value={certificateTitleStyle.border_radius}
                              onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, border_radius: parseInt(e.target.value) || 0 }))}
                              className="mobile-input touch-manipulation"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Padding Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Padding</h4>
                    <div className="mobile-form-grid gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>Top (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={certificateTitleStyle.padding_top}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, padding_top: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bottom (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={certificateTitleStyle.padding_bottom}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, padding_bottom: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Left (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={certificateTitleStyle.padding_left}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, padding_left: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Right (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={certificateTitleStyle.padding_right}
                          onChange={(e) => setCertificateTitleStyle(prev => ({ ...prev, padding_right: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {/* Background Style Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Background Style</CardTitle>
                <CardDescription>Choose how you want to style the certificate background</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Background Type Selection */}
                  <div className="space-y-2">
                    <Label>Background Type *</Label>
                    <Select
                      value={backgroundStyle.type}
                      onValueChange={(value: "image" | "solid" | "gradient") => {
                        setBackgroundStyle(prev => ({ ...prev, type: value }));
                        // Reset background image if switching away from image
                        if (value !== "image") {
                          setBackgroundImage(null);
                          setBackgroundImageUrl("");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Background Image
                          </div>
                        </SelectItem>
                        <SelectItem value="solid">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Solid Color
                          </div>
                        </SelectItem>
                        <SelectItem value="gradient">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Gradient
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Background Image Upload */}
                  {backgroundStyle.type === "image" && (
                    <div className="space-y-2">
                      <Label>Background Image *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        {backgroundImageUrl ? (
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={backgroundImageUrl.startsWith('http') ? backgroundImageUrl : `${window.location.origin}${backgroundImageUrl.startsWith('/') ? '' : '/'}${backgroundImageUrl}`}
                                alt="Background preview"
                                className="max-w-full h-48 object-contain mx-auto rounded"
                                onError={(e) => {
                                  console.error('Image failed to load:', e.currentTarget.src);
                                }}
                              />
                            </div>
                            <div className="flex justify-center">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setBackgroundImage(null)
                                  setBackgroundImageUrl("")
                                  setBackgroundStyle(prev => ({ ...prev, image_url: undefined }))
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <Label htmlFor="background-upload" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                  Upload background image
                                </span>
                                <span className="mt-1 block text-sm text-gray-500">
                                  PNG, JPG, PDF up to 5MB
                                </span>
                              </Label>
                              <Input
                                id="background-upload"
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleBackgroundUpload}
                                disabled={isUploadingBackground}
                              />
                            </div>
                            {isUploadingBackground && (
                              <div className="mt-4">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Solid Color Background */}
                  {backgroundStyle.type === "solid" && (
                    <div className="space-y-2">
                      <ColorPicker
                        label="Background Color *"
                        value={backgroundStyle.solid_color || "#FFFFFF"}
                        onChange={(color) => setBackgroundStyle(prev => ({ ...prev, solid_color: color }))}
                      />
                    </div>
                  )}

                  {/* Gradient Background */}
                  {backgroundStyle.type === "gradient" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <ColorPicker
                          label="Start Color *"
                          value={backgroundStyle.gradient_colors?.[0] || "#FFFFFF"}
                          onChange={(color) => {
                            const colors = backgroundStyle.gradient_colors || ["#FFFFFF", "#F0F0F0"];
                            colors[0] = color;
                            setBackgroundStyle(prev => ({ ...prev, gradient_colors: colors }));
                          }}
                        />
                        <ColorPicker
                          label="End Color *"
                          value={backgroundStyle.gradient_colors?.[1] || "#F0F0F0"}
                          onChange={(color) => {
                            const colors = backgroundStyle.gradient_colors || ["#FFFFFF", "#F0F0F0"];
                            colors[1] = color;
                            setBackgroundStyle(prev => ({ ...prev, gradient_colors: colors }));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Border Options */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="border-enabled"
                        checked={backgroundStyle.border_enabled || false}
                        onChange={(e) => setBackgroundStyle(prev => ({ ...prev, border_enabled: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="border-enabled">Add Border</Label>
                    </div>

                    {backgroundStyle.border_enabled && (
                      <div className="grid grid-cols-3 gap-4 pl-6">
                        <ColorPicker
                          label="Border Color"
                          value={backgroundStyle.border_color || "#000000"}
                          onChange={(color) => setBackgroundStyle(prev => ({ ...prev, border_color: color }))}
                        />
                        <div className="space-y-2">
                          <Label>Border Width (px)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={backgroundStyle.border_width || 2}
                            onChange={(e) => setBackgroundStyle(prev => ({ ...prev, border_width: parseInt(e.target.value) || 2 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Border Style</Label>
                          <Select
                            value={backgroundStyle.border_style || "solid"}
                            onValueChange={(value: "solid" | "dashed" | "dotted") =>
                              setBackgroundStyle(prev => ({ ...prev, border_style: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solid">Solid</SelectItem>
                              <SelectItem value="dashed">Dashed</SelectItem>
                              <SelectItem value="dotted">Dotted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paper-size">Paper Size *</Label>
                <Select value={paperSize} onValueChange={(value: any) => setPaperSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="a3">A3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation *</Label>
                <Select value={orientation} onValueChange={(value: any) => setOrientation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {/* Step Guidance Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">About Certificate Fields (Optional)</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Fields are placeholders for dynamic content that gets filled when certificates are generated.
                      You can create static certificates without fields, or add fields for personalized content like participant names.
                    </p>
                    <p className="text-xs text-blue-700">
                      <strong>Common fields:</strong> Participant Name, Event Name, Date, Venue, Certificate Number
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Certificate Fields</h3>
                <p className="text-sm text-gray-500">Configure the fields that will appear on the certificate</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={(e) => addField()} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
                <Button onClick={(e) => addCommonFields()} variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Quick Add Common Fields
                </Button>
              </div>
            </div>
            
            {/* Certificate Title and Appreciation Text */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Certificate Title & Appreciation Text</CardTitle>
                <CardDescription>Configure the title and appreciation message for your certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="certificateTitle">Certificate Title</Label>
                    <Input
                      id="certificateTitle"
                      value={certificateTitle}
                      onChange={(e) => setCertificateTitle(e.target.value)}
                      placeholder="e.g., Certificate of Participation, Certificate of Achievement"
                    />
                    <p className="text-sm text-gray-500">
                      This title appears at the top of the certificate. Variables: <code>{`{event_name}`}</code>, <code>{`{participant_name}`}</code>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="appreciationText">Appreciation Text</Label>
                    <Textarea
                      id="appreciationText"
                      value={appreciationText}
                      onChange={(e) => {
                        setAppreciationText(e.target.value);
                        setAppreciationTextStyle(prev => ({ ...prev, text: e.target.value }));
                      }}
                      placeholder="Enter appreciation text that will appear on the certificate (optional)"
                      rows={5}
                    />

                    {/* Comprehensive Appreciation Text Styling */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Label className="text-sm font-medium mb-3 block">Comprehensive Text Styling</Label>
                      <div className="space-y-6">
                        {/* Position and Layout Section */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Position & Layout</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>X Position (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={appreciationTextStyle.x}
                                onChange={(e) => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  x: parseInt(e.target.value) || 0
                                }))}
                                className="mobile-input touch-manipulation"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Y Position (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={appreciationTextStyle.y}
                                onChange={(e) => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  y: parseInt(e.target.value) || 0
                                }))}
                                className="mobile-input touch-manipulation"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Width (%)</Label>
                              <Input
                                type="number"
                                min="10"
                                max="100"
                                value={appreciationTextStyle.max_width}
                                onChange={(e) => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  max_width: parseInt(e.target.value) || 80
                                }))}
                                className="mobile-input touch-manipulation"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Typography Section */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Typography</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Font Size</Label>
                              <Input
                                type="number"
                                min="8"
                                max="72"
                                value={appreciationTextStyle.font_size}
                                onChange={(e) => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  font_size: parseInt(e.target.value) || 16
                                }))}
                                className="mobile-input touch-manipulation"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Font Family</Label>
                              <Select
                                value={appreciationTextStyle.font_family}
                                onValueChange={(value: string) => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  font_family: value
                                }))}
                              >
                                <SelectTrigger className="touch-manipulation">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Arial">Arial</SelectItem>
                                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                  <SelectItem value="Georgia">Georgia</SelectItem>
                                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                                  <SelectItem value="Verdana">Verdana</SelectItem>
                                  <SelectItem value="Calibri">Calibri</SelectItem>
                                  <SelectItem value="Cambria">Cambria</SelectItem>
                                  <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                                  <SelectItem value="Pacifico">Pacifico</SelectItem>
                                  <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Font Weight</Label>
                              <Select
                                value={appreciationTextStyle.font_weight}
                                onValueChange={(value: 'normal' | 'bold' | 'bolder' | 'lighter') => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  font_weight: value
                                }))}
                              >
                                <SelectTrigger className="touch-manipulation">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                  <SelectItem value="bolder">Bolder</SelectItem>
                                  <SelectItem value="lighter">Lighter</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Font Style</Label>
                              <Select
                                value={appreciationTextStyle.font_style}
                                onValueChange={(value: 'normal' | 'italic' | 'oblique') => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  font_style: value
                                }))}
                              >
                                <SelectTrigger className="touch-manipulation">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="italic">Italic</SelectItem>
                                  <SelectItem value="oblique">Oblique</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <ColorPicker
                                label="Text Color"
                                value={appreciationTextStyle.color || "#000000"}
                                onChange={(color) => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  color
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Text Alignment</Label>
                              <Select
                                value={appreciationTextStyle.alignment}
                                onValueChange={(value: "left" | "center" | "right") => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  alignment: value
                                }))}
                              >
                                <SelectTrigger className="touch-manipulation">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Line Height</Label>
                              <Input
                                type="number"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={appreciationTextStyle.line_height}
                                onChange={(e) => setAppreciationTextStyle(prev => ({
                                  ...prev,
                                  line_height: parseFloat(e.target.value) || 1.5
                                }))}
                                className="mobile-input touch-manipulation"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Available Variables:</span> <code>{`{participant_name}`}</code>, <code>{`{event_name}`}</code>, <code>{`{game_name}`}</code>, <code>{`{venue_name}`}</code>, <code>{`{city_name}`}</code>, <code>{`{date}`}</code>, <code>{`{organization}`}</code>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Tip:</span> Variables will be automatically replaced with actual data when certificates are generated.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* E-Signature Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">E-Signature (Optional)</CardTitle>
                <CardDescription>Upload an e-signature image that can be used in signature fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signatureImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={signatureImageUrl.startsWith('blob:') || signatureImageUrl.startsWith('http') ? signatureImageUrl : `http://localhost:3001${signatureImageUrl}`}
                          alt="E-signature preview"
                          className="max-w-full h-24 object-contain mx-auto border rounded"
                          onError={(e) => {
                            console.error('Signature image failed to load:', e.currentTarget.src);
                          }}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSignatureImage(null);
                            setSignatureImageUrl("");
                          }}
                        >
                          Remove E-Signature
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="space-y-2">
                        <Label htmlFor="signature-upload" className="cursor-pointer">
                          <span className="block text-sm font-medium text-gray-900">
                            Upload E-Signature
                          </span>
                          <span className="block text-sm text-gray-500">
                            PNG, JPG up to 2MB (transparent background recommended)
                          </span>
                        </Label>
                        <Input
                          id="signature-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setSignatureImage(file);
                                // Create a local URL for immediate preview
                                const localUrl = URL.createObjectURL(file);
                                setSignatureImageUrl(localUrl);

                                // Upload to server in the background
                                const serverUrl = await uploadCertificateBackground(file);
                                // Update with server URL for form submission
                                setSignatureImageUrl(serverUrl);

                                toast({
                                  title: "Success",
                                  description: "Signature image uploaded successfully"
                                });
                              } catch (error) {
                                console.error('Error uploading signature:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to upload signature image",
                                  variant: "destructive"
                                });
                                // Reset on error
                                setSignatureImage(null);
                                setSignatureImageUrl("");
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    This signature will be available for use in signature fields. You can add signature fields in the field configuration section.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Signature Styling */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Signature Styling</CardTitle>
                <CardDescription>Configure the appearance and positioning of signature elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Position and Layout Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Position & Layout</h4>
                    <div className="mobile-form-grid gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>X Position (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={signatureStyle.x}
                          onChange={(e) => setSignatureStyle(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Y Position (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={signatureStyle.y}
                          onChange={(e) => setSignatureStyle(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Width (%)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="100"
                          value={signatureStyle.max_width}
                          onChange={(e) => setSignatureStyle(prev => ({ ...prev, max_width: parseInt(e.target.value) || 30 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typography Section (for text signatures) */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Typography (Text Signatures)</h4>
                    <div className="mobile-form-grid gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          min="8"
                          max="72"
                          value={signatureStyle.font_size}
                          onChange={(e) => setSignatureStyle(prev => ({ ...prev, font_size: parseInt(e.target.value) || 16 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={signatureStyle.font_family}
                          onValueChange={(value: string) => setSignatureStyle(prev => ({ ...prev, font_family: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Calibri">Calibri</SelectItem>
                            <SelectItem value="Cambria">Cambria</SelectItem>
                            <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                            <SelectItem value="Pacifico">Pacifico</SelectItem>
                            <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Weight</Label>
                        <Select
                          value={signatureStyle.font_weight}
                          onValueChange={(value: 'normal' | 'bold' | 'bolder' | 'lighter') => setSignatureStyle(prev => ({ ...prev, font_weight: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                            <SelectItem value="bolder">Bolder</SelectItem>
                            <SelectItem value="lighter">Lighter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Style</Label>
                        <Select
                          value={signatureStyle.font_style}
                          onValueChange={(value: 'normal' | 'italic' | 'oblique') => setSignatureStyle(prev => ({ ...prev, font_style: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="italic">Italic</SelectItem>
                            <SelectItem value="oblique">Oblique</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <ColorPicker
                          label="Text Color"
                          value={signatureStyle.color || '#000000'}
                          onChange={(color) => setSignatureStyle(prev => ({ ...prev, color }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Text Alignment</Label>
                        <Select
                          value={signatureStyle.alignment}
                          onValueChange={(value: 'left' | 'center' | 'right') => setSignatureStyle(prev => ({ ...prev, alignment: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Image Settings Section (for image signatures) */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Image Settings (Image Signatures)</h4>
                    <div className="mobile-form-grid gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>Image Width (px)</Label>
                        <Input
                          type="number"
                          min="50"
                          max="500"
                          value={signatureStyle.image_width}
                          onChange={(e) => setSignatureStyle(prev => ({ ...prev, image_width: parseInt(e.target.value) || 150 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image Height (px)</Label>
                        <Input
                          type="number"
                          min="20"
                          max="200"
                          value={signatureStyle.image_height}
                          onChange={(e) => setSignatureStyle(prev => ({ ...prev, image_height: parseInt(e.target.value) || 50 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image Opacity</Label>
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={signatureStyle.image_opacity}
                          onChange={(e) => setSignatureStyle(prev => ({ ...prev, image_opacity: parseFloat(e.target.value) || 1 }))}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image Filter</Label>
                        <Select
                          value={signatureStyle.image_filter}
                          onValueChange={(value: 'none' | 'grayscale' | 'sepia' | 'blur') => setSignatureStyle(prev => ({ ...prev, image_filter: value }))}
                        >
                          <SelectTrigger className="touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="grayscale">Grayscale</SelectItem>
                            <SelectItem value="sepia">Sepia</SelectItem>
                            <SelectItem value="blur">Blur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Default Font Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Default Font Settings</CardTitle>
                <CardDescription>These settings will be applied to new fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFont">Font Family</Label>
                    <Select value={defaultFontFamily} onValueChange={setDefaultFontFamily}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Standard Fonts */}
                        <SelectItem value="Arial"><span style={{fontFamily: 'Arial'}}>Arial</span></SelectItem>
                        <SelectItem value="Helvetica"><span style={{fontFamily: 'Helvetica'}}>Helvetica</span></SelectItem>
                        <SelectItem value="Times New Roman"><span style={{fontFamily: 'Times New Roman'}}>Times New Roman</span></SelectItem>
                        <SelectItem value="Georgia"><span style={{fontFamily: 'Georgia'}}>Georgia</span></SelectItem>
                        <SelectItem value="Verdana"><span style={{fontFamily: 'Verdana'}}>Verdana</span></SelectItem>
                        <SelectItem value="Courier New"><span style={{fontFamily: 'Courier New'}}>Courier New</span></SelectItem>
                        <SelectItem value="Tahoma"><span style={{fontFamily: 'Tahoma'}}>Tahoma</span></SelectItem>
                        <SelectItem value="Trebuchet MS"><span style={{fontFamily: 'Trebuchet MS'}}>Trebuchet MS</span></SelectItem>
                        <SelectItem value="Impact"><span style={{fontFamily: 'Impact'}}>Impact</span></SelectItem>
                        <SelectItem value="Comic Sans MS"><span style={{fontFamily: 'Comic Sans MS'}}>Comic Sans MS</span></SelectItem>
                        <SelectItem value="Palatino"><span style={{fontFamily: 'Palatino'}}>Palatino</span></SelectItem>
                        <SelectItem value="Garamond"><span style={{fontFamily: 'Garamond'}}>Garamond</span></SelectItem>
                        <SelectItem value="Bookman"><span style={{fontFamily: 'Bookman'}}>Bookman</span></SelectItem>
                        <SelectItem value="Calibri"><span style={{fontFamily: 'Calibri'}}>Calibri</span></SelectItem>
                        <SelectItem value="Century Gothic"><span style={{fontFamily: 'Century Gothic'}}>Century Gothic</span></SelectItem>
                        <SelectItem value="Cambria"><span style={{fontFamily: 'Cambria'}}>Cambria</span></SelectItem>
                        <SelectItem value="Candara"><span style={{fontFamily: 'Candara'}}>Candara</span></SelectItem>
                        <SelectItem value="Consolas"><span style={{fontFamily: 'Consolas'}}>Consolas</span></SelectItem>
                        <SelectItem value="Franklin Gothic"><span style={{fontFamily: 'Franklin Gothic'}}>Franklin Gothic</span></SelectItem>
                        <SelectItem value="Segoe UI"><span style={{fontFamily: 'Segoe UI'}}>Segoe UI</span></SelectItem>
                        
                        {/* Decorative Cursive Fonts */}
                        <SelectItem value="Great Vibes"><span style={{fontFamily: '"Great Vibes", cursive'}}>Great Vibes</span></SelectItem>
                        <SelectItem value="Pacifico"><span style={{fontFamily: '"Pacifico", cursive'}}>Pacifico</span></SelectItem>
                        <SelectItem value="Dancing Script"><span style={{fontFamily: '"Dancing Script", cursive'}}>Dancing Script</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ColorPicker
                    label="Default Text Color"
                    value={defaultFontColor || '#000000'}
                    onChange={setDefaultFontColor}
                  />
                </div>
              </CardContent>
            </Card>

            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-blue-50">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Add Dynamic Fields (Optional)</h3>
                    <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                      Fields define dynamic content that gets filled when certificates are generated.
                      You can create a template without fields for static certificates, or add fields for personalized content.
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => addCommonFields()}
                        className="mr-2"
                        variant="default"
                      >
                        Add Common Fields
                      </Button>
                      <Button
                        onClick={() => addField()}
                        variant="outline"
                      >
                        Add Custom Field
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 Tip: You can create the template now without fields, or add fields for dynamic content
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="mobile-card-content">
                      <div className="mobile-form-grid gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label>Field Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="Field name"
                            className="mobile-input touch-manipulation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: any) => updateField(field.id, { type: value })}
                          >
                            <SelectTrigger className="touch-manipulation">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="signature">Signature</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>X Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={field.x}
                            onChange={(e) => updateField(field.id, { x: parseInt(e.target.value) || 0 })}
                            className="mobile-input touch-manipulation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Y Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={field.y}
                            onChange={(e) => updateField(field.id, { y: parseInt(e.target.value) || 0 })}
                            className="mobile-input touch-manipulation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            min="8"
                            max="72"
                            value={field.font_size}
                            onChange={(e) => updateField(field.id, { font_size: parseInt(e.target.value) || 16 })}
                            className="mobile-input touch-manipulation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={field.font_family}
                            onValueChange={(value: string) => updateField(field.id, { font_family: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Standard Fonts */}
                              <SelectItem value="Arial"><span style={{fontFamily: 'Arial'}}>Arial</span></SelectItem>
                              <SelectItem value="Helvetica"><span style={{fontFamily: 'Helvetica'}}>Helvetica</span></SelectItem>
                              <SelectItem value="Times New Roman"><span style={{fontFamily: 'Times New Roman'}}>Times New Roman</span></SelectItem>
                              <SelectItem value="Georgia"><span style={{fontFamily: 'Georgia'}}>Georgia</span></SelectItem>
                              <SelectItem value="Verdana"><span style={{fontFamily: 'Verdana'}}>Verdana</span></SelectItem>
                              <SelectItem value="Courier New"><span style={{fontFamily: 'Courier New'}}>Courier New</span></SelectItem>
                              <SelectItem value="Tahoma"><span style={{fontFamily: 'Tahoma'}}>Tahoma</span></SelectItem>
                              <SelectItem value="Trebuchet MS"><span style={{fontFamily: 'Trebuchet MS'}}>Trebuchet MS</span></SelectItem>
                              <SelectItem value="Impact"><span style={{fontFamily: 'Impact'}}>Impact</span></SelectItem>
                              <SelectItem value="Comic Sans MS"><span style={{fontFamily: 'Comic Sans MS'}}>Comic Sans MS</span></SelectItem>
                              <SelectItem value="Palatino"><span style={{fontFamily: 'Palatino'}}>Palatino</span></SelectItem>
                              <SelectItem value="Garamond"><span style={{fontFamily: 'Garamond'}}>Garamond</span></SelectItem>
                              <SelectItem value="Bookman"><span style={{fontFamily: 'Bookman'}}>Bookman</span></SelectItem>
                              <SelectItem value="Calibri"><span style={{fontFamily: 'Calibri'}}>Calibri</span></SelectItem>
                              <SelectItem value="Century Gothic"><span style={{fontFamily: 'Century Gothic'}}>Century Gothic</span></SelectItem>
                              <SelectItem value="Cambria"><span style={{fontFamily: 'Cambria'}}>Cambria</span></SelectItem>
                              <SelectItem value="Candara"><span style={{fontFamily: 'Candara'}}>Candara</span></SelectItem>
                              <SelectItem value="Consolas"><span style={{fontFamily: 'Consolas'}}>Consolas</span></SelectItem>
                              <SelectItem value="Franklin Gothic"><span style={{fontFamily: 'Franklin Gothic'}}>Franklin Gothic</span></SelectItem>
                              <SelectItem value="Segoe UI"><span style={{fontFamily: 'Segoe UI'}}>Segoe UI</span></SelectItem>
                              
                              {/* Decorative Cursive Fonts */}
                              <SelectItem value="Great Vibes"><span style={{fontFamily: '"Great Vibes", cursive'}}>Great Vibes</span></SelectItem>
                              <SelectItem value="Pacifico"><span style={{fontFamily: '"Pacifico", cursive'}}>Pacifico</span></SelectItem>
                              <SelectItem value="Dancing Script"><span style={{fontFamily: '"Dancing Script", cursive'}}>Dancing Script</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <ColorPicker
                            label="Text Color"
                            value={field.color || '#000000'}
                            onChange={(color) => updateField(field.id, { color })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alignment</Label>
                          <Select
                            value={field.alignment}
                            onValueChange={(value: any) => updateField(field.id, { alignment: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Underline option for text fields */}
                        {field.type === 'text' && (
                          <div className="space-y-2">
                            <Label>Text Style</Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`underline-${field.id}`}
                                checked={field.underline || false}
                                onChange={(e) => updateField(field.id, { underline: e.target.checked })}
                                className="rounded"
                              />
                              <Label htmlFor={`underline-${field.id}`}>Underline</Label>
                            </div>
                          </div>
                        )}

                        {/* Required field toggle */}
                        <div className="space-y-2">
                          <Label>Field Settings</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`required-${field.id}`}
                              checked={field.required || false}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="rounded touch-manipulation"
                            />
                            <Label htmlFor={`required-${field.id}`} className="text-sm">Required field</Label>
                          </div>
                        </div>

                        {/* Signature type option for signature fields */}
                        {field.type === 'signature' && (
                          <div className="space-y-2">
                            <Label>Signature Type</Label>
                            <Select
                              value={field.signature_type || 'text'}
                              onValueChange={(value: any) => updateField(field.id, { signature_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Signature</SelectItem>
                                <SelectItem value="image">E-Signature Image</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-500">
                              {field.signature_type === 'image'
                                ? 'Will use the uploaded e-signature image'
                                : 'Will display signature as text (e.g., "Authorized Signature")'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-3 sm:mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(field.id)}
                          className="touch-manipulation min-h-[44px] min-w-[44px]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="outline" size="icon" asChild className="touch-manipulation self-start">
          <Link href="/admin/certificate-templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Certificate Template</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Design a new certificate template for NIBOG events</p>
        </div>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="mobile-card-content">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{getStepTitle(currentStep)}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardHeader className="mobile-card-header">
          <CardTitle className="text-lg sm:text-xl">{getStepTitle(currentStep)}</CardTitle>
          <CardDescription className="text-sm">
            {currentStep === 1 && "Enter the basic information for your certificate template"}
            {currentStep === 2 && "Upload a background image and configure the layout settings"}
            {currentStep === 3 && "Add and position the fields that will appear on the certificate"}
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-card-content">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="w-full sm:w-auto touch-manipulation"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Preview button - available on all steps */}
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isPreviewLoading}
            className="w-full sm:w-auto touch-manipulation"
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

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="w-full sm:w-auto touch-manipulation"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(currentStep) || isSubmitting}
              className="w-full sm:w-auto touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

