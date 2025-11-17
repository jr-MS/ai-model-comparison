# Planning Guide

A web application that enables users to compare responses from multiple AI models across different providers (Azure OpenAI, OpenAI, Gemini, AWS Bedrock) by sending identical prompts and viewing results in parallel chat panels.

**Experience Qualities**:
1. **Professional** - Clean, technical interface that inspires confidence when handling API credentials and managing multiple model configurations
2. **Efficient** - Streamlined workflow for adding models, sending prompts, and comparing outputs without unnecessary clicks or delays
3. **Transparent** - Clear visibility into which models are responding, their response times, and any errors that occur during comparison

**Complexity Level**: Light Application (multiple features with basic state)
  - Manages model configurations, API credentials, and parallel API calls with response visualization, but doesn't require user accounts or complex data persistence beyond local settings

## Essential Features

### Model Configuration Management
- **Functionality**: Add, edit, and remove AI model configurations with provider-specific settings (API keys, endpoints, model names)
- **Purpose**: Allow users to set up multiple models from different providers for comparison
- **Trigger**: Click "Add Model" button or edit existing model card
- **Progression**: Click Add Model → Select provider type (OpenAI/Azure/Gemini/AWS) → Enter credentials (API key, endpoint if needed, model name) → Save → Model card appears in sidebar
- **Success criteria**: Models persist in useKV storage, can be edited/deleted, and credentials are never logged or exposed

### Parallel Prompt Execution
- **Functionality**: Send a single prompt to all configured models simultaneously and display responses in individual panels
- **Purpose**: Enable direct comparison of model outputs with identical inputs
- **Trigger**: User types prompt and clicks "Send to All Models"
- **Progression**: Enter prompt in main input → Click send → Loading states appear in all model panels → Responses stream in as each model completes → Display response time for each
- **Success criteria**: All API calls execute in parallel, responses appear in dedicated panels, errors are handled gracefully per model

### Response Visualization
- **Functionality**: Display each model's response in a dedicated panel with metadata (provider, model name, response time, token count if available)
- **Purpose**: Make it easy to read and compare outputs side by side
- **Trigger**: Automatic when responses arrive
- **Progression**: Loading state → Response streams in → Shows completion with metadata → User can copy response or retry individual model
- **Success criteria**: Responses are readable, properly formatted, and clearly labeled with model information

### Provider-Specific Integration
- **Functionality**: Support different authentication methods and API formats for OpenAI, Azure OpenAI, Google Gemini, and AWS Bedrock
- **Purpose**: Handle the varying API requirements of different providers
- **Trigger**: Based on selected provider when configuring model
- **Progression**: Select provider → Show appropriate credential fields → Construct correct API request format → Parse response correctly
- **Success criteria**: Each provider's API is called correctly with proper authentication and response handling

## Edge Case Handling
- **Empty Model List**: Show welcome message with clear CTA to add first model
- **API Failures**: Display error messages per model panel without breaking other comparisons
- **Missing Credentials**: Validate required fields before saving model configuration
- **Rate Limiting**: Show appropriate error message if provider returns rate limit errors
- **Long Responses**: Implement scroll within individual panels to handle lengthy outputs
- **Network Timeout**: Set reasonable timeouts and show timeout errors clearly

## Design Direction
The design should feel professional and technical, like a developer tool, with a clean and organized layout that emphasizes content density and parallel comparison. The interface should be minimal but functional, prioritizing clarity and efficient use of screen space over decorative elements.

## Color Selection
Analogous color scheme centered on cool blues and teals to convey technical professionalism and trustworthiness, with strategic accent colors for status indicators.

- **Primary Color**: Deep blue (oklch(0.45 0.15 250)) - Professional, tech-focused brand color for primary actions and headers
- **Secondary Colors**: Slate gray (oklch(0.35 0.02 250)) for secondary UI elements and borders, providing structure without distraction
- **Accent Color**: Vibrant teal (oklch(0.65 0.15 200)) for active states, success indicators, and drawing attention to interactive elements
- **Foreground/Background Pairings**:
  - Background (Light Gray oklch(0.98 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 13.5:1 ✓
  - Card (White oklch(1 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 15.2:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(1 0 0)) - Ratio 7.8:1 ✓
  - Secondary (Slate oklch(0.35 0.02 250)): White text (oklch(1 0 0)) - Ratio 11.2:1 ✓
  - Accent (Teal oklch(0.65 0.15 200)): Dark text (oklch(0.2 0 0)) - Ratio 6.2:1 ✓
  - Muted (Light Slate oklch(0.95 0.01 250)): Medium text (oklch(0.5 0.02 250)) - Ratio 6.8:1 ✓

## Font Selection
Use Inter for its excellent readability at various sizes and technical credibility, with clear weight differentiation for establishing hierarchy in dense information displays.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/24px/tight letter spacing - Main application header
  - H2 (Section Headers): Inter Semibold/18px/normal letter spacing - Model panel headers, configuration sections
  - H3 (Model Names): Inter Medium/16px/normal letter spacing - Individual model identifiers
  - Body (Responses): Inter Regular/14px/1.6 line height - AI model responses and general content
  - Caption (Metadata): Inter Regular/12px/normal letter spacing - Response times, token counts, status messages
  - Code (Technical): Inter Regular/13px/1.4 line height - API endpoints and technical identifiers

## Animations
Subtle, functional animations that provide feedback during model execution without distracting from content comparison - animations should feel responsive and instantaneous rather than decorative.

- **Purposeful Meaning**: Gentle pulse on loading states communicates active processing; quick fade-ins for responses suggest real-time arrival; smooth panel expansions maintain spatial awareness
- **Hierarchy of Movement**: Loading indicators in model panels receive subtle animation; new response text fades in gently; model configuration modals slide in with purpose

## Component Selection
- **Components**:
  - Dialog: Model configuration form (add/edit models)
  - Card: Individual model response panels with header showing provider/model name
  - Button: Primary for "Send to All", secondary for "Add Model", ghost for panel actions (copy, retry)
  - Textarea: Prompt input with auto-resize
  - Input: API key, endpoint, model name fields in configuration
  - Select: Provider type dropdown
  - Scroll Area: For model response panels when content is long
  - Badge: Provider type indicators (OpenAI, Azure, Gemini, AWS)
  - Separator: Between model panels and sections
  - Tooltip: Help text for API configuration fields
  - Sonner Toast: Success/error notifications for actions
  
- **Customizations**: 
  - Model panel card with streaming response animation
  - Custom provider badge colors
  - Monospace text rendering for technical content
  
- **States**:
  - Buttons: Disabled when no models configured or while loading
  - Model panels: Idle → Loading (pulsing) → Success (content) or Error (message)
  - Input fields: Focus states with subtle border highlight
  
- **Icon Selection**:
  - Plus: Add model button
  - PaperPlaneRight: Send prompt action
  - Trash: Delete model configuration
  - PencilSimple: Edit model configuration
  - Copy: Copy response content
  - ArrowClockwise: Retry individual model
  - Eye/EyeSlash: Toggle API key visibility
  - Check: Success indicators
  - Warning: Error states
  
- **Spacing**: 
  - Container padding: p-6
  - Card gaps: gap-4
  - Grid gaps for model panels: gap-4
  - Section spacing: space-y-6
  
- **Mobile**: 
  - Stack model panels vertically on small screens
  - Full-width prompt input
  - Simplified model configuration dialog with single column
  - Collapsible model list in mobile view with bottom sheet
