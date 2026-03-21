/**
 * Server-safe tool list for blog auto-generation.
 * NO JSX, NO React imports — pure data.
 */
export const TOOL_ENTRIES: { slug: string; name: string; description: string; href: string }[] = [
  { slug: 'ipcheck', name: 'IP Check', description: 'Look up any IP address or domain', href: '/tools/ipcheck' },
  { slug: 'myip', name: 'My IP', description: 'Find your public IP address', href: '/tools/myip' },
  { slug: 'speedtest', name: 'Speed Test', description: 'Test your internet speed', href: '/tools/speedtest' },
  { slug: 'json-converter', name: 'JSON Converter', description: 'Format, convert and validate JSON/YAML/CSV', href: '/tools/json-converter' },
  { slug: 'swagger-editor', name: 'Swagger Editor', description: 'Edit and preview OpenAPI specifications', href: '/tools/swagger-editor' },
  { slug: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode, verify, and generate JSON Web Tokens', href: '/tools/jwt-decoder' },
  { slug: 'regex-tester', name: 'Regex Tester', description: 'Test, match and replace with 30+ preset patterns', href: '/tools/regex-tester' },
  { slug: 'favicon-generator', name: 'Favicon Generator', description: 'Create favicons from text, icons, images, or AI', href: '/tools/favicon-generator' },
  { slug: 'color-palette', name: 'Color Palette', description: 'Generate palettes with harmony rules, image extraction and accessibility', href: '/tools/color-palette' },
  { slug: 'id-photo', name: 'ID Photo Editor', description: 'Create passport and visa photos', href: '/tools/id-photo' },
  { slug: 'pdf-converter', name: 'PDF Converter', description: 'Convert PDF to images, merge, split and compress', href: '/tools/pdf-converter' },
  { slug: 'image-editor', name: 'Image Editor', description: 'Edit images with filters, adjustments, and AI tools', href: '/tools/image-editor' },
  { slug: 'svg-converter', name: 'SVG Converter', description: 'Convert raster images to vector SVG', href: '/tools/svg-converter' },
  { slug: 'currency-exchange', name: 'Currency Exchange', description: 'Convert currencies with live exchange rates', href: '/tools/currency-exchange' },
  { slug: 'ecard-studio', name: 'ECard Studio', description: 'Design professional e-cards for business occasions', href: '/tools/ecard-studio' },
  { slug: 'human-benchmark', name: 'Human Benchmark', description: 'Brain games and cognitive tests', href: '/tools/human-benchmark' },
  { slug: 'story-studio', name: 'Story Studio', description: 'Create AI-illustrated picture books', href: '/tools/story-studio' },
  { slug: 'job-radar', name: 'Job Radar', description: 'AU and NZ tech and French language jobs', href: '/tools/job-radar' },
  { slug: 'ai-radar', name: 'AI Radar', description: 'Latest AI model releases and updates', href: '/tools/ai-radar' },
]
