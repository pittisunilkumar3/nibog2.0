import { NextResponse } from "next/server";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            // Allow 'file' key as well for compatibility
            const singleFile = formData.get("file") as File;
            if (singleFile) {
                files.push(singleFile);
            } else {
                return NextResponse.json(
                    { error: "No files provided" },
                    { status: 400 }
                );
            }
        }

        // Validate file types
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPG, PNG, and WebP images are allowed." },
                { status: 400 }
            );
        }

        // Validate file sizes (5MB limit per file)
        const maxSize = 5 * 1024 * 1024;
        const oversizedFiles = files.filter((file) => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            return NextResponse.json(
                { error: "File size too large. Maximum size is 5MB per file." },
                { status: 400 }
            );
        }

        // Create directory if it doesn't exist
        const uploadDir = join(process.cwd(), "upload", "gallery");
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Process each file
        const uploadedFiles = [];
        for (const file of files) {
            // Generate unique filename
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000);
            const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const filename = `gallery_${timestamp}_${randomSuffix}.${fileExtension}`;

            // Convert file to buffer and save
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filePath = join(uploadDir, filename);

            writeFileSync(filePath, buffer);

            const url = `/api/serve-image?path=upload/gallery/${filename}`;

            uploadedFiles.push({
                filename,
                url: url,
                originalName: file.name,
                size: file.size,
                // Also provide direct path property for convenience if needed
                path: url
            });
        }

        // Return format compatible with both multi-file and single-file expectations
        return NextResponse.json({
            success: true,
            files: uploadedFiles,
            // For single file upload handlers that look at root properties
            url: uploadedFiles[0].url,
            path: uploadedFiles[0].url,
            count: uploadedFiles.length,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to upload files" },
            { status: 500 }
        );
    }
}
