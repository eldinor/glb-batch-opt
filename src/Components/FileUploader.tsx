import { ImageUtils, WebIO, type Transform, type vec3 } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  textureCompress,
  flatten,
  join,
  weld,
  simplify,
  center,
  meshopt,
  prune,
  quantize,
  resample,
  instance,
  sparse,
  palette,
  normals,
  metalRough,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from "meshoptimizer";
import { useState, useRef, type ChangeEvent, useEffect } from "react";
import JSZip from "jszip";
import ModelViewer from "./ModelViewer.tsx";
import type { OptimizationSettings } from "../types.ts";

interface FileProgress {
  name: string;
  status: "pending" | "processing" | "completed" | "error";
  result?: Uint8Array;
  error?: string;
  url?: string;
  originalSize?: number; // Size in bytes
  optimizedSize?: number; // Size in bytes
}

interface FileUploaderProps {
  settings: OptimizationSettings;
}

export default function FileUploader({ settings }: FileUploaderProps) {
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set the first completed file as selected model when available
  useEffect(() => {
    // Only set the selected model if there isn't one already
    if (!selectedModel) {
      const completedFile = files.find((file) => file.status === "completed" && file.url);
      if (completedFile && completedFile.url) {
        setSelectedModel(completedFile.url);
      }
    }
  }, [files, selectedModel]);

  const processFiles = async (selectedFiles: File[]) => {
    // Filter only .glb files
    const glbFiles = selectedFiles.filter((file) => file.name.toLowerCase().endsWith(".glb"));

    if (glbFiles.length === 0) return;

    // Create new file entries
    const newFiles = glbFiles.map((file) => ({
      name: file.name,
      status: "pending" as const,
      originalSize: file.size, // Store original file size
    }));

    // Update files state and get the new state
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    setIsProcessing(true);

    // Process files one by one
    for (let i = 0; i < glbFiles.length; i++) {
      const file = glbFiles[i];
      const index = files.length + i; // This is the index in the updatedFiles array

      try {
        // Update status to processing
        setFiles((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = { ...updated[index], status: "processing" };
          }
          return updated;
        });

        // Read file as array buffer
        const fileData = await readFileAsArrayBuffer(file);

        // Process the GLB file with optimization settings
        const result = await processGLB(new Uint8Array(fileData));

        // Update with result
        setFiles((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              status: "completed",
              url: result.url,
              optimizedSize: result.size,
            };
          }
          return updated;
        });

        // Set as selected model if there isn't one already selected
        if (!selectedModel) {
          setSelectedModel(result.url);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        setFiles((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = { ...updated[index], status: "error", error: String(error) };
          }
          return updated;
        });
      }
    }

    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await processFiles(Array.from(e.target.files));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const processGLB = async (uint8Array: Uint8Array): Promise<{ url: string; size: number }> => {
    let totalVRAM = 0;

    // Initialize MeshoptEncoder
    await MeshoptEncoder.ready;

    const io = new WebIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
      "meshopt.decoder": MeshoptDecoder,
      "meshopt.encoder": MeshoptEncoder,
      "meshopt.simplifier": MeshoptSimplifier,
    });

    // Creating GLTF-Transform Document
    const doc = await io.readBinary(uint8Array);

    // Calculate initial VRAM usage
    doc
      .getRoot()
      .listTextures()
      .forEach((tex) => {
        const vram = ImageUtils.getVRAMByteLength(tex.getImage()!, tex.getMimeType());
        totalVRAM += vram!;
      });
    console.log("Initial VRAM usage:", totalVRAM);

    // Apply transformations based on settings
    const transforms: Transform[] = [];

    // Add prune if enabled
    if (settings.enablePrune) {
      transforms.push(
        prune({
          keepExtras: settings.pruneOptions.keepExtras,
        })
      );
    }

    // Add instance if enabled
    if (settings.enableInstance) {
      transforms.push(
        instance({
          min: settings.instanceOptions.min,
        })
      );
    }

    // Add dedup if enabled
    if (settings.enableDedup) {
      transforms.push(
        dedup({
          //@ts-ignore
          accessors: settings.dedupOptions.accessors,
          meshes: settings.dedupOptions.meshes,
          materials: settings.dedupOptions.materials,
        })
      );
    }

    // Add palette if enabled
    if (settings.enablePalette) {
      transforms.push(
        palette({
          min: settings.paletteOptions.min,
        })
      );
    }

    // Add flatten if enabled
    if (settings.enableFlatten) {
      transforms.push(flatten());
    }

    // Add join if enabled
    if (settings.enableJoin) {
      transforms.push(join());
    }

    // Add weld if enabled
    if (settings.enableWeld) {
      transforms.push(weld());
    }

    // Add center if enabled
    if (settings.enableCenter) {
      transforms.push(
        center({
          pivot: settings.centerOptions.pivot === "bottom" ? "below" : settings.centerOptions.pivot === "origin" ? ([0, 0, 0] as vec3) : settings.centerOptions.pivot,
        })
      );
    }

    // Add quantize if enabled
    if (settings.enableQuantize) {
      transforms.push(quantize());
    }

    // Add resample if enabled
    if (settings.enableResample) {
      transforms.push(resample());
    }

    // Add meshopt if enabled
    if (settings.enableMeshopt) {
      transforms.push(
        meshopt({
          encoder: MeshoptEncoder,
          //@ts-ignore
          level: settings.meshoptOptions.level,
        })
      );
    }

    // Add simplify if enabled
    if (settings.enableSimplify) {
      transforms.push(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: settings.simplifyOptions.ratio,
          error: settings.simplifyOptions.error,
        })
      );
    }

    // Add texture compression if enabled
    if (settings.enableTextureCompression) {
      const compressionOptions: any = {
        targetFormat: settings.textureCompressionOptions.format,
        resize: settings.textureCompressionOptions.resize,
      };

      // Only set quality if it's not 'auto'
      if (settings.textureCompressionOptions.quality !== "auto") {
        compressionOptions.quality = settings.textureCompressionOptions.quality;
      }

      transforms.push(textureCompress(compressionOptions));
    }

    // Add sparse if enabled
    if (settings.enableSparse) {
      transforms.push(
        sparse({
          ratio: settings.sparseOptions.ratio,
        })
      );
    }

    // Add normals if enabled
    if (settings.enableNormals) {
      transforms.push(
        normals({
          overwrite: settings.normalsOptions.overwrite,
        })
      );
    }

    // Add metalRough if enabled
    if (settings.enableMetalRough) {
      transforms.push(metalRough());
    }

    // Add materialsOptions if enabled
    if (settings.enableMaterialsOptions) {
      doc
        .getRoot()
        .listMaterials()
        .forEach((material) => {
          material.setDoubleSided(settings.materialsOptions.doubleSided);
        });
    }

    // Apply all transforms
    if (transforms.length > 0) {
      await doc.transform(...transforms);

      // Calculate final VRAM usage
      let finalVRAM = 0;
      doc
        .getRoot()
        .listTextures()
        .forEach((tex) => {
          const vram = ImageUtils.getVRAMByteLength(tex.getImage()!, tex.getMimeType());
          finalVRAM += vram!;
        });
      console.log("Final VRAM usage:", finalVRAM);
      console.log("VRAM reduction:", totalVRAM - finalVRAM, "bytes (", (((totalVRAM - finalVRAM) / totalVRAM) * 100).toFixed(2), "%)");
    }

    // Output optimized GLB
    const glb = await io.writeBinary(doc);

    // Create blob with proper MIME type
    const assetBlob = new Blob([glb], { type: "model/gltf-binary" });
    const assetUrl = URL.createObjectURL(assetBlob);

    console.log("Created asset URL:", assetUrl);
    return { url: assetUrl, size: glb.byteLength };
  };

  const handleModelSelect = (url: string) => {
    setSelectedModel(url);
  };

  const handleDownloadZip = async () => {
    const completedFiles = files.filter((file) => file.status === "completed");

    if (completedFiles.length === 0) {
      alert("No processed files to download");
      return;
    }

    setIsZipping(true);

    try {
      const zip = new JSZip();

      // Add each processed file to the zip
      for (const file of completedFiles) {
        if (file.url) {
          // Fetch the file data from the blob URL
          const response = await fetch(file.url);
          const blob = await response.blob();

          // Add to zip with formatted name
          const fileName = formatFileName(file.name);
          zip.file(fileName, blob);
        }
      }

      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "optimized_models.zip";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("Failed to create zip file");
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadFile = (url: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file selection

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = formatFileName(fileName);

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileName = (fileName: string): string => {
    //@ts-ignore
    const { fileNameSuffix, shortenFileNames, maxFileNameLength } = settings.userSettings;

    // Remove .glb extension
    let baseName = fileName.replace(".glb", "");

    // Shorten if needed
    if (shortenFileNames && baseName.length > maxFileNameLength) {
      baseName = baseName.substring(0, maxFileNameLength);
    }

    // Add suffix and extension
    return `${baseName}${fileNameSuffix}.glb`;
  };

  const handleRemoveFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file selection

    // Get the file to remove
    const fileToRemove = files[index];

    // If the file has a URL, revoke it to free up memory
    if (fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    // Remove the file from the list
    setFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    // If the removed file was the selected model, clear the selection
    if (fileToRemove.url === selectedModel) {
      setSelectedModel(null);
    }
  };

  const handleClearAllFiles = () => {
    // Revoke all object URLs to prevent memory leaks
    files.forEach((file) => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });

    // Clear the files array
    setFiles([]);

    // Clear the selected model
    setSelectedModel(null);
  };

  // Function to truncate file name with ellipsis if too long
  const truncateFileName = (fileName: string, maxLength: number = 20): string => {
    if (fileName.length <= maxLength) return fileName;

    // Get file extension
    const lastDotIndex = fileName.lastIndexOf(".");
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";

    // Calculate how much of the name we can show
    const nameWithoutExtension = fileName.substring(0, lastDotIndex !== -1 ? lastDotIndex : fileName.length);
    const maxNameLength = maxLength - extension.length - 3; // 3 for the ellipsis

    if (maxNameLength <= 0) {
      // If the extension is too long, just truncate the whole thing
      return fileName.substring(0, maxLength - 3) + "...";
    }

    // Return truncated name with ellipsis and extension
    return nameWithoutExtension.substring(0, maxNameLength) + "..." + extension;
  };

  return (
    <div className="app-container">
      <div
        className={`file-uploader-container ${isDragging ? "dragging" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="file-uploader">
          <img src="/2Asset%201500.svg" alt="Icon" width={100} />
          <h2>GLB Batch Optimizer</h2>
          <div className={`upload-area ${isDragging ? "dragging" : ""}`}>
            <p>Drag and drop .glb files here, or</p>
            <input type="file" multiple accept=".glb" onChange={handleFileChange} disabled={isProcessing} ref={fileInputRef} id="file-input" className="file-input" />
            <button
              className="primary"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              Select Files
            </button>
            <p className="file-type-hint">Only .glb files are accepted</p>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">
                <h3>Files:</h3>
                <div className="file-list-actions">
                  <button className="small danger" onClick={handleClearAllFiles} disabled={files.length === 0}>
                    Clear All
                  </button>
                  <button className="small" onClick={handleDownloadZip} disabled={isZipping || files.filter((f) => f.status === "completed").length === 0}>
                    {isZipping ? "Creating Zip..." : "Download as Zip"}
                  </button>
                </div>
              </div>
              <ul>
                {files.map((file, index) => (
                  <li
                    key={index}
                    className={`file-item status-${file.status} ${file.url === selectedModel ? "selected" : ""}`}
                    onClick={() => file.url && handleModelSelect(file.url)}
                  >
                    <div className="file-item-header">
                      <span className="file-name" title={file.name}>
                        {truncateFileName(file.name, 24)}
                      </span>
                      <div className="file-actions">
                        {file.status === "completed" && file.url && (
                          <button className="download-btn" onClick={(e) => handleDownloadFile(file.url!, file.name, e)} title="Download optimized GLB">
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="file-status">
                      {file.status === "pending" && "Pending"}
                      {file.status === "processing" && "Processing..."}
                      {file.status === "completed" && "Completed"}
                      {file.status === "error" && `Error: ${file.error}`}
                    </span>
                    {file.originalSize && (
                      <span className="file-size">
                        Original: {(file.originalSize / (1024 * 1024)).toFixed(2)} MB
                        {file.optimizedSize && (
                          <>
                            <br />
                            Optimized: {(file.optimizedSize / (1024 * 1024)).toFixed(2)} MB
                            <br />
                            Reduction: {(((file.originalSize - file.optimizedSize) / file.originalSize) * 100).toFixed(1)}%
                          </>
                        )}
                      </span>
                    )}
                    <button className="remove-btn corner-btn" onClick={(e) => handleRemoveFile(index, e)} title="Remove file">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="model-viewer-container">
        {selectedModel ? (
          <ModelViewer modelUrl={selectedModel} />
        ) : (
          <div className="empty-viewer">
            <p>Upload a GLB file to view it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
