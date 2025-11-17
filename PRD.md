# Planning Guide

A web application that enables users to compare responses from multiple AI models across different providers (Azure OpenAI, OpenAI, Gemini, AWS Bedrock) through multi-turn conversations, allowing contextual discussions and side-by-side comparison of how different models handle ongoing dialogues.

**Experience Qualities**:
1. **Professional** - Clean, technical interface that inspires confidence when handling API credentials and managing multiple model configurations
2. **Conversational** - Natural chat experience with full conversation history, allowing users to build context and explore how models maintain coherence
3. **Transparent** - Clear visibility into which models are responding, their response times, conversation history, and any errors that occur

**Complexity Level**: Light Application (multiple features with basic state)
  - Manages model configurations, API credentials, multi-turn conversation history, and parallel API calls with chat-style visualization

## Essential Features

### Model Configuration Management
- **Functionality**: Add, edit, and remove AI model configurations with provider-specific settings (API keys, endpoints, model names)
- **Purpose**: Allow users to set up multiple models from different providers for comparison
- **Trigger**: Click "Add Model" button or edit existing model card
- **Progression**: Click Add Model → Select provider type (OpenAI/Azure/Gemini/AWS) → Enter credentials (API key, endpoint if needed, model name) → Save → Model card appears in sidebar
- **Success criteria**: Models persist in useKV storage, can be edited/deleted, conversation history initializes for each model

### Multi-Turn Conversation Support
- **Functionality**: Maintain separate conversation histories for each model, allowing contextual follow-up questions
- **Purpose**: Enable comparison of how models handle context and multi-turn interactions
- **Trigger**: User sends any message after initial prompt
- **Progression**: Send message → All models receive full conversation context → Each responds with history awareness → Conversations persist across sessions
- **Success criteria**: Each model maintains its own conversation thread, context is properly sent with each request, history persists in useKV

### Parallel Chat Execution
- **Functionality**: Send messages to all configured models simultaneously and display responses in individual chat panels
- **Purpose**: Enable real-time comparison of conversational responses with identical context
- **Trigger**: User types message and clicks "Send to All Models" or presses Enter
- **Progression**: Enter message in input → Press Enter or click send → Message appears in all chat panels → Loading indicators show → Responses stream in as each model completes → Each response appears in its chat thread
- **Success criteria**: All API calls execute in parallel with full conversation history, responses appear in chat bubbles, errors are handled per model

### Chat-Style Visualization
- **Functionality**: Display each model's conversation in a dedicated chat panel with distinct user/assistant message styling
- **Purpose**: Make conversations natural and easy to follow, clearly distinguishing between user prompts and model responses
- **Trigger**: Automatic as messages are sent and received
- **Progression**: User message appears → Loading state shows → Assistant response streams in → Message metadata displayed (time, response duration, tokens)
- **Success criteria**: Clear visual distinction between user/assistant messages, chronological order maintained, scrolls to latest message automatically

### Conversation Management
- **Functionality**: Clear all conversations to start fresh while keeping model configurations
- **Purpose**: Allow users to reset context and begin new comparison sessions
- **Trigger**: Click "Clear All Chats" button
- **Progression**: Click clear → Confirm action → All message histories cleared → Models remain configured → Ready for new conversation
- **Success criteria**: All conversation histories cleared, models stay configured, no orphaned data

### Provider-Specific Integration
- **Functionality**: Support different authentication methods and API formats for OpenAI, Azure OpenAI, Google Gemini, and AWS Bedrock with conversation history
- **Purpose**: Handle the varying API requirements of different providers while maintaining context
- **Trigger**: Based on selected provider when configuring model
- **Progression**: Select provider → Show appropriate credential fields → Construct correct API request format with message history → Parse response correctly
- **Success criteria**: Each provider's API is called correctly with proper conversation history format and response handling

## Edge Case Handling
- **Empty Model List**: Show welcome message with clear CTA to add first model
- **Empty Conversation**: Show "No messages yet" state in each chat panel
- **API Failures**: Display error message bubble in affected chat without breaking other conversations
- **Missing Credentials**: Validate required fields before saving model configuration
- **Rate Limiting**: Show appropriate error message in chat bubble if provider returns rate limit errors
- **Long Conversations**: Implement scroll within chat panels to handle lengthy conversation histories
- **Network Timeout**: Set reasonable timeouts and show timeout errors as chat messages
- **Context Window Limits**: Gracefully handle when conversation exceeds model's context window

## Design Direction
The design should feel like a professional developer tool with a modern chat interface, balancing technical functionality with conversational UX. The layout should emphasize parallel conversation comparison with clear visual hierarchy distinguishing between different models and conversation participants.

