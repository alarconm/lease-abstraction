import { GoogleGenerativeAI } from "@google/generative-ai";
import { LEASE_ABSTRACTION_SYSTEM_PROMPT, ExtractedLeaseData } from "./lease-knowledge";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set - lease abstraction will not work");
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

interface DocumentContent {
  text?: string;
  mimeType?: string;
  data?: string; // Base64 encoded binary data
}

/**
 * Extract lease terms from a document using Gemini
 */
export async function extractLeaseTerms(
  document: DocumentContent,
  documentName: string,
  isAmendment: boolean = false,
  previousAbstract?: ExtractedLeaseData
): Promise<ExtractedLeaseData> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview", // Gemini 3 Flash - released 12/17/2025, best for document extraction
    generationConfig: {
      temperature: 0.1, // Low temperature for factual accuracy
      maxOutputTokens: 16384,
      responseMimeType: "application/json", // Request JSON output directly
    },
  });

  const contentParts: any[] = [];

  // Build the prompt
  let prompt = LEASE_ABSTRACTION_SYSTEM_PROMPT;
  prompt += `\n\nDocument Name: ${documentName}`;

  if (isAmendment && previousAbstract) {
    prompt += `\n\nThis is an AMENDMENT document. Here is the current abstract from the original lease that may be modified by this amendment:\n`;
    prompt += JSON.stringify(previousAbstract, null, 2);
    prompt += `\n\nExtract any changes made by this amendment and update the relevant fields. Track changes in the amendmentHistory array.`;
  }

  // Add text content if available
  if (document.text) {
    prompt += `\n\nDocument Content:\n${document.text}`;
    contentParts.push({ text: prompt });
  }

  // Add binary content if available (for PDF/image processing)
  if (document.mimeType && document.data) {
    contentParts.push({ text: prompt });
    contentParts.push({
      inlineData: {
        mimeType: document.mimeType,
        data: document.data,
      },
    });
  }

  // If only text, add it
  if (contentParts.length === 0 && document.text) {
    contentParts.push({ text: prompt });
  }

  try {
    console.log(`[Gemini] Processing document: ${documentName}`);
    const startTime = Date.now();

    const result = await model.generateContent(contentParts);
    const response = result.response;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Gemini] Response received in ${elapsed}s`);

    // Extract the text response
    let responseText = "";
    const candidates = response.candidates;

    if (candidates && candidates.length > 0) {
      const firstCandidate = candidates[0];
      if (firstCandidate.content?.parts) {
        for (const part of firstCandidate.content.parts) {
          if (part.text) {
            responseText += part.text;
          }
        }
      }
    }

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    // Parse the JSON response
    try {
      const extractedData = JSON.parse(responseText) as ExtractedLeaseData;
      console.log(`[Gemini] Successfully extracted ${Object.keys(extractedData).length} fields`);
      return extractedData;
    } catch (parseError) {
      console.error("[Gemini] Failed to parse JSON response:", responseText.substring(0, 500));
      throw new Error(`Failed to parse extracted data: ${parseError}`);
    }
  } catch (error) {
    console.error("[Gemini] API error:", error);
    throw error;
  }
}

/**
 * Process a document file and extract text
 * Supports PDF and common text formats
 */
export async function processDocument(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<DocumentContent> {
  // For PDFs, we can either extract text or send to Gemini directly
  if (mimeType === "application/pdf") {
    // Try to extract text first
    try {
      const pdfParse = await import("pdf-parse");
      const pdfData = await pdfParse.default(fileBuffer);

      if (pdfData.text && pdfData.text.trim().length > 100) {
        console.log(`[PDF] Extracted ${pdfData.text.length} characters from ${fileName}`);
        return { text: pdfData.text };
      }
    } catch (pdfError) {
      console.log(`[PDF] Text extraction failed for ${fileName}, using vision API`);
    }

    // If text extraction fails or is minimal, send as binary to Gemini's vision
    return {
      mimeType: "application/pdf",
      data: fileBuffer.toString("base64"),
    };
  }

  // For images (scanned documents)
  if (mimeType.startsWith("image/")) {
    return {
      mimeType,
      data: fileBuffer.toString("base64"),
    };
  }

  // For text-based files
  if (
    mimeType === "text/plain" ||
    mimeType === "application/rtf" ||
    fileName.endsWith(".txt")
  ) {
    return { text: fileBuffer.toString("utf-8") };
  }

  // For Word documents, we'd need additional processing
  // This would require mammoth or similar library
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    // For now, try to send to Gemini directly
    return {
      mimeType,
      data: fileBuffer.toString("base64"),
    };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}
