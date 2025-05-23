import { ImageUtils, WebIO, type Transform } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, type DedupOptions } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import { useState, useRef, type ChangeEvent, useEffect } from "react";
import ModelViewer from "./ModelViewer";

interface FileProgress {
  name: string;
  status: "pending" | "processing" | "completed" | "error";
  result?: Uint8Array;
  error?: string;
  url?: string;
}

export default function FileUploader() {
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Push transform functions to transformsArray
  const transformsArray: ((_options?: DedupOptions) => Transform)[] = [];

  // Set the first completed file as selected model when available
  useEffect(() => {
    const completedFile = files.find(file => file.status === "completed" && file.url);
    if (completedFile && !selectedModel) {
      setSelectedModel(completedFile.url);
    }
  }, [files, selectedModel]);

  const processFiles = async (selectedFiles: File[]) => {
    // Filter only .glb files
    const glbFiles = selectedFiles.filter((file) => file.name.toLowerCase().endsWith(".glb"));

    if (glbFiles.length === 0) return;

    const newFiles = glbFiles.map((file) => ({
      name: file.name,
      status: "pending" as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process files one by one
    for (let i = 0; i < glbFiles.length; i++) {
      const file = glbFiles[i];
      const index = files.length + i;

      try {
        // Update status to processing
        setFiles((prev) => prev.map((f, idx) => (idx === index ? { ...f, status: "processing" } : f)));

        // Create a copy of the file with the correct MIME type
        const fileData = await readFileAsArrayBuffer(file);
        const newFile = new File([fileData], file.name, { type: 'model/gltf-binary' });
        
        // Create a direct URL to the file
        const assetUrl = URL.createObjectURL(newFile);
        console.log("Created asset URL from File object:", assetUrl);

        // Update with result
        setFiles((prev) =>
          prev.map((f, idx) => (idx === index ? { ...f, status: "completed", url: assetUrl } : f))
        );
        
        // Set as selected model if it's the first one
        if (!selectedModel) {
          setSelectedModel(assetUrl);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        setFiles((prev) => prev.map((f, idx) => (idx === index ? { ...f, status: "error", error: String(error) } : f)));
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

  const processGLB = async (uint8Array: Uint8Array): Promise<string> => {
    let totalVRAM = 0;
    const io = new WebIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
      "meshopt.decoder": MeshoptDecoder,
      "meshopt.encoder": MeshoptEncoder,
    });
    
    // Creating GLTF-Transform Document
    const doc = await io.readBinary(uint8Array);

    doc
      .getRoot()
      .listTextures()
      .forEach((tex) => {
        const vram = ImageUtils.getVRAMByteLength(tex.getImage()!, tex.getMimeType());
        totalVRAM += vram!;
      });
    console.log("totalVRAM ", totalVRAM);
    
    transformsArray.push(dedup);

    await doc.transform(...transformsArray.map(fn => fn()));

    // Output optimized GLB
    const glb = await io.writeBinary(doc);
    
    // Create blob with proper MIME type
    const assetBlob = new Blob([glb], { type: 'model/gltf-binary' });
    const assetUrl = URL.createObjectURL(assetBlob);
    
    console.log("Created asset URL:", assetUrl);
    return assetUrl;
  };

  const handleModelSelect = (url: string) => {
    setSelectedModel(url);
  };

  return (
    <div className="app-container">
      <div className="file-uploader-container">
        <div
          className={`file-uploader ${isDragging ? "dragging" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h2>GLB File Uploader</h2>

          <div className="upload-area">
            <p>Drag and drop .glb files here, or</p>
            <input
              type="file"
              multiple
              accept=".glb"
              onChange={handleFileChange}
              disabled={isProcessing}
              ref={fileInputRef}
              id="file-input"
              className="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              Select Files
            </label>
            <p className="file-type-hint">Only .glb files are accepted</p>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <h3>Files:</h3>
              <ul>
                {files.map((file, index) => (
                  <li 
                    key={index} 
                    className={`file-item status-${file.status} ${file.url === selectedModel ? 'selected' : ''}`}
                    onClick={() => file.url && handleModelSelect(file.url)}
                  >
                    <span className="file-name">{file.name}</span>
                    <span className="file-status">
                      {file.status === "pending" && "Pending"}
                      {file.status === "processing" && "Processing..."}
                      {file.status === "completed" && "Completed"}
                      {file.status === "error" && `Error: ${file.error}`}
                    </span>
                    {file.status === "completed" && (
                      <div className="file-result">
                        <small>Result: Uint8Array({file.result?.length} bytes)</small>
                      </div>
                    )}
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





