# FHIREngine
FHIREngine is a svelte/node package for authoring and executing FHIR workflows.

# FHIR-Based Workflow Engine

A robust workflow engine built on FHIR (Fast Healthcare Interoperability Resources) that orchestrates complex task execution flows with support for parallel processing, response paths, and event-driven activities.

## Core Features

- **FHIR-Native Architecture**: Built around FHIR resources (Task, ActivityDefinition, PlanDefinition)
- **Hierarchical Task Management**: Three-level task hierarchy (Workflow -> Basic Plan -> Activity)
- **Event-Driven Execution**: Support for webhook endpoints and FHIR resource change notifications
- **Parallel Task Processing**: Execute multiple activities concurrently with synchronization
- **Response Path Handling**: Support for approval workflows and user interactions
- **State Recovery**: Robust recovery mechanism using Provenance resources
- **Context Resolution**: Dynamic property resolution with FHIRPath support

## System Components

### ActivityExecutor
Handles the execution of individual activities defined in PlanDefinitions:
- Activity initialization and setup
- Value resolution using PropertyResolver
- API endpoint construction and execution
- Response path handling for approval workflows

### ContextProvider
Manages execution context across different scenarios:
- User session context
- System process context
- Event handling context
- FHIR practitioner and organization resolution

### EventManager
Orchestrates event handling and triggers:
- Webhook endpoint registration and management
- FHIR subscription handling
- Response path coordination
- Event-to-plan mapping

### PlanExecutor
Manages the execution of workflow plans:
- Plan initialization and recovery
- Action sequencing and dependencies
- Response path coordination
- Parallel group execution

### PlanLoader
Handles the loading and validation of workflow definitions:
- PlanDefinition resource loading
- Hierarchy validation
- Trigger-to-plan mapping
- ActivityDefinition resolution

### PropertyResolver
Resolves values needed during workflow execution:
- FHIRPath expression evaluation
- Dynamic value resolution
- Context-based property mapping
- URL endpoint validation

### TaskManager
Orchestrates FHIR Task resources:
- Task hierarchy management
- Status tracking and updates
- Provenance record creation
- Recovery state management

### TaskCoordinator
Coordinates task state changes and updates:
- Task status management
- Output formatting
- Parallel group completion checking
- Provenance tracking

## Task Hierarchy

The system uses a three-level task hierarchy:

1. **Workflow Instance (Grandparent)**
   - Top-level workflow coordination
   - Tracks overall workflow state

2. **Basic Plan Instance (Parent)**
   - Groups related activities
   - Manages execution order

3. **Activity Task (Child)**
   - Individual unit of work
   - Stores execution inputs/outputs

## Setup and Configuration

### Prerequisites
- FHIR Server
- Node.js environment
- Google Cloud Platform (for PubSub and Scheduler features)

### Environment Variables
- `PROJECT_ID`: Google Cloud project ID
- `LOCATION`: GCP location
- `DATASET_ID`: Healthcare dataset ID
- `FHIR_STORE_ID`: FHIR store ID
- `CLIENT_URL`: Base URL for API endpoints

## Security Considerations

- HTTPS required for all endpoints
- Webhook validation
- Task ownership verification
- FHIR server authentication
- Input validation and sanitization

## Recovery Mechanism

The system implements a robust recovery mechanism:
- Provenance-based state tracking
- Task status recovery
- Webhook re-registration
- Parallel group state recovery

## Event Handling

Supports multiple event types:
- Named webhook events
- FHIR resource changes
- Scheduled events
- Response path events

## Usage Examples

### Creating a Basic Workflow
```javascript
const planDefinition = {
  resourceType: 'PlanDefinition',
  status: 'active',
  action: [{
    id: 'start',
    definitionCanonical: 'ActivityDefinition/example'
  }]
};

await taskManager.createPlanTask(planDefinition, 'start-trigger');
```

### Handling Response Paths
```javascript
const responseUrls = activityExecutor.generateResponseUrls(taskId);
await activityExecutor.registerResponseEndpoints(taskId, responseUrls);
```

## Contributing

Please refer to our contributing guidelines for:
- Code style and formatting
- Testing requirements
- Pull request process
- Documentation standards

## License

[Add your license information here]
