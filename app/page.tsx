"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

interface Values {
  textTokens?: string | number
  imageTokens?: string | number
  outputTokens?: string | number
}

// Calculate result based on token values
function calculateResult(values: Values) {
  const { textTokens, imageTokens, outputTokens } = values
  if (textTokens === "" || imageTokens === "" || outputTokens === "") {
    return null
  }

  const million = Math.pow(10, 6)

  const textCost = (Number(textTokens) / million) * 5.0
  const imageCost = (Number(imageTokens) / million) * 10.0
  const outputCost = (Number(outputTokens) / million) * 40.0
  const totalCost = textCost + imageCost + outputCost

  return {
    textTokens: Number(textTokens),
    imageTokens: Number(imageTokens),
    outputTokens: Number(outputTokens),
    textCost,
    imageCost,
    outputCost,
    totalCost
  }
}

function formatCost(cost: number) {
  return `$${cost.toFixed(6)}`
}

function formatResult(result: any) {
  if (!result) {
    return null
  }
  return {
    text: {
      tokens: result.textTokens.toLocaleString(),
      cost: formatCost(result.textCost)
    },
    image: {
      tokens: result.imageTokens.toLocaleString(),
      cost: formatCost(result.imageCost)
    },
    output: {
      tokens: result.outputTokens.toLocaleString(),
      cost: formatCost(result.outputCost)
    },
    total: {
      cost: formatCost(result.totalCost)
    }
  }
}

export default function Home() {
  const [snippet, setSnippet] = useState("")
  const [textTokens, setTextTokens] = useState<number | "">("")
  const [imageTokens, setImageTokens] = useState<number | "">("")
  const [outputTokens, setOutputTokens] = useState<number | "">("")
  const [error, setError] = useState<string | null>(null)
  const [isParsingFromSnippet, setIsParsingFromSnippet] = useState(false)

  const result = calculateResult({ textTokens, outputTokens, imageTokens })
  const formatted = formatResult(result)

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
        throw new Error(
          "Could not parse all required token information from the snippet"
        )
      }

      // Extract token counts
      setTextTokens(Number.parseInt(textMatch[1]))
      setImageTokens(Number.parseInt(imageMatch[1]))
      setOutputTokens(Number.parseInt(outputMatch[1].replace(/,/g, "")))
    } catch (err) {
      setError(
        "Failed to parse the snippet. Please ensure it follows the expected format."
      )
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
      const newSnippet = `quality: high size: 1024x1024 text input: ${textTokens}t image input: ${imageTokens}t output: ${formattedOutput}t`

      setSnippet(newSnippet)
    }
  }, [textTokens, imageTokens, outputTokens, isParsingFromSnippet])

  const handleTokenInputChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    if (value === "") {
      setter("")
    } else {
      const numValue = Number(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setter(numValue)
      }
    }
  }

  const placeholder =
    "quality: high size: 1024x1024 text input: 39t image input: 323t output: 4,160t"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            OpenAI Image Generation Cost Calculator
          </CardTitle>
          <CardDescription>
            Paste your OpenAI image generation snippet or manually enter token
            counts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Snippet Input */}
            <div className="w-full">
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
                        Look for this information in the OpenAI Playground after
                        generating an image:
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
                placeholder={placeholder}
                rows={6}
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                className="font-mono"
              />
            </div>

            {/* Manual Token Inputs */}
            <div className="w-full space-y-4">
              <Label className="block text-sm font-medium">
                Or enter token counts manually:
              </Label>

              <div className="flex w-full flex-col md:flex-row gap-2 md:gap-6">
                <div className="space-y-1 w-full">
                  <Label htmlFor="textTokens">Text Input Tokens:</Label>
                  <Input
                    id="textTokens"
                    type="number"
                    min="0"
                    value={textTokens}
                    onChange={(e) =>
                      handleTokenInputChange(e.target.value, setTextTokens)
                    }
                    placeholder="e.g., 39"
                  />
                  <p className="text-xs text-gray-500">
                    $5.00 per million tokens
                  </p>
                </div>
                <div className="space-y-1 w-full">
                  <Label htmlFor="imageTokens">Image Input Tokens:</Label>
                  <Input
                    id="imageTokens"
                    type="number"
                    min="0"
                    value={imageTokens}
                    onChange={(e) =>
                      handleTokenInputChange(e.target.value, setImageTokens)
                    }
                    placeholder="e.g., 323"
                  />
                  <p className="text-xs text-gray-500">
                    $10.00 per million tokens
                  </p>
                </div>
                <div className="space-y-1 w-full">
                  <Label htmlFor="outputTokens">Output Tokens:</Label>
                  <Input
                    id="outputTokens"
                    type="number"
                    min="0"
                    value={outputTokens}
                    onChange={(e) =>
                      handleTokenInputChange(e.target.value, setOutputTokens)
                    }
                    placeholder="e.g., 4,160"
                  />
                  <p className="text-xs text-gray-500">
                    $40.00 per million tokens
                  </p>
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
            <Card
              className={
                "bg-green-50 border-green-800/20 shadow-xl text-green-800 p-6 space-y-2"
              }
            >
              <CardTitle className="text-xl font-light mb-2">
                Cost Breakdown
              </CardTitle>
              <table className={"w-full"}>
                <thead>
                  <tr className={"border-b-[1px] border-green-800/10 text-sm opacity-75"}>
                    <th className={"font-normal text-left py-1.5 pb-2 w-2/3"}>Type</th>
                    <th className={"font-normal text-right py-1.5"}>Tokens</th>
                    <th className={"font-normal text-right py-1.5"}>Cost</th>
                  </tr>
                </thead>

                <tbody className={"text-sm"}>
                  <tr>
                    <td className={"py-1.5 pt-3"}>Text</td>
                    <td className={"text-right py-1.5"}>
                      {formatted?.text.tokens}
                    </td>
                    <td className={"text-right py-1.5"}>
                      {formatted?.text.cost}
                    </td>
                  </tr>

                  <tr>
                    <td className={"py-1.5"}>Image</td>
                    <td className={"text-right py-1.5"}>
                      {formatted?.image.tokens}
                    </td>
                    <td className={"text-right py-1.5"}>
                      {formatted?.image.cost}
                    </td>
                  </tr>

                  <tr>
                    <td className={"py-1.5"}>Output</td>
                    <td className={"text-right py-1.5"}>
                      {formatted?.output.tokens}
                    </td>
                    <td className={"text-right py-1.5"}>
                      {formatted?.output.cost}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={3} className={"p-1"}></td>
                  </tr>

                  <tr className={"text-lg font-bold text-green-900 border-t-[1px] border-green-800/10"}>
                    <td className={"py-1.5 pt-3"}>Total</td>
                    <td className={"text-right py-1.5"}></td>
                    <td className={"text-right py-1.5"}>
                      {formatted?.total.cost}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
