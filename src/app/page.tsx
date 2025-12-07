'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, ImagePlus } from 'lucide-react';

export default function NewspaperEditor() {
  const [heading, setHeading] = useState('');
  const [headingSize, setHeadingSize] = useState(32);
  const [headingColor, setHeadingColor] = useState('#000000');
  
  const [image, setImage] = useState<string | null>(null);
  const [imageHeight, setImageHeight] = useState(400);
  const [imageWidth, setImageWidth] = useState(100);
  const [imageObjectFit, setImageObjectFit] = useState<'contain' | 'cover' | 'fill' | 'scale-down'>('contain');
  
  const [imageDescription, setImageDescription] = useState('');
  const [imageDescSize, setImageDescSize] = useState(14);
  const [imageDescColor, setImageDescColor] = useState('#666666');
  
  const [placeAndDate, setPlaceAndDate] = useState('');
  const [placeDateSize, setPlaceDateSize] = useState(16);
  const [placeDateColor, setPlaceDateColor] = useState('#000000');
  
  const [mainContent, setMainContent] = useState('');
  const [contentSize, setContentSize] = useState(16);
  const [contentColor, setContentColor] = useState('#000000');
  
  const [bgColor, setBgColor] = useState('#ffffff');
  const [layout, setLayout] = useState('layout1');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadAsJPEG = async () => {
    if (!previewRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;

      // Clone the element to avoid modifying the original
      const element = previewRef.current;
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Append clone to body temporarily (off-screen) - do this first
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);

      // Convert modern CSS colors to rgb/hex format to avoid html2canvas parse errors
      const convertColors = (el: HTMLElement) => {
        const computedStyle = window.getComputedStyle(el);
        
        // Convert all color-related properties
        const colorProps = [
          'color', 'backgroundColor', 'borderColor', 
          'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
          'outlineColor', 'textDecorationColor', 'columnRuleColor'
        ];
        
        colorProps.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value.trim() && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
            // Force the computed color value onto the element
            el.style.setProperty(prop, value);
          }
        });

        // Recursively process all children
        Array.from(el.children).forEach(child => convertColors(child as HTMLElement));
      };

      // Apply color conversion
      convertColors(clone);
      
      // Force background color on the root element
      clone.style.backgroundColor = bgColor;

      const canvas = await html2canvas(clone, {
        backgroundColor: null, // Disable auto background color parsing
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[style*="position: absolute"]') as HTMLElement;
          if (clonedElement) {
            // Ensure background is set on cloned element too
            clonedElement.style.backgroundColor = bgColor;
          }
        }
      });

      // Remove clone
      document.body.removeChild(clone);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `newspaper-article-${Date.now()}.jpeg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const renderPreview = () => {
    switch (layout) {
      case 'layout1':
        return (
          <div 
            ref={previewRef} 
            className="w-full min-h-[600px] p-12" 
            style={{ backgroundColor: bgColor }}
          >
            {heading && (
              <h1 
                className="font-bold mb-6 text-center pb-4"
                style={{ 
                  fontSize: `${headingSize}px`, 
                  color: headingColor,
                }}
              >
                {heading}
              </h1>
            )}
            
            {image && (
              <div className="mb-4 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={image} 
                  alt="Article" 
                  className="rounded-lg shadow-lg"
                  style={{ 
                    height: `${imageHeight}px`,
                    width: `${imageWidth}%`,
                    objectFit: imageObjectFit
                  }}
                />
              </div>
            )}
            
            {imageDescription && (
              <p 
                className="italic mb-6 text-center"
                style={{ 
                  fontSize: `${imageDescSize}px`, 
                  color: imageDescColor 
                }}
              >
                {imageDescription}
              </p>
            )}
            
            {mainContent && (
              <p 
                className="leading-relaxed whitespace-pre-wrap text-justify"
                style={{ 
                  fontSize: `${contentSize}px`, 
                  color: contentColor 
                }}
              >
                {placeAndDate && (
                  <span 
                    className="font-semibold mr-2"
                    style={{ 
                      fontSize: `${placeDateSize}px`, 
                      color: placeDateColor 
                    }}
                  >
                    {placeAndDate}:
                  </span>
                )}
                {mainContent}
              </p>
            )}
          </div>
        );

      case 'layout2':
        return (
          <div 
            ref={previewRef} 
            className="w-full min-h-[600px] p-12" 
            style={{ backgroundColor: bgColor }}
          >
            {heading && (
              <h1 
                className="font-bold mb-6 pl-4"
                style={{ 
                  fontSize: `${headingSize}px`, 
                  color: headingColor,
                  borderLeft: `4px solid ${headingColor}`
                }}
              >
                {heading}
              </h1>
            )}
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                {image && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={image} 
                      alt="Article" 
                      className="w-full rounded-lg shadow-lg"
                      style={{ 
                        height: `${imageHeight}px`,
                        objectFit: imageObjectFit
                      }}
                    />
                  </>
                )}
                {imageDescription && (
                  <p 
                    className="italic mt-3"
                    style={{ 
                      fontSize: `${imageDescSize}px`, 
                      color: imageDescColor 
                    }}
                  >
                    {imageDescription}
                  </p>
                )}
              </div>
              
              <div>
                {placeAndDate && (
                  <p 
                    className="font-semibold mb-4"
                    style={{ 
                      fontSize: `${placeDateSize}px`, 
                      color: placeDateColor 
                    }}
                  >
                    {placeAndDate}
                  </p>
                )}
                {mainContent && (
                  <p 
                    className="leading-relaxed whitespace-pre-wrap text-justify"
                    style={{ 
                      fontSize: `${contentSize}px`, 
                      color: contentColor 
                    }}
                  >
                    {mainContent}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'layout3':
        return (
          <div 
            ref={previewRef} 
            className="w-full min-h-[600px] p-12" 
            style={{ backgroundColor: bgColor }}
          >
            <div 
              className="border-4 p-8 rounded-lg"
              style={{ borderColor: headingColor }}
            >
              {heading && (
                <h1 
                  className="font-bold mb-6 text-center"
                  style={{ 
                    fontSize: `${headingSize}px`, 
                    color: headingColor 
                  }}
                >
                  {heading}
                </h1>
              )}
              
              {placeAndDate && (
                <p 
                  className="font-semibold mb-6 text-center uppercase tracking-wide"
                  style={{ 
                    fontSize: `${placeDateSize}px`, 
                    color: placeDateColor 
                  }}
                >
                  {placeAndDate}
                </p>
              )}
              
              {image && (
                <div className="mb-4 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={image} 
                    alt="Article" 
                    className="rounded"
                    style={{ 
                      height: `${imageHeight}px`,
                      width: `${imageWidth}%`,
                      objectFit: imageObjectFit
                    }}
                  />
                </div>
              )}
              
              {imageDescription && (
                <p 
                  className="italic mb-6 text-center border-t border-b py-3"
                  style={{ 
                    fontSize: `${imageDescSize}px`, 
                    color: imageDescColor,
                    borderColor: imageDescColor
                  }}
                >
                  {imageDescription}
                </p>
              )}
              
              {mainContent && (
                <p 
                  className="leading-relaxed whitespace-pre-wrap text-justify"
                  style={{ 
                    fontSize: `${contentSize}px`, 
                    color: contentColor 
                  }}
                >
                  {mainContent}
                </p>
              )}
            </div>
          </div>
        );

      case 'layout4':
        return (
          <div 
            ref={previewRef} 
            className="w-full min-h-[600px] p-12" 
            style={{ backgroundColor: bgColor }}
          >
            {heading && (
              <h1 
                className="font-bold mb-4 text-right"
                style={{ 
                  fontSize: `${headingSize}px`, 
                  color: headingColor 
                }}
              >
                {heading}
              </h1>
            )}
            
            {placeAndDate && (
              <p 
                className="font-semibold mb-6 text-right uppercase tracking-widest"
                style={{ 
                  fontSize: `${placeDateSize}px`, 
                  color: placeDateColor 
                }}
              >
                {placeAndDate}
              </p>
            )}
            
            <div className="flex gap-8 items-start">
              <div className="flex-1">
                {mainContent && (
                  <p 
                    className="leading-relaxed whitespace-pre-wrap text-justify"
                    style={{ 
                      fontSize: `${contentSize}px`, 
                      color: contentColor 
                    }}
                  >
                    {mainContent}
                  </p>
                )}
              </div>
              
              <div className="w-1/3">
                {image && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={image} 
                      alt="Article" 
                      className="w-full rounded-lg shadow-xl sticky top-8"
                      style={{ 
                        height: `${imageHeight}px`,
                        objectFit: imageObjectFit
                      }}
                    />
                  </>
                )}
                {imageDescription && (
                  <p 
                    className="italic mt-3"
                    style={{ 
                      fontSize: `${imageDescSize}px`, 
                      color: imageDescColor 
                    }}
                  >
                    {imageDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'layout5':
        return (
          <div 
            ref={previewRef} 
            className="w-full min-h-[600px] p-12" 
            style={{ backgroundColor: bgColor }}
          >
            <div className="max-w-5xl mx-auto">
              {image && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={image} 
                    alt="Article" 
                    className="w-full rounded-t-lg"
                    style={{ 
                      height: `${imageHeight}px`,
                      objectFit: imageObjectFit
                    }}
                  />
                </>
              )}
              
              <div className="p-8">
                {heading && (
                  <h1 
                    className="font-bold mb-4"
                    style={{ 
                      fontSize: `${headingSize}px`, 
                      color: headingColor 
                    }}
                  >
                    {heading}
                  </h1>
                )}
                
                {placeAndDate && (
                  <p 
                    className="font-semibold mb-6 uppercase"
                    style={{ 
                      fontSize: `${placeDateSize}px`, 
                      color: placeDateColor 
                    }}
                  >
                    {placeAndDate}
                  </p>
                )}
                
                {imageDescription && (
                  <p 
                    className="italic mb-6 pb-4 border-b"
                    style={{ 
                      fontSize: `${imageDescSize}px`, 
                      color: imageDescColor,
                      borderColor: imageDescColor
                    }}
                  >
                    {imageDescription}
                  </p>
                )}
                
                {mainContent && (
                  <p 
                    className="leading-relaxed whitespace-pre-wrap text-justify"
                    style={{ 
                      fontSize: `${contentSize}px`, 
                      color: contentColor,
                      columnCount: 2,
                      columnGap: '2rem'
                    }}
                  >
                    {mainContent}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="w-1/2 h-full overflow-y-auto border-r border-border">
        <div className="p-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heading">Heading</Label>
                <div className="flex gap-2">
                  <Input
                    id="heading"
                    placeholder="Enter heading..."
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={headingSize}
                    onChange={(e) => setHeadingSize(Number(e.target.value))}
                    min="12"
                    max="72"
                    className="w-16"
                    title="Font Size"
                  />
                  <Input
                    type="color"
                    value={headingColor}
                    onChange={(e) => setHeadingColor(e.target.value)}
                    className="w-16 p-1 cursor-pointer"
                    title="Text Color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {image ? 'Change Image' : 'Upload Image'}
                </Button>
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image} 
                    alt="Preview" 
                    className="w-full h-24 object-cover rounded border border-border"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageDesc">Image Description</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageDesc"
                    placeholder="Image caption..."
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={imageDescSize}
                    onChange={(e) => setImageDescSize(Number(e.target.value))}
                    min="10"
                    max="24"
                    className="w-16"
                    title="Font Size"
                  />
                  <Input
                    type="color"
                    value={imageDescColor}
                    onChange={(e) => setImageDescColor(e.target.value)}
                    className="w-16 p-1 cursor-pointer"
                    title="Text Color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeDate">Place and Date</Label>
                <div className="flex gap-2">
                  <Input
                    id="placeDate"
                    placeholder="e.g., New York, Dec 7, 2025"
                    value={placeAndDate}
                    onChange={(e) => setPlaceAndDate(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={placeDateSize}
                    onChange={(e) => setPlaceDateSize(Number(e.target.value))}
                    min="10"
                    max="32"
                    className="w-16"
                    title="Font Size"
                  />
                  <Input
                    type="color"
                    value={placeDateColor}
                    onChange={(e) => setPlaceDateColor(e.target.value)}
                    className="w-16 p-1 cursor-pointer"
                    title="Text Color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Main Content</Label>
                <Textarea
                  id="content"
                  placeholder="Article content..."
                  value={mainContent}
                  onChange={(e) => setMainContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <div className="flex-1"></div>
                  <Input
                    type="number"
                    value={contentSize}
                    onChange={(e) => setContentSize(Number(e.target.value))}
                    min="12"
                    max="32"
                    className="w-16"
                    title="Font Size"
                  />
                  <Input
                    type="color"
                    value={contentColor}
                    onChange={(e) => setContentColor(e.target.value)}
                    className="w-16 p-1 cursor-pointer"
                    title="Text Color"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Styling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="layout">Layout</Label>
                  <Select value={layout} onValueChange={setLayout}>
                    <SelectTrigger id="layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="layout1">Classic</SelectItem>
                      <SelectItem value="layout2">Side by Side</SelectItem>
                      <SelectItem value="layout3">Bordered</SelectItem>
                      <SelectItem value="layout4">Sidebar</SelectItem>
                      <SelectItem value="layout5">Magazine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Image Dimensions</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Height"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(Number(e.target.value))}
                      min="100"
                      max="800"
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Width"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number(e.target.value))}
                      min="20"
                      max="100"
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor="imageObjectFit">Image Fit</Label>
                  <Select value={imageObjectFit} onValueChange={(v: 'contain' | 'cover' | 'fill' | 'scale-down') => setImageObjectFit(v)}>
                    <SelectTrigger id="imageObjectFit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                      <SelectItem value="scale-down">Scale Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={downloadAsJPEG} className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Download as JPEG
          </Button>
        </div>
      </div>

      <div className="w-1/2 h-full overflow-y-auto bg-muted/30">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-3 z-10">
          <h2 className="font-semibold text-foreground">Preview</h2>
        </div>
        <div className="p-6">
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}