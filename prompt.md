# Feature Prompts

## Chef Chat Feature

**Prompt:**
> I want to add a feature here, where user can have a chef chat for every recipe.

**Details discussed:**
- AI backend: Same as recipes (AWS Bedrock / MiniMax)
- UI placement: Slide-in panel on the recipe card

**What was built:**
- `POST /api/chat` backend endpoint
- `ChefChat.jsx` slide-in panel with message history, typing indicator, and quick-suggestion chips
- "Chat with Chef" toggle button on each recipe card
