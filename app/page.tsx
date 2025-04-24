"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function Home() {
  const [snippet, setSnippet] = useState("")
  const [textTokens, setTextTokens] = useState<number | "">("")
  const [imageTokens, setImageTokens] = useState<number | "">("")
  const [outputTokens, setOutputTokens] = useState<number | "">("")
  const [error, setError] = useState<string | null>(null)
  const [isParsingFromSnippet, setIsParsingFromSnippet] = useState(false)

  // Calculate result based on current token values
  const calculateResult = () => {
    if (textTokens === "" || imageTokens === "" || outputTokens === "") {
      return null
    }

    const textCost = (Number(textTokens) / 1000000) * 5.0
    const imageCost = (Number(imageTokens) / 1000000) * 10.0
    const outputCost = (Number(outputTokens) / 1000000) * 40.0
    const totalCost = textCost + imageCost + outputCost

    return {
      textTokens: Number(textTokens),
      imageTokens: Number(imageTokens),
      outputTokens: Number(outputTokens),
      textCost,
      imageCost,
      outputCost,
      totalCost,
    }
  }

  const result = calculateResult()

  // Parse snippet when it changes
  useEffect(() => {
    if (!snippet.trim()) {
      if (!isParsingFromSnippet) {
        // Only clear token values if we're not in the middle of updating the snippet from token inputs
        setTextTokens("")
        setImageTokens("")
        setOutputTokens("")
      }
      setError(null)
      return
    }

    // Add a small delay to avoid calculating on every keystroke
    const timer = setTimeout(() => {
      parseSnippet()
    }, 300)

    return () => clearTimeout(timer)
  }, [snippet])

  const parseSnippet = () => {
    setError(null)
    setIsParsingFromSnippet(true)

    try {
      // Parse the snippet to extract token counts
      const textMatch = snippet.match(/text input: (\d+)t/)
      const imageMatch = snippet.match(/image input: (\d+)t/)
      const outputMatch = snippet.match(/output: ([\d,]+)t/)

      if (!textMatch || !imageMatch || !outputMatch) {
        throw new Error("Could not parse all required token information from the snippet")
      }

      // Extract token counts
      setTextTokens(Number.parseInt(textMatch[1]))
      setImageTokens(Number.parseInt(imageMatch[1]))
      setOutputTokens(Number.parseInt(outputMatch[1].replace(/,/g, "")))
    } catch (err) {
      setError("Failed to parse the snippet. Please ensure it follows the expected format.")
      console.error(err)
    } finally {
      setIsParsingFromSnippet(false)
    }
  }

  // Update snippet when token inputs change manually
  useEffect(() => {
    // Skip this effect when we're parsing from snippet
    if (isParsingFromSnippet) return

    // Only update if all values are present
    if (textTokens !== "" && imageTokens !== "" && outputTokens !== "") {
      const formattedOutput = Number(outputTokens).toLocaleString()
      const newSnippet = `quality: high
size: 1024x1024
text input: ${textTokens}t
image input: ${imageTokens}t
output: ${formattedOutput}t`

      setSnippet(newSnippet)
    }
  }, [textTokens, imageTokens, outputTokens, isParsingFromSnippet])

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`
  }

  const handleTokenInputChange = (value: string, setter: React.Dispatch<React.SetStateAction<number | "">>) => {
    if (value === "") {
      setter("")
    } else {
      const numValue = Number(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setter(numValue)
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">OpenAI Image Generation Cost Calculator</CardTitle>
          <CardDescription>Paste your OpenAI image generation snippet or manually enter token counts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Snippet Input */}
            <div className="w-full md:w-1/2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="snippet" className="block text-sm font-medium">
                  Copy from Open AI Playground and paste here:
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Show example</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h3 className="font-medium">Example Snippet</h3>
                      <p className="text-sm text-muted-foreground">
                        Look for this information in the OpenAI Playground after generating an image:
                      </p>
                      <div className="rounded-md overflow-hidden border">
                        <Image
                          src="/images/openai-snippet-example.png"
                          alt="OpenAI snippet example showing token information"
                          width={400}
                          height={300}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Textarea
                id="snippet"
                placeholder="quality: high
size: 1024x1024
text input: 39t
image input: 323t
output: 4,160t"
                rows={6}
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                className="font-mono"
              />
            </div>

            {/* Manual Token Inputs */}
            <div className="w-full md:w-1/2 space-y-4">
              <Label className="block text-sm font-medium mb-2">Or enter token counts manually:</Label>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="textTokens">Text Input Tokens:</Label>
                  <Input
                    id="textTokens"
                    type="number"
                    min="0"
                    value={textTokens}
                    onChange={(e) => handleTokenInputChange(e.target.value, setTextTokens)}
                    placeholder="e.g., 39"
                  />
                  <p className="text-xs text-gray-500">$5.00 per million tokens</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="imageTokens">Image Input Tokens:</Label>
                  <Input
                    id="imageTokens"
                    type="number"
                    min="0"
                    value={imageTokens}
                    onChange={(e) => handleTokenInputChange(e.target.value, setImageTokens)}
                    placeholder="e.g., 323"
                  />
                  <p className="text-xs text-gray-500">$10.00 per million tokens</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="outputTokens">Output Tokens:</Label>
                  <Input
                    id="outputTokens"
                    type="number"
                    min="0"
                    value={outputTokens}
                    onChange={(e) => handleTokenInputChange(e.target.value, setOutputTokens)}
                    placeholder="e.g., 4,160"
                  />
                  <p className="text-xs text-gray-500">$40.00 per million tokens</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Text Tokens:</div>
                    <div className="text-sm">{result.textTokens.toLocaleString()} tokens</div>

                    <div className="text-sm font-medium">Image Tokens:</div>
                    <div className="text-sm">{result.imageTokens.toLocaleString()} tokens</div>

                    <div className="text-sm font-medium">Output Tokens:</div>
                    <div className="text-sm">{result.outputTokens.toLocaleString()} tokens</div>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Text Cost:</div>
                      <div className="text-sm">
                        {formatCost(result.textCost)} <span className="text-gray-500 text-xs">($5.00 per million)</span>
                      </div>

                      <div className="text-sm font-medium">Image Cost:</div>
                      <div className="text-sm">
                        {formatCost(result.imageCost)}{" "}
                        <span className="text-gray-500 text-xs">($10.00 per million)</span>
                      </div>

                      <div className="text-sm font-medium">Output Cost:</div>
                      <div className="text-sm">
                        {formatCost(result.outputCost)}{" "}
                        <span className="text-gray-500 text-xs">($40.00 per million)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50">
                <div className="flex justify-between w-full">
                  <div className="font-semibold">Total Cost:</div>
                  <div className="font-semibold">{formatCost(result.totalCost)}</div>
                </div>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
