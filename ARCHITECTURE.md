# Architecture Documentation

## Overview

SigmaChain is an agentic image generation system that demonstrates how multi-agent workflows operate. The system uses a pipeline of specialized AI agents that work together to enhance prompts, generate images, and validate results.

## System Architecture

```
┌─────────────┐
│   Frontend  │  Next.js React Application
│  (Next.js)  │  - User Interface
│             │  - Workflow Visualization
│             │  - Result Display
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────────────────┐
│              Backend (FastAPI)                   │
│  ┌──────────────────────────────────────────┐  │
│  │     Workflow Orchestrator                 │  │
│  │  - Manages agent pipeline                 │  │
│  │  - Coordinates agent execution            │  │
│  │  - Tracks workflow state                  │  │
│  └──────┬───────────────────────────────────┘  │
│         │                                        │
│         ├──────────────┬──────────────┬─────────┤
│         ▼              ▼              ▼         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Prompt  │  │    Image     │  │Validator │ │
│  │ Enhancer │→ │  Generator   │→ │  Agent   │ │
│  │  Agent   │  │    Agent     │  │          │ │
│  └──────────┘  └──────────────┘  └──────────┘ │
└─────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    OpenAI API    Replicate/DALL-E   OpenAI Vision
    (GPT-4)       (Image Gen)        (Validation)
```

## Agentic Workflow

### 1. Prompt Enhancement Agent
**Purpose**: Enhances user prompts with technical details and best practices

**Input**: User's raw prompt
**Output**: Enhanced prompt with:
- Technical photography/art terms
- Style specifications
- Quality modifiers
- Anatomical accuracy cues
- Professional standards

**Technology**: OpenAI GPT-4

**Example**:
- Input: "A person in a business suit"
- Output: "A professional portrait of a person in a well-fitted business suit, high-quality studio lighting, sharp focus, professional photography, anatomical accuracy, realistic proportions, 8k resolution"

### 2. Image Generation Agent
**Purpose**: Generates images from enhanced prompts

**Input**: Enhanced prompt
**Output**: Generated image URL

**Technology**: 
- Replicate (Stable Diffusion XL)
- DALL-E 3 (alternative)

**Features**:
- Supports multiple providers
- Configurable parameters
- High-quality output

### 3. Validation Agent
**Purpose**: Validates generated images for quality and anatomical correctness

**Input**: Generated image URL + prompts
**Output**: Validation results with:
- Overall score (0-100)
- Anatomical correctness score (0-100)
- Quality score (0-100)
- Issues found
- Recommendations
- Pass/Fail status

**Technology**: OpenAI GPT-4 Vision (gpt-4o)

## Key Concepts

### Agentic Pattern
Each agent is a specialized component that:
1. Has a single, well-defined responsibility
2. Processes input and produces output
3. Can be composed with other agents
4. Is independently testable
5. Can be replaced or extended

### Workflow Orchestration
The orchestrator:
- Manages the execution flow
- Passes data between agents
- Handles errors and retries
- Tracks workflow state
- Provides extensibility points

### Extensibility
New agents can be added by:
1. Creating a new agent class inheriting from `BaseAgent`
2. Implementing the `process()` method
3. Adding the agent to the orchestrator pipeline
4. The system automatically handles the new workflow step

## Data Flow

```
User Prompt
    ↓
[Prompt Enhancement Agent]
    ↓
Enhanced Prompt
    ↓
[Image Generation Agent]
    ↓
Image URL
    ↓
[Validation Agent]
    ↓
Validation Results
    ↓
Final Result (Image + Validation)
```

## API Endpoints

### POST /api/generate
Generates an image through the complete workflow.

**Request**:
```json
{
  "prompt": "A person in a business suit",
  "image_provider": "replicate"
}
```

**Response**:
```json
{
  "success": true,
  "workflow_id": "workflow_1234567890",
  "result": {
    "original_prompt": "A person in a business suit",
    "enhanced_prompt": "Enhanced prompt...",
    "image_url": "https://...",
    "validation": {
      "overall_score": 85,
      "anatomical_score": 90,
      "quality_score": 80,
      "passed": true
    }
  },
  "message": "Image generated and validated successfully"
}
```

### GET /api/history
Retrieves workflow execution history.

### GET /api/workflow/{workflow_id}
Retrieves a specific workflow result.

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework
- **Python 3.9+**: Programming language
- **OpenAI API**: GPT-4 for prompt enhancement and validation
- **Replicate API**: Stable Diffusion XL for image generation
- **Pydantic**: Data validation

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Hooks**: State management

## Learning Points

### How Agentic Tools Work

1. **Specialization**: Each agent has a specific role
2. **Composition**: Agents are combined to create workflows
3. **Orchestration**: A central orchestrator manages the flow
4. **Extensibility**: New agents can be added easily
5. **State Management**: Data flows through the pipeline
6. **Error Handling**: Each agent handles its own errors
7. **Observability**: Workflow steps are tracked and visualized

### Benefits of Agentic Architecture

- **Modularity**: Easy to modify individual agents
- **Testability**: Each agent can be tested independently
- **Scalability**: Agents can be scaled independently
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new capabilities
- **Reusability**: Agents can be reused in different workflows

## Future Enhancements

1. **Additional Agents**:
   - Style Transfer Agent
   - Image Upscaling Agent
   - Background Removal Agent
   - Color Correction Agent

2. **Workflow Features**:
   - Conditional branching
   - Parallel agent execution
   - Retry mechanisms
   - Caching layer

3. **Advanced Features**:
   - Multi-image generation
   - Batch processing
   - Custom agent definitions
   - Workflow templates

## File Structure

```
SigmaChain/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base_agent.py          # Base agent class
│   │   ├── prompt_enhancer.py     # Prompt enhancement agent
│   │   ├── image_generator.py     # Image generation agent
│   │   └── validator.py           # Validation agent
│   ├── workflow/
│   │   ├── __init__.py
│   │   └── orchestrator.py        # Workflow orchestrator
│   ├── main.py                     # FastAPI application
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── ImageGenerationForm.tsx
│   │   ├── WorkflowVisualization.tsx
│   │   └── ResultDisplay.tsx
│   └── package.json               # Node dependencies
├── README.md
├── SETUP.md
└── ARCHITECTURE.md
```

## Conclusion

This architecture demonstrates a practical implementation of agentic AI systems. Each agent specializes in a specific task, and the orchestrator coordinates their execution to achieve a complex goal. This pattern is widely used in modern AI systems and provides a foundation for building more sophisticated agentic applications.

