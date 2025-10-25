import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, ExternalLink } from 'lucide-react';

export interface ImageConfig {
  type: 'upload' | 'url';
  src?: string;
  file?: File;
  alt: string;
  width?: number;
  height?: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  link?: string;
  linkTarget?: '_blank' | '_self';
  borderRadius?: number;
}

interface ImageComponentProps {
  config: ImageConfig;
  onChange: (config: ImageConfig) => void;
  isEditing?: boolean;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
  config,
  onChange,
  isEditing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(config.type || 'upload');
  const [imageUrl, setImageUrl] = useState(config.src || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    config.src || (config.file ? URL.createObjectURL(config.file) : null)
  );
  const [showLinkInput, setShowLinkInput] = useState(!!config.link);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Update config
    onChange({
      ...config,
      type: 'upload',
      file,
      src: undefined,
    });
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);

    // Validate URL format
    if (url && !url.match(/^https?:\/\/.+/)) {
      return;
    }

    setPreviewUrl(url);
    onChange({
      ...config,
      type: 'url',
      src: url,
      file: undefined,
    });
  };

  const handleRemoveImage = () => {
    if (previewUrl && config.file) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageUrl('');
    onChange({
      ...config,
      type: 'upload',
      src: undefined,
      file: undefined,
    });
  };

  const handleAltTextChange = (alt: string) => {
    onChange({ ...config, alt });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onChange({ ...config, [dimension]: numValue });
  };

  const handleObjectFitChange = (objectFit: ImageConfig['objectFit']) => {
    onChange({ ...config, objectFit });
  };

  const handleLinkChange = (link: string) => {
    onChange({ ...config, link: link || undefined });
  };

  const handleLinkTargetChange = (linkTarget: '_blank' | '_self') => {
    onChange({ ...config, linkTarget });
  };

  const handleBorderRadiusChange = (value: string) => {
    const numValue = value ? parseInt(value, 10) : 0;
    onChange({ ...config, borderRadius: numValue });
  };

  // Render the actual image display
  const renderImage = () => {
    if (!previewUrl) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">No image selected</p>
          </div>
        </div>
      );
    }

    const imageStyle: React.CSSProperties = {
      width: config.width ? `${config.width}px` : '100%',
      height: config.height ? `${config.height}px` : 'auto',
      objectFit: config.objectFit,
      borderRadius: config.borderRadius ? `${config.borderRadius}px` : '0',
      maxWidth: '100%',
    };

    const imageElement = (
      <img
        src={previewUrl}
        alt={config.alt || 'Uploaded image'}
        style={imageStyle}
        className="transition-all duration-200"
      />
    );

    // Wrap in link if configured
    if (config.link && !isEditing) {
      return (
        <a
          href={config.link}
          target={config.linkTarget || '_self'}
          rel={config.linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className="inline-block hover:opacity-90 transition-opacity"
        >
          {imageElement}
        </a>
      );
    }

    return imageElement;
  };

  // If not editing, just show the image
  if (!isEditing) {
    return (
      <div className="image-component">
        {renderImage()}
      </div>
    );
  }

  // Editing mode - show full controls
  return (
    <div className="image-component-editor space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Image Source Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'upload'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'url'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          URL
        </button>
      </div>

      {/* Upload Tab Content */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!previewUrl ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, SVG up to 5MB
              </p>
            </button>
          ) : (
            <div className="relative">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {renderImage()}
              </div>
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* URL Tab Content */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {previewUrl && (
            <div className="relative">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {renderImage()}
              </div>
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Alt Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={config.alt}
          onChange={(e) => handleAltTextChange(e.target.value)}
          placeholder="Describe the image for accessibility"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Required for accessibility (screen readers)
        </p>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (px)
          </label>
          <input
            type="number"
            value={config.width || ''}
            onChange={(e) => handleDimensionChange('width', e.target.value)}
            placeholder="Auto"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={config.height || ''}
            onChange={(e) => handleDimensionChange('height', e.target.value)}
            placeholder="Auto"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Object Fit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Fit
        </label>
        <select
          value={config.objectFit}
          onChange={(e) => handleObjectFitChange(e.target.value as ImageConfig['objectFit'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cover">Cover (fill container, may crop)</option>
          <option value="contain">Contain (fit inside, may show margins)</option>
          <option value="fill">Fill (stretch to container)</option>
          <option value="none">None (original size)</option>
          <option value="scale-down">Scale Down (smaller of none or contain)</option>
        </select>
      </div>

      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Radius (px)
        </label>
        <input
          type="number"
          value={config.borderRadius || 0}
          onChange={(e) => handleBorderRadiusChange(e.target.value)}
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center space-x-2 mt-2">
          {[0, 4, 8, 16, 9999].map((radius) => (
            <button
              key={radius}
              onClick={() => handleBorderRadiusChange(String(radius))}
              className={`px-3 py-1 text-xs border rounded transition-colors ${
                (config.borderRadius || 0) === radius
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {radius === 9999 ? 'Full' : radius === 0 ? 'None' : `${radius}px`}
            </button>
          ))}
        </div>
      </div>

      {/* Link Wrapping */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Link Wrapping
          </label>
          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showLinkInput
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showLinkInput ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {showLinkInput && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={config.link || ''}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Target
              </label>
              <div className="flex space-x-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="_self"
                    checked={config.linkTarget !== '_blank'}
                    onChange={() => handleLinkTargetChange('_self')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Same Tab</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="_blank"
                    checked={config.linkTarget === '_blank'}
                    onChange={() => handleLinkTargetChange('_blank')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">New Tab</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Label */}
      {previewUrl && (
        <div className="text-xs text-gray-500 text-center">
          Preview shown above • Click to edit properties
        </div>
      )}
    </div>
  );
};

export default ImageComponent;
