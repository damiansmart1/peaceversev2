import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Buffer } from "node:buffer";
import pdfParse from "npm:pdf-parse@1.1.1/lib/pdf-parse.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const VISION_MODEL = 'google/gemini-2.5-flash';

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ---- Native PDF extraction using pdf-parse ----
async function extractPdfTextNative(fileBytes: Uint8Array): Promise<{ text: string; quality: 'good' | 'poor' }> {
  try {
    const data = await pdfParse(Buffer.from(fileBytes));
    const text = (data.text || '').trim();
    const letterCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    const hasGoodText = text.length > 500 && letterCount > 100;
    return { text, quality: hasGoodText ? 'good' : 'poor' };
  } catch (error) {
    console.error('pdf-parse failed:', error);
    return { text: '', quality: 'poor' };
  }
}

// ---- Vision API OCR fallback for scanned PDFs ----
async function extractWithVisionApi(apiKey: string, fileBytes: Uint8Array, mimeType: string): Promise<string> {
  const base64 = arrayBufferToBase64(fileBytes.buffer);

  const response = await fetch(AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this document. Preserve the structure, headings, paragraphs, lists, and tables as much as possible. Return ONLY the extracted text content with no commentary.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 16000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Vision API error:', response.status, errText);
    throw new Error(`Vision API failed: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || '';
}

// ---- DOCX extraction ----
function extractDocxText(data: Uint8Array): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(data);

  // Find XML text nodes <w:t>...</w:t>
  const matches = raw.match(/<w:t[^>]*>([^<]*)<\/w:t>/gi);
  if (!matches || matches.length === 0) return '';

  return matches
    .map(tag => tag.replace(/<[^>]+>/g, ''))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ---- Plain text / RTF / CSV ----
function extractPlainText(data: Uint8Array, fileName: string): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(data);

  if (raw.startsWith('{\\rtf')) {
    return raw.replace(/\{\\[^{}]*\}|\\[a-z]+\d*\s?|[{}]/gi, '').trim();
  }

  return raw.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, fileUrl, fileName, fileType, extractOnly } = await req.json();
    
    // extractOnly mode: just extract text and return it without needing a documentId
    const isExtractOnly = extractOnly === true || !documentId;
    
    if (!isExtractOnly && !documentId) throw new Error('Document ID required');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = getSupabase();

    // Update status only when linked to a document
    if (!isExtractOnly) {
      await supabase.from('civic_documents').update({
        processing_status: 'extracting_text',
      }).eq('id', documentId);
    }

    let extractedText = '';
    let extractionMethod = 'unknown';
    let fileBytes: Uint8Array;

    // Download the file
    if (fileUrl) {
      console.log('Downloading file from:', fileUrl);
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`Failed to download file: ${response.status}`);
      const buffer = await response.arrayBuffer();
      fileBytes = new Uint8Array(buffer);
      console.log(`File downloaded: ${fileBytes.length} bytes`);
    } else {
      throw new Error('No file URL provided');
    }

    const lowerName = (fileName || '').toLowerCase();
    const mime = (fileType || '').toLowerCase();

    // ---- TEXT / CSV / MD / RTF ----
    if (mime.startsWith('text/') || lowerName.endsWith('.txt') || lowerName.endsWith('.csv') ||
        lowerName.endsWith('.md') || lowerName.endsWith('.rtf')) {
      extractedText = extractPlainText(fileBytes, lowerName);
      extractionMethod = 'plain_text';
    }
    // ---- PDF ----
    else if (mime === 'application/pdf' || lowerName.endsWith('.pdf')) {
      console.log('Attempting native PDF extraction...');
      const nativeResult = await extractPdfTextNative(fileBytes);
      console.log(`Native extraction: ${nativeResult.text.length} chars, quality: ${nativeResult.quality}`);

      if (nativeResult.quality === 'good') {
        extractedText = nativeResult.text;
        extractionMethod = 'pdf_native';
      } else {
        // Fallback to Vision API for scanned/image-based PDFs
        console.log('Native extraction poor, using Vision API OCR...');
        try {
          extractedText = await extractWithVisionApi(LOVABLE_API_KEY, fileBytes, 'application/pdf');
          extractionMethod = 'vision_ocr';
          console.log(`Vision API extracted: ${extractedText.length} chars`);

          // If Vision API also returned little text, combine both
          if (extractedText.length < 100 && nativeResult.text.length > 0) {
            extractedText = nativeResult.text + '\n\n' + extractedText;
            extractionMethod = 'combined';
          }
        } catch (visionErr) {
          console.error('Vision API fallback failed:', visionErr);
          // Use whatever native extraction got
          extractedText = nativeResult.text;
          extractionMethod = 'pdf_native_fallback';
        }
      }
    }
    // ---- DOCX ----
    else if (mime.includes('wordprocessingml') || lowerName.endsWith('.docx')) {
      extractedText = extractDocxText(fileBytes);
      extractionMethod = 'docx_xml';

      // If XML-based extraction fails, try Vision API
      if (extractedText.length < 100) {
        console.log('DOCX XML extraction poor, trying Vision API...');
        try {
          extractedText = await extractWithVisionApi(LOVABLE_API_KEY, fileBytes, mime || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
          extractionMethod = 'docx_vision';
        } catch (e) {
          console.error('DOCX Vision fallback failed:', e);
        }
      }
    }
    // ---- Other document types: try Vision API directly ----
    else {
      console.log('Unknown file type, trying Vision API...');
      try {
        extractedText = await extractWithVisionApi(LOVABLE_API_KEY, fileBytes, mime || 'application/octet-stream');
        extractionMethod = 'vision_generic';
      } catch (e) {
        console.error('Vision API failed for unknown type:', e);
        // Last resort: raw text extraction
        const decoder = new TextDecoder('utf-8', { fatal: false });
        extractedText = decoder.decode(fileBytes).replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, ' ').trim();
        extractionMethod = 'raw_fallback';
      }
    }

    // Truncate to 100k chars max
    extractedText = extractedText.substring(0, 100000);

    if (extractedText.length < 50) {
      if (!isExtractOnly) {
        await supabase.from('civic_documents').update({
          processing_status: 'text_extraction_failed',
          processing_error: `Extraction method "${extractionMethod}" yielded insufficient text (${extractedText.length} chars). Please paste document text manually.`,
        }).eq('id', documentId);
      }

      return new Response(JSON.stringify({
        success: false,
        text: extractedText,
        error: 'Insufficient text extracted',
        method: extractionMethod,
        charCount: extractedText.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // For extractOnly mode, just return the text
    if (isExtractOnly) {
      console.log(`Extract-only complete: ${extractedText.length} chars via ${extractionMethod}`);
      return new Response(JSON.stringify({
        success: true,
        text: extractedText,
        method: extractionMethod,
        charCount: extractedText.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Save extracted text to the document
    await supabase.from('civic_documents').update({
      original_text: extractedText,
      processing_status: 'text_extracted',
    }).eq('id', documentId);

    console.log(`Text extraction complete: ${extractedText.length} chars via ${extractionMethod}`);

    // Now trigger summarization
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const summarizeResponse = await fetch(`${supabaseUrl}/functions/v1/nuru-ai-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'summarize', documentId }),
    });

    if (!summarizeResponse.ok) {
      const errText = await summarizeResponse.text();
      console.error('Summarization trigger failed:', errText);
    }

    return new Response(JSON.stringify({
      success: true,
      method: extractionMethod,
      charCount: extractedText.length,
      preview: extractedText.substring(0, 500),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Extract document text error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Text extraction failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
