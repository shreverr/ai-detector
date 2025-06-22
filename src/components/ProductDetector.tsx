'use client'

import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Search, Camera, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface ProductResult {
  name: string
  score: number
  reasoning: string
}

interface AnalysisResult {
  products: ProductResult[]
}

export default function ProductDetector() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [productsToFind, setProductsToFind] = useState<string[]>([''])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setResults(null)
      setError(null)
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }, [handleImageUpload])

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const addProductInput = () => {
    setProductsToFind([...productsToFind, ''])
  }

  const removeProductInput = (index: number) => {
    if (productsToFind.length > 1) {
      setProductsToFind(productsToFind.filter((_, i) => i !== index))
    }
  }

  const updateProductInput = (index: number, value: string) => {
    const updated = [...productsToFind]
    updated[index] = value
    setProductsToFind(updated)
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        // Remove the data URL prefix to get just the base64 data
        const base64Data = base64String.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const analyzeImage = async () => {
    if (!selectedImage || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setError('Please select an image and ensure API key is configured')
      return
    }

    const validProducts = productsToFind.filter(p => p.trim() !== '')
    if (validProducts.length === 0) {
      setError('Please add at least one product to search for')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const base64Data = await convertImageToBase64(selectedImage)
      
      const prompt = `
Analyze this image and determine if the following products are present: ${validProducts.join(', ')}.

For each product, provide:
1. A confidence score from 0-10 (where 10 means definitely present, 0 means definitely not present)
2. A brief reasoning for your score

Please respond in this exact JSON format:
{
  "products": [
    {
      "name": "product_name",
      "score": number_between_0_and_10,
      "reasoning": "brief_explanation"
    }
  ]
}

Be thorough in your analysis and consider partial visibility, similar products, and context clues.
`

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: selectedImage.type,
        },
      }

      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        
        const analysisResult: AnalysisResult = JSON.parse(jsonMatch[0])
        setResults(analysisResult)
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError)
        setError('Error parsing analysis results. Please try again.')
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      setError('Error analyzing image. Please check your API key and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetApp = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setProductsToFind([''])
    setResults(null)
    setError(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    if (score >= 4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">AI Product Detector</h1>
          <p className="text-lg text-gray-600">Upload an image and let AI find products for you</p>
        </div>

        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Upload or drag and drop an image to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!imagePreview ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Selected image"
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                      setResults(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products to Find Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Products to Find
            </CardTitle>
            <CardDescription>
              List the products you want to detect in the image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productsToFind.map((product, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`product-${index}`} className="sr-only">
                      Product {index + 1}
                    </Label>
                    <Input
                      id={`product-${index}`}
                      placeholder={`Product ${index + 1} (e.g., "iPhone", "Coca Cola", "Nike shoes")`}
                      value={product}
                      onChange={(e) => updateProductInput(index, e.target.value)}
                    />
                  </div>
                  {productsToFind.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeProductInput(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addProductInput}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Product
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={analyzeImage}
            disabled={!selectedImage || isAnalyzing || productsToFind.every(p => p.trim() === '')}
            size="lg"
            className="min-w-32"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </div>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Image
              </>
            )}
          </Button>
          
          <Button
            onClick={resetApp}
            variant="outline"
            size="lg"
          >
            Try Another Image
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Analysis Results</CardTitle>
              <CardDescription>
                Confidence scores for each product (0-10 scale)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {results.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{product.reasoning}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${getScoreColor(product.score)} text-white`}
                      >
                        {product.score}/10
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Key Notice */}
        {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800 text-center">
                ⚠️ Please add your Gemini API key to .env.local file to use this feature
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
