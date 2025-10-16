import { useState, useEffect, useRef } from "react";
import "./App.css";
import FileUploader from "./Components/FileUploader.tsx";
import { lazySetTheme, userPrefersDarkMode } from "./utilities/utilities.ts";
import { defaultSettings, safelyParseSettings } from "./utilities/settings.ts";
import type { OptimizationSettings, RequiredPick } from "./types.ts";

function App() {
  const [settings, setSettings] = useState<OptimizationSettings>(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem("optimizationSettings");
    if (savedSettings) {
      try {
        return safelyParseSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }

    // Return default settings if no saved settings exist or parsing failed
    return defaultSettings;
  });

  const [showUserSettings, setShowUserSettings] = useState(false);
  const uploaderRef = useRef<{ reprocessAll: () => Promise<void> } | null>(null);

  /* componentDidMount executed once after render (must have empty array dependencies) */
  useEffect(() => {
    if (settings.userSettings.darkMode) {
      lazySetTheme(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save settings to localStorage whenever they change
  // TODO: Check this effect: as settings is an object, React doesn't perform a deep check. This probably executes unnecessarily
  useEffect(() => {
    localStorage.setItem("optimizationSettings", JSON.stringify(settings));
  }, [settings]);

  // Add a function to reset settings to defaults
  // TODO: consider useCallback() for component const functions or use React Compiler, or avoid this pattern in state
  const resetSettings = () => {
    setSettings(defaultSettings);
    lazySetTheme(userPrefersDarkMode());
    localStorage.setItem("optimizationSettings", JSON.stringify(defaultSettings));
  };

  // A generic handler where we are relying on TypeScript to perform well
  const handleSettingChange = <K extends keyof OptimizationSettings>(
    newSettings: RequiredPick<OptimizationSettings, K>
  ) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <>
      <header className="app-header">
        <div className="logo-area">
          <img
            src="/2Asset%201500.svg"
            alt="Icon"
            height={50}
            style={{ filter: settings.userSettings.darkMode ? "invert(1)" : "invert(0)" }}
          />
          <h2>GLB Batch Optimizer</h2>
        </div>
        <div className="header-controls">
          <div className="user-settings">
            <button onClick={() => setShowUserSettings((prev) => !prev)}>User Settings</button>

            {showUserSettings && (
              <div className="user-settings-dropdown">
                <div className="setting-field">
                  <label htmlFor="file-suffix">File Suffix:</label>
                  <input
                    type="text"
                    id="file-suffix"
                    value={settings.userSettings.fileNameSuffix}
                    onChange={(e) =>
                      handleSettingChange({
                        userSettings: {
                          fileNameSuffix: e.target.value,
                          maxFileNameLength: settings.userSettings.maxFileNameLength,
                          shortenFileNames: settings.userSettings.shortenFileNames,
                          darkMode: settings.userSettings.darkMode,
                        },
                      })
                    }
                  />
                </div>

                <div className="setting-field">
                  <input
                    type="checkbox"
                    id="shorten-names"
                    checked={settings.userSettings.shortenFileNames}
                    onChange={(e) =>
                      handleSettingChange({
                        userSettings: {
                          fileNameSuffix: settings.userSettings.fileNameSuffix,
                          maxFileNameLength: settings.userSettings.maxFileNameLength,
                          shortenFileNames: e.target.checked,
                          darkMode: settings.userSettings.darkMode,
                        },
                      })
                    }
                  />
                  <label htmlFor="shorten-names">Shorten File Names</label>
                </div>

                <div className="setting-field">
                  <input
                    type="checkbox"
                    id="dark-theme"
                    checked={settings.userSettings.darkMode}
                    onChange={(e) => {
                      lazySetTheme(e.target.checked);
                      handleSettingChange({
                        userSettings: {
                          fileNameSuffix: settings.userSettings.fileNameSuffix,
                          maxFileNameLength: settings.userSettings.maxFileNameLength,
                          shortenFileNames: settings.userSettings.shortenFileNames,
                          darkMode: e.target.checked,
                        },
                      });
                    }}
                  />
                  <label htmlFor="dark-theme">Dark Theme</label>
                </div>

                {settings.userSettings.shortenFileNames && (
                  <div className="setting-field">
                    <label htmlFor="max-length">Max Length:</label>
                    <input
                      type="number"
                      id="max-length"
                      min="5"
                      max="100"
                      value={settings.userSettings.maxFileNameLength}
                      onChange={(e) =>
                        handleSettingChange({
                          userSettings: {
                            fileNameSuffix: settings.userSettings.fileNameSuffix,
                            maxFileNameLength: parseInt(e.target.value),
                            shortenFileNames: settings.userSettings.shortenFileNames,
                            darkMode: settings.userSettings.darkMode,
                          },
                        })
                      }
                    />
                  </div>
                )}

                <div className="setting-field reset-settings">
                  <button className="reset-btn" onClick={resetSettings}>
                    Reset All Settings
                  </button>
                </div>
              </div>
            )}
          </div>
<button className="reload" onClick={() => uploaderRef.current?.reprocessAll()}>RELOAD</button>
        </div>
      </header>

      <div className="settings-panel">
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enablePrune}
              onChange={(e) => handleSettingChange({ enablePrune: e.target.checked })}
              id="prune-toggle"
            />
            <label htmlFor="prune-toggle">Prune Unused Data</label>
          </div>

          {settings.enablePrune && (
            <div className="setting-options">
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.pruneOptions.keepExtras}
                  onChange={(e) => handleSettingChange({ keepExtras: e.target.checked })}
                  id="prune-keep-extras"
                />
                <label htmlFor="prune-keep-extras">Keep Metadata</label>
              </div>
            </div>
          )}
        </div>

        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableDedup}
              onChange={(e) => handleSettingChange({ enableDedup: e.target.checked })}
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
                  onChange={(e) => handleSettingChange({ accessors: e.target.checked })}
                  id="dedup-accessors"
                />
                <label htmlFor="dedup-accessors">Accessors</label>
              </div>
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.dedupOptions.meshes}
                  onChange={(e) => handleSettingChange({ meshes: e.target.checked })}
                  id="dedup-meshes"
                />
                <label htmlFor="dedup-meshes">Meshes</label>
              </div>
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.dedupOptions.materials}
                  onChange={(e) => handleSettingChange({ materials: e.target.checked })}
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
              onChange={(e) => handleSettingChange({ enableFlatten: e.target.checked })}
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
              onChange={(e) => handleSettingChange({ enableJoin: e.target.checked })}
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
              onChange={(e) => handleSettingChange({ enableWeld: e.target.checked })}
              id="weld-toggle"
            />
            <label htmlFor="weld-toggle">Weld Vertices</label>
          </div>
        </div>

        {/* TextureCompress setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableTextureCompression}
              onChange={(e) => handleSettingChange({ enableTextureCompression: e.target.checked })}
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
                  onChange={(e) =>
                    handleSettingChange({
                      textureCompressionOptions: {
                        format: e.target.value as never,
                        quality: settings.textureCompressionOptions.quality,
                        resize: settings.textureCompressionOptions.resize,
                      },
                    })
                  }
                >
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <div className="setting-option">
                <label htmlFor="texture-quality">Quality:</label>
                <div className="quality-control">
                  <select
                    id="texture-quality-mode"
                    value={settings.textureCompressionOptions.quality === "auto" ? "auto" : "manual"}
                    onChange={(e) => {
                      handleSettingChange({
                        textureCompressionOptions: {
                          format: settings.textureCompressionOptions.format,
                          quality: e.target.value === "auto" ? "auto" : 0.8,
                          resize: settings.textureCompressionOptions.resize,
                        },
                      });
                    }}
                  >
                    <option value="auto">Auto</option>
                    <option value="manual">Manual</option>
                  </select>

                  {settings.textureCompressionOptions.quality !== "auto" && (
                    <div className="slider-container quality-slider">
                      <input
                        type="range"
                        id="texture-quality"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={settings.textureCompressionOptions.quality}
                        onChange={(e) =>
                          handleSettingChange({
                            textureCompressionOptions: {
                              format: settings.textureCompressionOptions.format,
                              quality: parseFloat(e.target.value),
                              resize: settings.textureCompressionOptions.resize,
                            },
                          })
                        }
                        className="slider"
                      />
                      <div className="quality-value">
                        {(settings.textureCompressionOptions.quality * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.textureCompressionOptions.resize !== null}
                  onChange={(e) =>
                    handleSettingChange({
                      textureCompressionOptions: {
                        format: settings.textureCompressionOptions.format,
                        quality: settings.textureCompressionOptions.quality,
                        resize: e.target.checked ? [1024, 1024] : null,
                      },
                    })
                  }
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
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleSettingChange({
                        textureCompressionOptions: {
                          format: settings.textureCompressionOptions.format,
                          quality: settings.textureCompressionOptions.quality,
                          resize: [value, value],
                        },
                      });
                    }}
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

        {/* Resample setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableResample}
              onChange={(e) => handleSettingChange({ enableResample: e.target.checked })}
              id="resample-toggle"
            />
            <label htmlFor="resample-toggle">Resample Animations</label>
          </div>
        </div>

        {/* Sparse setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableSparse}
              onChange={(e) => handleSettingChange({ enableSparse: e.target.checked })}
              id="sparse-toggle"
            />
            <label htmlFor="sparse-toggle">Sparse Accessors</label>
          </div>

          {settings.enableSparse && (
            <div className="setting-options">
              <div className="setting-option">
                <label htmlFor="sparse-ratio">Zero Threshold: {settings.sparseOptions.ratio.toFixed(2)}</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="sparse-ratio"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={settings.sparseOptions.ratio}
                    onChange={(e) =>
                      handleSettingChange({
                        sparseOptions: {
                          ratio: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Strict</span>
                    <span>Lenient</span>
                  </div>
                </div>
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
              onChange={(e) => handleSettingChange({ enableSimplify: e.target.checked })}
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
                    onChange={(e) =>
                      handleSettingChange({
                        simplifyOptions: {
                          ratio: parseFloat(e.target.value),
                          error: settings.simplifyOptions.error,
                        },
                      })
                    }
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
                    onChange={(e) =>
                      handleSettingChange({
                        simplifyOptions: {
                          ratio: settings.simplifyOptions.ratio,
                          error: parseFloat(e.target.value),
                        },
                      })
                    }
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

        {/* Meshopt setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableMeshopt}
              onChange={(e) => handleSettingChange({ enableMeshopt: e.target.checked })}
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
                  onChange={(e) => handleSettingChange({ meshoptOptions: { level: e.target.value as never } })}
                >
                  <option value="high">High (Slower)</option>
                  <option value="medium">Medium (Default)</option>
                  <option value="low">Low (Faster)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Quantize setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableQuantize}
              onChange={(e) => handleSettingChange({ enableQuantize: e.target.checked })}
              id="quantize-toggle"
            />
            <label htmlFor="quantize-toggle">Quantize Attributes</label>
          </div>
        </div>

        {/* Instancing setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableInstance}
              onChange={(e) => handleSettingChange({ enableInstance: e.target.checked })}
              id="instance-toggle"
            />
            <label htmlFor="instance-toggle">Create Instances</label>
          </div>

          {settings.enableInstance && (
            <div className="setting-options">
              <div className="setting-option">
                <label htmlFor="instance-min">Minimum Occurrences: {settings.instanceOptions.min}</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="instance-min"
                    min="2"
                    max="20"
                    step="1"
                    value={settings.instanceOptions.min}
                    onChange={(e) => handleSettingChange({ instanceOptions: { min: parseInt(e.target.value) } })}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Few</span>
                    <span>Many</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableCenter}
              onChange={(e) => handleSettingChange({ enableCenter: e.target.checked })}
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
                  onChange={(e) => handleSettingChange({ centerOptions: { pivot: e.target.value as never } })}
                >
                  <option value="center">Center (Default)</option>
                  <option value="bottom">Bottom</option>
                  <option value="origin">Origin (0,0,0)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Palette setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enablePalette}
              onChange={(e) => handleSettingChange({ enablePalette: e.target.checked })}
              id="palette-toggle"
            />
            <label htmlFor="palette-toggle">Create Color Palettes</label>
          </div>

          {settings.enablePalette && (
            <div className="setting-options">
              <div className="setting-option">
                <label htmlFor="palette-min">Minimum Colors: {settings.paletteOptions.min}</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="palette-min"
                    min="2"
                    max="64"
                    step="1"
                    value={settings.paletteOptions.min}
                    onChange={(e) => handleSettingChange({ paletteOptions: { min: parseInt(e.target.value) } })}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Few</span>
                    <span>Many</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Normals setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableNormals}
              onChange={(e) => handleSettingChange({ enableNormals: e.target.checked })}
              id="normals-toggle"
            />
            <label htmlFor="normals-toggle">Compute Normals</label>
          </div>

          {settings.enableNormals && (
            <div className="setting-options">
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.normalsOptions.overwrite}
                  onChange={(e) => handleSettingChange({ normalsOptions: { overwrite: e.target.checked } })}
                  id="normals-overwrite"
                />
                <label htmlFor="normals-overwrite">Overwrite Existing</label>
              </div>
            </div>
          )}
        </div>

        {/* Metal-Rough setting group */}
        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableMetalRough}
              onChange={(e) => handleSettingChange({ enableMetalRough: e.target.checked })}
              id="metal-rough-toggle"
            />
            <label htmlFor="metal-rough-toggle">Convert to Metal-Rough</label>
          </div>
        </div>

        <div className="setting-group">
          <div className="setting-group-title">
            <input
              type="checkbox"
              checked={settings.enableMaterialsOptions}
              onChange={(e) => handleSettingChange({ enableMaterialsOptions: e.target.checked })}
              id="materials-options-toggle"
            />
            <label htmlFor="materials-options-toggle">Materials Options</label>
          </div>

          {settings.enableMaterialsOptions && (
            <div className="setting-options">
              <div className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.materialsOptions.doubleSided}
                  onChange={(e) => handleSettingChange({ materialsOptions: { doubleSided: e.target.checked } })}
                  id="materials-doubleSided-toggle"
                />
                <label htmlFor="materials-doubleSided-toggle">doubleSided</label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="app-container with-settings">
        <FileUploader ref={uploaderRef} settings={settings} />
      </div>

      <footer className="app-footer">
        <p>
          Created by{" "}
          <a href="https://babylonpress.org" target="_blank" rel="noopener noreferrer">
            BabylonPress.org
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
