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
    quality: 'auto' | number;
    resize: [number, number] | null;
  };
  enableFlatten: boolean;
  enableJoin: boolean;
  enableWeld: boolean;
  enableSimplify: boolean;
  simplifyOptions: {
    ratio: number;
    error: number;
  };
  enableCenter: boolean;
  centerOptions: {
    pivot: 'center' | 'bottom' | 'origin';
  };
  enableMeshopt: boolean;
  meshoptOptions: {
    level: 'high' | 'medium' | 'low';
  };
}

function App() {
  const [settings, setSettings] = useState<OptimizationSettings>({
    enableDedup: true,
    dedupOptions: {
      accessors: true,
      meshes: true,
      materials: true,
    },
    enableTextureCompression: true,
    textureCompressionOptions: {
      format: 'webp',
      quality: 'auto',
      resize: [1024, 1024]
    },
    enableFlatten: true,
    enableJoin: true,
    enableWeld: true,
    enableSimplify: true,
    simplifyOptions: {
      ratio: 0.75,
      error: 0.01
    },
    enableCenter: false,
    centerOptions: {
      pivot: 'center'
    },
    enableMeshopt: false,
    meshoptOptions: {
      level: 'medium'
    }
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

  const handleSimplifyOptionChange = (
    option: keyof OptimizationSettings['simplifyOptions'], 
    value: number
  ) => {
    setSettings(prev => ({
      ...prev,
      simplifyOptions: {
        ...prev.simplifyOptions,
        [option]: value
      }
    }));
  };

  const handleCenterOptionChange = (
    option: keyof OptimizationSettings['centerOptions'], 
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      centerOptions: {
        ...prev.centerOptions,
        [option]: value
      }
    }));
  };

  const handleMeshoptOptionChange = (
    option: keyof OptimizationSettings['meshoptOptions'], 
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      meshoptOptions: {
        ...prev.meshoptOptions,
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
        
        {/* Flatten setting group */}
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
        
        {/* Join setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableJoin}
              onChange={(e) => handleSettingChange('enableJoin', e.target.checked)}
              id="join-toggle"
            />
            <label htmlFor="join-toggle">Join Meshes</label>
          </div>
        </div>
        
        {/* Weld setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableWeld}
              onChange={(e) => handleSettingChange('enableWeld', e.target.checked)}
              id="weld-toggle"
            />
            <label htmlFor="weld-toggle">Weld Vertices</label>
          </div>
        </div>
        
        {/* Center setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableCenter}
              onChange={(e) => handleSettingChange('enableCenter', e.target.checked)}
              id="center-toggle"
            />
            <label htmlFor="center-toggle">Center Model</label>
          </div>
          
          {settings.enableCenter && (
            <div className="setting-options">
              <div className="setting-option">
                <label htmlFor="center-pivot">Pivot Point:</label>
                <select
                  id="center-pivot"
                  value={settings.centerOptions.pivot}
                  onChange={(e) => handleCenterOptionChange('pivot', e.target.value)}
                >
                  <option value="center">Center (Default)</option>
                  <option value="bottom">Bottom</option>
                  <option value="origin">Origin (0,0,0)</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Meshopt setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableMeshopt}
              onChange={(e) => handleSettingChange('enableMeshopt', e.target.checked)}
              id="meshopt-toggle"
            />
            <label htmlFor="meshopt-toggle">Meshopt Compression</label>
          </div>
          
          {settings.enableMeshopt && (
            <div className="setting-options">
              <div className="setting-option">
                <label htmlFor="meshopt-level">Compression Level:</label>
                <select
                  id="meshopt-level"
                  value={settings.meshoptOptions.level}
                  onChange={(e) => handleMeshoptOptionChange('level', e.target.value)}
                >
                  <option value="high">High (Slower)</option>
                  <option value="medium">Medium (Default)</option>
                  <option value="low">Low (Faster)</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Simplify setting group with options */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableSimplify}
              onChange={(e) => handleSettingChange('enableSimplify', e.target.checked)}
              id="simplify-toggle"
            />
            <label htmlFor="simplify-toggle">Simplify Meshes</label>
          </div>
          
          {settings.enableSimplify && (
            <div className="setting-options">
              <div className="setting-option">
                <label htmlFor="simplify-ratio">Ratio: {settings.simplifyOptions.ratio.toFixed(2)}</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="simplify-ratio"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={settings.simplifyOptions.ratio}
                    onChange={(e) => handleSimplifyOptionChange('ratio', parseFloat(e.target.value))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Heavy</span>
                    <span>Light</span>
                  </div>
                </div>
              </div>
              <div className="setting-option">
                <label htmlFor="simplify-error">Error Tolerance: {settings.simplifyOptions.error.toFixed(3)}</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="simplify-error"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={settings.simplifyOptions.error}
                    onChange={(e) => handleSimplifyOptionChange('error', parseFloat(e.target.value))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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




















