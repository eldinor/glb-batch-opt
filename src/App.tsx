import { useState, useEffect } from 'react'
import './App.css'
import FileUploader from './FileUploader'

interface OptimizationSettings {
  enableDedup: boolean;
  dedupOptions: {
    accessors: boolean;
    meshes: boolean;
    materials: boolean;
  };
  enableTextureCompression: boolean;
  textureCompressionOptions: {
    format: 'webp' | 'jpeg' | 'png';
    quality: 'auto' | number; // Changed to allow 'auto' or a number
    resize: [number, number] | null;
  };
  enableFlatten: boolean; // Add new flatten option
}

function App() {
  const [settings, setSettings] = useState<OptimizationSettings>({
    enableDedup: true,
    dedupOptions: {
      accessors: true,
      meshes: true,
      materials: true,
    },
    enableTextureCompression: true, // Changed to true by default
    textureCompressionOptions: {
      format: 'webp',
      quality: 'auto', // Changed to 'auto'
      resize: [1024, 1024]
    },
    enableFlatten: true // Set to true by default
  });

  const handleSettingChange = (
    settingType: keyof OptimizationSettings, 
    value: boolean | any
  ) => {
    setSettings(prev => ({
      ...prev,
      [settingType]: value
    }));
  };

  const handleDedupOptionChange = (
    option: keyof OptimizationSettings['dedupOptions'], 
    value: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      dedupOptions: {
        ...prev.dedupOptions,
        [option]: value
      }
    }));
  };

  const handleTextureCompressionOptionChange = (
    option: keyof OptimizationSettings['textureCompressionOptions'],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      textureCompressionOptions: {
        ...prev.textureCompressionOptions,
        [option]: value
      }
    }));
  };

  return (
    <>
      <header className="app-header">
        <div className="header-controls">
          {/* Any additional header controls can go here */}
        </div>
      </header>

      <div className="settings-panel">
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableDedup}
              onChange={(e) => handleSettingChange('enableDedup', e.target.checked)}
              id="dedup-toggle"
            />
            <label htmlFor="dedup-toggle">Deduplication</label>
          </div>
          
          {settings.enableDedup && (
            <div className="setting-options">
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.dedupOptions.accessors}
                  onChange={(e) => handleDedupOptionChange('accessors', e.target.checked)}
                  id="dedup-accessors"
                />
                <label htmlFor="dedup-accessors">Accessors</label>
              </div>
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.dedupOptions.meshes}
                  onChange={(e) => handleDedupOptionChange('meshes', e.target.checked)}
                  id="dedup-meshes"
                />
                <label htmlFor="dedup-meshes">Meshes</label>
              </div>
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.dedupOptions.materials}
                  onChange={(e) => handleDedupOptionChange('materials', e.target.checked)}
                  id="dedup-materials"
                />
                <label htmlFor="dedup-materials">Materials</label>
              </div>
            </div>
          )}
        </div>
        
        {/* Add new flatten setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableFlatten}
              onChange={(e) => handleSettingChange('enableFlatten', e.target.checked)}
              id="flatten-toggle"
            />
            <label htmlFor="flatten-toggle">Flatten Node Hierarchy</label>
          </div>
        </div>
        
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableTextureCompression}
              onChange={(e) => handleSettingChange('enableTextureCompression', e.target.checked)}
              id="texture-compression-toggle"
            />
            <label htmlFor="texture-compression-toggle">Texture Compression</label>
          </div>
          
          {settings.enableTextureCompression && (
            <div className="setting-options">
              <div className="setting-option">
                <label htmlFor="texture-format">Format:</label>
                <select 
                  id="texture-format"
                  value={settings.textureCompressionOptions.format}
                  onChange={(e) => handleTextureCompressionOptionChange('format', e.target.value)}
                >
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.textureCompressionOptions.resize !== null}
                  onChange={(e) => handleTextureCompressionOptionChange(
                    'resize', 
                    e.target.checked ? [1024, 1024] : null
                  )}
                  id="texture-resize"
                />
                <label htmlFor="texture-resize">Resize Textures</label>
              </div>
              {settings.textureCompressionOptions.resize && (
                <div className="setting-option">
                  <label htmlFor="texture-size">Max Size:</label>
                  <select
                    id="texture-size"
                    value={settings.textureCompressionOptions.resize[0]}
                    onChange={(e) => handleTextureCompressionOptionChange(
                      'resize', 
                      [parseInt(e.target.value), parseInt(e.target.value)]
                    )}
                  >
                    <option value="256">256 x 256</option>
                    <option value="512">512 x 512</option>
                    <option value="1024">1024 x 1024</option>
                    <option value="2048">2048 x 2048</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="app-container with-settings">
        <FileUploader settings={settings} />
      </div>
    </>
  )
}

export default App













