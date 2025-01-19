<script>
    import { createEventDispatcher } from 'svelte';
    import FhirpathConditionBuilder from './fhirpath/FhirpathConditionBuilder.svelte';
    import { nanoid } from 'nanoid';
    
    const dispatch = createEventDispatcher();
  
    // Replace: Simplified event types
    const EVENT_TYPES = [
      { code: 'specific-time', display: 'Specific Time Event' },
      { code: 'repeating-timer', display: 'Repeating Timer' },
      { code: 'fhirchange', display: 'FHIR Change Event' },
      { code: 'webhook', display: 'Custom Webhook' },
      { code: 'cds-hook', display: 'CDS Hook Event' }
    ];
  
    const FHIR_RESOURCES = [
      'Patient', 'Practitioner', 'Organization', 'Encounter',
      'Observation', 'Condition', 'ServiceRequest', 'Task', 'EventDefinition', 'QuestionnaireResponse'
    ];
  
    const OUTPUT_TYPES = [
      { code: 'string', display: 'String' },
      { code: 'number', display: 'Number' },
      { code: 'boolean', display: 'Boolean' },
      { code: 'datetime', display: 'DateTime' },
      { code: 'reference', display: 'Resource Reference' }
    ];
  
    const CDS_HOOK_TYPES = [
      { code: 'patient-view', display: 'Patient View' },
      { code: 'order-select', display: 'Order Select' },
      { code: 'medication-prescribe', display: 'Medication Prescribe' }
    ];
  
    function generatePath() {
      return `api/webhook/${nanoid(8)}`;
    }
  
    let eventDef = {
      resourceType: 'EventDefinition',
      name: '',
      title: '',
      description: '',
      status: 'draft',
      eventType: 'webhook',
      outputs: [],
      condition: '',
      config: {
        path: generatePath()
      }
    };
  
    let showConditionBuilder = false;
  
    function addOutput() {
      eventDef.outputs = [
        ...eventDef.outputs,
        {
          id: nanoid(),
          name: '',
          type: 'string',
          description: ''
        }
      ];
    }
  
    function removeOutput(id) {
      eventDef.outputs = eventDef.outputs.filter(o => o.id !== id);
    }
  
    function generateTrigger(def) {
      switch (def.eventType) {
        case 'webhook':
          return [{
            type: "named-event",
            name: def.config.path
          }];
  
        case 'specific-time':
          return [{
            type: "periodic",
            timingDateTime: def.config.datetime
          }];
  
        case 'repeating-timer':
          return [{
            type: "periodic",
            timingTiming: {
              repeat: {
                frequency: parseInt(def.config.frequency),
                period: 1,
                periodUnit: def.config.interval
              }
            }
          }];
  
          case 'fhirchange':

          //  eventDef.purpose = `CRUD:${eventDef.config.changeType || 'all'}`;
          return [{
              type: "data-changed",
              data: [{
                  type: def.config.resourceType,
                  profile: [`http://hl7.org/fhir/StructureDefinition/${def.config.resourceType}`]
              }]
          }];
        
        case 'cds-hook':
          return [{
            type: "named-event",
            name: `api/cds/${def.name || 'hook'}`,
            extension: [{
              url: "http://hl7.org/fhir/StructureDefinition/cds-hook-type",
              valueString: def.config.hookType
            }]
          }];
  
        default:
          return [];
      }
    }
  
    function handleEventTypeChange() {
      // Reset config based on new event type
      switch (eventDef.eventType) {
        case 'webhook':
          eventDef.config = { path: generatePath() };
          break;
        case 'specific-time':
          eventDef.config = { datetime: '' };
          break;
        case 'repeating-timer':
          eventDef.config = { frequency: '1', interval: 'day' };
          break;
        case 'fhirchange':
          eventDef.config = { resourceType: 'Patient', changeType: 'all' };
          break;
        case 'cds-hook':
          eventDef.config = { hookType: 'patient-view' };
          break;
      }
    }
  
    async function handleSave() {
      try {
        // Generate FHIR-compliant resource
        const resource = {
            resourceType: 'EventDefinition',
            name: eventDef.name || 'unnamed-event',
            status: eventDef.status,
            date: new Date().toISOString(),  // Required by FHIR
        };

  
        // Add optional fields if they have values
        if (eventDef.title) resource.title = eventDef.title;
        if (eventDef.description) resource.description = eventDef.description;
  
        if (eventDef.eventType === 'fhirchange') {
            resource.purpose = `CRUD:${eventDef.config.changeType || 'all'}`;
        }
        // Add trigger (required by FHIR)
        resource.trigger = generateTrigger(eventDef);
  
        // Add condition if present
        if (eventDef.condition) {
          resource.condition = [{
            language: "text/fhirpath",
            expression: eventDef.condition
          }];
        }
  
        // Add outputs if present
        if (eventDef.outputs.length > 0) {
          resource.output = eventDef.outputs.map(output => ({
            name: output.name || 'unnamed-output',
            type: output.type,
            documentation: output.description
          }));
        }
  
        const response = await fetch('/api/eventdefinition/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resource)
        });
        
        if (!response.ok) throw new Error('Save failed');
        
        dispatch('saved');
      } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save event');
      }
    }
  </script>
  
  <div class="container">
    <h1>Event Definition Editor</h1>
    
    <!-- Basic Information -->
    <div class="card">
      <h2>Basic Information</h2>
      
      <div class="form-group">
        <label for="name">Name</label>
        <input 
          type="text" 
          id="name" 
          bind:value={eventDef.name}
        />
      </div>
  
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" bind:value={eventDef.title} />
      </div>
  
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" bind:value={eventDef.description}></textarea>
      </div>
  
      <div class="form-group">
        <label for="eventType">Event Type</label>
        <select 
          id="eventType" 
          bind:value={eventDef.eventType}
          on:change={handleEventTypeChange}
        >
          {#each EVENT_TYPES as type}
            <option value={type.code}>{type.display}</option>
          {/each}
        </select>
      </div>
    </div>
  
    <!-- Event Configuration -->
    <div class="card">
      <h2>Event Configuration</h2>
  
      {#if eventDef.eventType === 'specific-time'}
        <div class="form-group">
          <label for="datetime">Event Date/Time</label>
          <input type="datetime-local" id="datetime" bind:value={eventDef.config.datetime} />
        </div>
  
      {:else if eventDef.eventType === 'repeating-timer'}
        <div class="form-group">
          <label for="frequency">Repeat Every</label>
          <div class="input-row">
            <input type="number" id="frequency" bind:value={eventDef.config.frequency} min="1" />
            <select bind:value={eventDef.config.interval}>
              <option value="minute">Minutes</option>
              <option value="hour">Hours</option>
              <option value="day">Days</option>
              <option value="week">Weeks</option>
            </select>
          </div>
        </div>
  
      {:else if eventDef.eventType === 'fhirchange'}
        <div class="form-group">
          <label for="resourceType">Resource Type</label>
          <select id="resourceType" bind:value={eventDef.config.resourceType}>
            {#each FHIR_RESOURCES as resource}
              <option value={resource}>{resource}</option>
            {/each}
          </select>
        </div>
  
        <div class="form-group">
          <label for="changeType">Change Type</label>
          <select id="changeType" bind:value={eventDef.config.changeType}>
            <option value="all">All Changes</option>
            <option value="create">Create Only</option>
            <option value="update">Update Only</option>
            <option value="delete">Delete Only</option>
          </select>
        </div>
  
      {:else if eventDef.eventType === 'webhook'}
        <div class="form-group">
          <label>Webhook Path</label>
          <div class="code-display">{eventDef.config.path}</div>
        </div>
  
      {:else if eventDef.eventType === 'cds-hook'}
        <div class="form-group">
          <label for="hookType">Hook Type</label>
          <select id="hookType" bind:value={eventDef.config.hookType}>
            {#each CDS_HOOK_TYPES as hookType}
              <option value={hookType.code}>{hookType.display}</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>
  
    <!-- Outputs -->
    <div class="card">
      <div class="card-header">
        <h2>Event Outputs</h2>
        <button class="btn-add" on:click={addOutput}>Add Output</button>
      </div>
  
      {#each eventDef.outputs as output (output.id)}
        <div class="output-row">
          <input 
            type="text"
            placeholder="Output name"
            bind:value={output.name}
          />
          <select bind:value={output.type}>
            {#each OUTPUT_TYPES as type}
              <option value={type.code}>{type.display}</option>
            {/each}
          </select>
          <input 
            type="text"
            placeholder="Description"
            bind:value={output.description}
          />
          <button class="btn-remove" on:click={() => removeOutput(output.id)}>Remove</button>
        </div>
      {/each}
    </div>
  
    <!-- Conditions -->
    <div class="card">
      <div class="card-header">
        <h2>Event Conditions</h2>
        <button class="btn-edit" on:click={() => showConditionBuilder = true}>
          Edit Conditions
        </button>
      </div>
  
      {#if eventDef.condition}
        <div class="code-display">{eventDef.condition}</div>
      {:else}
        <p class="no-content">No conditions set - event will always trigger</p>
      {/if}
    </div>
  
    {#if showConditionBuilder}
      <FhirpathConditionBuilder 
        standalone={true}
        condition={eventDef.condition}
        on:change={(e) => {
          eventDef.condition = e.detail.condition;
          showConditionBuilder = false;
        }}
        onClose={() => showConditionBuilder = false}
      />
    {/if}
  
    <!-- Preview -->
    <div class="card">
      <h2>Event Preview</h2>
      <pre>{JSON.stringify({
        resourceType: 'EventDefinition',
        name: eventDef.name || 'unnamed-event',
        ...(eventDef.title && { title: eventDef.title }),
        ...(eventDef.description && { description: eventDef.description }),
        status: eventDef.status,
        date: new Date().toISOString(),
        trigger: generateTrigger(eventDef),
        ...(eventDef.condition && {
          condition: [{
            language: "text/fhirpath",
            expression: eventDef.condition
          }]
        }),
        ...(eventDef.outputs.length > 0 && {
          output: eventDef.outputs.map(output => ({
            name: output.name || 'unnamed-output',
            type: output.type,
            documentation: output.description
          }))
        })
      }, null, 2)}</pre>
    </div>
  
    <!-- Actions -->
    <div class="actions">
      <button class="btn-secondary" on:click={() => dispatch('cancel')}>Cancel</button>
      <button class="btn-primary" on:click={handleSave}>Save Event</button>
    </div>
  </div>

<style>
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    
    h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    h2 {
      font-size: 18px;
      font-weight: bold;
      margin: 0;
    }
    
    .card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      font-weight: 500;
      margin-bottom: 5px;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    
    .input-row {
      display: flex;
      gap: 10px;
    }
    
    .input-row input {
      width: 100px;
    }
    
    .code-display {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      border: 1px solid #ddd;
    }
    
    .output-row {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr auto;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .btn-add {
      background: #4CAF50;
      color: white;
    }
    
    .btn-edit {
      background: #2196F3;
      color: white;
    }
    
    .btn-remove {
      background: #f44336;
      color: white;
    }
    
    .btn-primary {
      background: #2196F3;
      color: white;
    }
    
    .btn-secondary {
      background: #9E9E9E;
      color: white;
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    
    .no-content {
      color: #666;
      font-style: italic;
    }
    
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
    }
    
    button:hover {
      opacity: 0.9;
    }
    
    button:active {
      transform: translateY(1px);
    }
    </style>