'use client';

import * as React from 'react';
import { TitleComponent, TitlePresets } from './TitleComponent';

/**
 * TitleComponent Examples
 *
 * Demonstrates various use cases and styling options for the TitleComponent.
 */

export function TitleComponentExamples() {
  const [text1, setText1] = React.useState('Dashboard Overview');
  const [text2, setText2] = React.useState('Campaign Performance Metrics');
  const [text3, setText3] = React.useState('Welcome to Analytics Platform');

  return (
    <div className="space-y-8 p-8 bg-gray-50">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Heading Levels</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="H1 - Main Page Title"
            headingLevel="h1"
            fontSize="32"
            fontWeight="700"
            color="#1F2937"
          />

          <TitleComponent
            text="H2 - Section Heading"
            headingLevel="h2"
            fontSize="24"
            fontWeight="600"
            color="#374151"
          />

          <TitleComponent
            text="H3 - Subsection Heading"
            headingLevel="h3"
            fontSize="20"
            fontWeight="600"
            color="#4B5563"
          />

          <TitleComponent
            text="H4 - Card Title"
            headingLevel="h4"
            fontSize="18"
            fontWeight="500"
            color="#6B7280"
          />

          <TitleComponent
            text="H5 - Small Heading"
            headingLevel="h5"
            fontSize="16"
            fontWeight="500"
            color="#6B7280"
          />

          <TitleComponent
            text="H6 - Tiny Heading"
            headingLevel="h6"
            fontSize="14"
            fontWeight="500"
            color="#9CA3AF"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Text Alignment</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="Left Aligned Title"
            headingLevel="h3"
            fontSize="20"
            fontWeight="600"
            alignment="left"
          />

          <TitleComponent
            text="Center Aligned Title"
            headingLevel="h3"
            fontSize="20"
            fontWeight="600"
            alignment="center"
          />

          <TitleComponent
            text="Right Aligned Title"
            headingLevel="h3"
            fontSize="20"
            fontWeight="600"
            alignment="right"
          />

          <TitleComponent
            text="Justified text alignment distributes text evenly across the width of the container for a clean, balanced appearance"
            headingLevel="h3"
            fontSize="16"
            fontWeight="400"
            alignment="justify"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Font Weights</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="Light (300)"
            fontSize="20"
            fontWeight="300"
          />

          <TitleComponent
            text="Regular (400)"
            fontSize="20"
            fontWeight="400"
          />

          <TitleComponent
            text="Medium (500)"
            fontSize="20"
            fontWeight="500"
          />

          <TitleComponent
            text="Semibold (600)"
            fontSize="20"
            fontWeight="600"
          />

          <TitleComponent
            text="Bold (700)"
            fontSize="20"
            fontWeight="700"
          />

          <TitleComponent
            text="Extrabold (800)"
            fontSize="20"
            fontWeight="800"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Color Variations</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="Primary Blue Title"
            fontSize="24"
            fontWeight="600"
            color="#1A73E8"
          />

          <TitleComponent
            text="Success Green Title"
            fontSize="24"
            fontWeight="600"
            color="#34A853"
          />

          <TitleComponent
            text="Warning Orange Title"
            fontSize="24"
            fontWeight="600"
            color="#FBBC04"
          />

          <TitleComponent
            text="Error Red Title"
            fontSize="24"
            fontWeight="600"
            color="#EA4335"
          />

          <TitleComponent
            text="Neutral Gray Title"
            fontSize="24"
            fontWeight="600"
            color="#5F6368"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Background & Border Styling</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="Title with Background"
            fontSize="20"
            fontWeight="600"
            color="#1F2937"
            backgroundColor="#F3F4F6"
            padding={12}
            borderRadius={6}
          />

          <TitleComponent
            text="Title with Border"
            fontSize="20"
            fontWeight="600"
            color="#1F2937"
            showBorder={true}
            borderColor="#D1D5DB"
            borderWidth={2}
            padding={12}
            borderRadius={6}
          />

          <TitleComponent
            text="Highlighted Title Box"
            fontSize="20"
            fontWeight="600"
            color="#FFFFFF"
            backgroundColor="#1A73E8"
            padding={16}
            borderRadius={8}
          />

          <TitleComponent
            text="Title with Shadow"
            fontSize="20"
            fontWeight="600"
            color="#1F2937"
            backgroundColor="#FFFFFF"
            showShadow={true}
            shadowColor="#00000020"
            shadowBlur={15}
            padding={16}
            borderRadius={8}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Editable Titles</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Click the title below to edit it:</p>
            <TitleComponent
              text={text1}
              onTextChange={setText1}
              headingLevel="h2"
              fontSize="28"
              fontWeight="600"
              color="#1A73E8"
              editable={true}
            />
            <p className="text-xs text-gray-500 mt-2">Current value: {text1}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Another editable title with different styling:</p>
            <TitleComponent
              text={text2}
              onTextChange={setText2}
              headingLevel="h3"
              fontSize="20"
              fontWeight="500"
              color="#374151"
              backgroundColor="#F9FAFB"
              padding={12}
              borderRadius={6}
              editable={true}
            />
            <p className="text-xs text-gray-500 mt-2">Current value: {text2}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Using Presets</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="Page Header Preset"
            {...TitlePresets.pageHeader}
          />

          <TitleComponent
            text="Section Title Preset"
            {...TitlePresets.sectionTitle}
          />

          <TitleComponent
            text="Subsection Title Preset"
            {...TitlePresets.subsectionTitle}
          />

          <TitleComponent
            text="Card Title Preset"
            {...TitlePresets.cardTitle}
          />

          <TitleComponent
            text="Centered Hero Preset"
            {...TitlePresets.centeredHero}
          />

          <TitleComponent
            text="Highlight Preset"
            {...TitlePresets.highlight}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Font Families</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="Inter Font (Default)"
            fontSize="20"
            fontWeight="600"
            fontFamily="Inter, system-ui, sans-serif"
          />

          <TitleComponent
            text="Roboto Font"
            fontSize="20"
            fontWeight="600"
            fontFamily="Roboto, sans-serif"
          />

          <TitleComponent
            text="Georgia Font (Serif)"
            fontSize="20"
            fontWeight="600"
            fontFamily="Georgia, serif"
          />

          <TitleComponent
            text="Courier New (Monospace)"
            fontSize="20"
            fontWeight="600"
            fontFamily="'Courier New', monospace"
          />

          <TitleComponent
            text="System UI Font"
            fontSize="20"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Real-World Dashboard Examples</h2>

        <div className="bg-gray-100 p-6 rounded-lg space-y-6">
          {/* Dashboard Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <TitleComponent
              text="Marketing Analytics Dashboard"
              headingLevel="h1"
              fontSize="32"
              fontWeight="700"
              color="#1F2937"
              alignment="left"
            />
          </div>

          {/* Section with Title */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <TitleComponent
              text="Campaign Performance Overview"
              headingLevel="h2"
              fontSize="24"
              fontWeight="600"
              color="#374151"
              padding={0}
              showBorder={false}
            />
            <div className="mt-4 h-40 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              [Chart would go here]
            </div>
          </div>

          {/* Card with Title */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <TitleComponent
              text="Top Performing Keywords"
              headingLevel="h3"
              fontSize="18"
              fontWeight="600"
              color="#4B5563"
            />
            <div className="mt-4 h-32 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              [Table would go here]
            </div>
          </div>

          {/* Highlighted Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <TitleComponent
              text="Key Insights"
              headingLevel="h2"
              fontSize="20"
              fontWeight="600"
              color="#FFFFFF"
              backgroundColor="#1A73E8"
              padding={16}
              alignment="center"
            />
            <div className="p-6 h-32 bg-white flex items-center justify-center text-gray-400">
              [Content would go here]
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Responsive Font Sizes</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <TitleComponent
            text="Extra Small (12px)"
            fontSize="12"
            fontWeight="600"
          />

          <TitleComponent
            text="Small (14px)"
            fontSize="14"
            fontWeight="600"
          />

          <TitleComponent
            text="Base (16px)"
            fontSize="16"
            fontWeight="600"
          />

          <TitleComponent
            text="Large (20px)"
            fontSize="20"
            fontWeight="600"
          />

          <TitleComponent
            text="Extra Large (24px)"
            fontSize="24"
            fontWeight="600"
          />

          <TitleComponent
            text="2XL (28px)"
            fontSize="28"
            fontWeight="600"
          />

          <TitleComponent
            text="3XL (32px)"
            fontSize="32"
            fontWeight="600"
          />

          <TitleComponent
            text="4XL (40px)"
            fontSize="40"
            fontWeight="600"
          />

          <TitleComponent
            text="5XL (48px)"
            fontSize="48"
            fontWeight="700"
          />
        </div>
      </div>
    </div>
  );
}

export default TitleComponentExamples;