## Color Selection
Analogous color scheme centered on cool blues and teals to convey technical professionalism and trustworthiness, with strategic accent colors for status indicators and conversation participants.

- **Primary Color**: Deep blue (oklch(0.45 0.15 250)) - Professional, tech-focused brand color for primary actions and assistant message backgrounds
- **Secondary Colors**: Slate gray (oklch(0.35 0.02 250)) for secondary UI elements and borders, providing structure without distraction
- **Accent Color**: Vibrant teal (oklch(0.65 0.15 200)) for user messages, active states, and drawing attention to interactive elements
- **Foreground/Background Pairings**:
  - Background (Light Gray oklch(0.98 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 13.5:1 ✓
  - Card (White oklch(1 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 15.2:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(1 0 0)) - Ratio 7.8:1 ✓
  - Secondary (Slate oklch(0.35 0.02 250)): White text (oklch(1 0 0)) - Ratio 11.2:1 ✓
  - Accent (Teal oklch(0.65 0.15 200)): Dark text (oklch(0.2 0 0)) - Ratio 6.2:1 ✓
  - Muted (Light Slate oklch(0.95 0.01 250)): Medium text (oklch(0.5 0.02 250)) - Ratio 6.8:1 ✓

## Font Selection
Use Inter for its excellent readability at various sizes and technical credibility, with clear weight differentiation for establishing hierarchy in dense information displays and conversational content.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/24px/tight letter spacing - Main application header
  - H2 (Section Headers): Inter Semibold/18px/normal letter spacing - Model panel headers
  - H3 (Model Names): Inter Medium/16px/normal letter spacing - Individual model identifiers
  - Body (Messages): Inter Regular/14px/1.6 line height - Chat messages and conversation content
  - Caption (Metadata): Inter Regular/12px/normal letter spacing - Timestamps, response times, token counts
  - Code (Technical): Inter Regular/13px/1.4 line height - API endpoints and technical identifiers

## Animations
Subtle, functional animations that provide conversational feedback and maintain spatial awareness as messages appear - animations should feel responsive and natural like a modern chat application.

- **Purposeful Meaning**: Gentle pulse on loading states communicates active processing; smooth scroll to new messages maintains conversation flow; subtle fade-ins for responses suggest real-time arrival; message bubble expansions feel organic
- **Hierarchy of Movement**: New messages receive subtle slide-in animation; loading indicators pulse gently; auto-scroll to latest message is smooth but quick; clear chat has gentle fade-out

## Component Selection
- **Components**:
  - Dialog: Model configuration form (add/edit models)
  - Card: Individual chat panels with header showing provider/model name
  - Button: Primary for "Send to All", secondary for "Add Model", outline for "Clear All Chats", ghost for message actions (copy)
  - Textarea: Message input with auto-resize and Enter-to-send
  - Input: API key, endpoint, model name fields in configuration
  - Select: Provider type dropdown
  - Scroll Area: For chat message history with auto-scroll to bottom
  - Badge: Provider type indicators (OpenAI, Azure, Gemini, AWS)
  - Avatar/Icons: User and Robot icons to distinguish message participants
  - Sonner Toast: Success/error notifications for actions
  
- **Customizations**: 
  - Chat message bubbles with distinct styling for user vs assistant
  - Custom provider badge colors
  - Loading message placeholder with typing indicator
  - Error message bubble styling
  
- **States**:
  - Buttons: Disabled when no models configured or while sending
  - Chat messages: Idle → Loading (typing indicator) → Success (message) or Error (error bubble)
  - Message input: Disabled while sending, clears after successful send
  - Input fields: Focus states with subtle border highlight
  
- **Icon Selection**:
  - Plus: Add model button
  - PaperPlaneRight: Send message action
  - Trash: Delete model configuration and clear chats
  - PencilSimple: Edit model configuration
  - Copy: Copy message content
  - Check: Copy confirmation
  - Warning: Error states
  - User: User avatar in messages
  - Robot: Assistant avatar in messages
  
- **Spacing**: 
  - Container padding: p-6
  - Chat message gaps: gap-4 for vertical spacing
  - Grid gaps for chat panels: gap-4
  - Section spacing: space-y-6
  - Message bubble padding: p-3
  
- **Mobile**: 
  - Stack chat panels vertically on small screens
  - Full-width message input fixed to bottom
  - Simplified model configuration dialog with single column
  - Collapsible model list in mobile view
  - Reduce number of visible chat panels to 1-2 on mobile with horizontal scroll
