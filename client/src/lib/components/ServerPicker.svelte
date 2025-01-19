<script>
  const r4Servers = [
    {
      name: "AEGIS.net",
      url: "http://wildfhir4.aegis.net/fhir4-0-1"
    },
    {
      name: "eHealth Exchange",
      url: "http://concept01.ehealthexchange.org:52774/hubonfhir/r4"
    },
    {
      name: "Telstra Health (HealthConnex)",
      url: "http://sqlonfhir-r4.azurewebsites.net/fhir"
    },
    {
      name: "Terminz (NZ Terminology Service) - not a full FHIR server",
      url: "https://terminz.azurewebsites.net/fhir"
    },
    {
      name: "Cerner Open - connection refused",
      url: "https://fhir-open.stagingcerner.com/beta/ec2458f2-1e24-41c8-b71b-0e701af7583d/"
    },
    {
      name: "Helios Software - no response",
      url: "http://r4.heliossoftware.com/fhir"
    },
    {
      name: "CorroHealth Open - no PlanDefinition support",
      url: "https://fhirsandbox1.tsysinteropsvcs.net:8100/r4/sites/123"
    },
    {
      name: "MITRE Formulary",
      url: "https://davinci-drug-formulary-ri.logicahealth.org/fhir"
    },
    {
      name: "MITRE Plan-Net",
      url: "https://davinci-plan-net-ri.logicahealth.org/fhir"
    },
    {
      name: "Smile Digital Health CDS",
      url: "https://cds-sandbox.alphora.com/cqf-ruler-r4/fhir"
    },
    {
      name: "PHAST Standard Terminology - no EventDefinition support",
      url: "https://topaze.phast.fr/resources-server/api/fhir"
    }
  ];

  let selectedServer = r4Servers[0];
  let capabilityStatement = null;
  let isLoading = false;
  let error = null;

  function handleServerChange(event) {
    selectedServer = r4Servers[event.target.value];
  }

  async function fetchCapabilityStatement() {
    isLoading = true;
    error = null;
    capabilityStatement = null;

    try {
      const response = await fetch('/api/server/getCapacity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serverUrl: selectedServer.url })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch capability statement');
      }

      capabilityStatement = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="server-selector">
  <label for="server-picker">Select FHIR Server:</label>
  <select 
    id="server-picker" 
    on:change={handleServerChange}
  >
    {#each r4Servers as server, i}
      <option value={i}>{server.name}</option>
    {/each}
  </select>

  {#if selectedServer}
    <div class="server-info">
      <p>Selected Server: <strong>{selectedServer.name}</strong></p>
      <p>URL: <code>{selectedServer.url}</code></p>
    </div>
  {/if}

  <button 
    on:click={fetchCapabilityStatement}
    disabled={isLoading}
  >
    {#if isLoading}
      Loading...
    {:else}
      Get Capability Statement
    {/if}
  </button>

  {#if error}
    <div class="error">
      {error}
    </div>
  {/if}

  {#if capabilityStatement}
    <div class="capability-statement">
      <h3>Capability Statement:</h3>
      
      {#if capabilityStatement.text?.div}
        <div class="text-div" use:htmlSafeInnerHtml={capabilityStatement.text.div}></div>
      {/if}

      <details>
        <summary>Full JSON Details</summary>
        <pre>{JSON.stringify(capabilityStatement, null, 2)}</pre>
      </details>
    </div>
  {/if}
</div>

<style>
  .server-selector {
    max-width: 600px;
    margin: 0 auto;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .server-info {
    background-color: #f4f4f4;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }

  button {
    width: 100%;
    padding: 0.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .error {
    color: red;
    background-color: #ffeeee;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }

  .capability-statement {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }

  .text-div {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #f1f1f1;
    border-radius: 4px;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.8rem;
  }

  code {
    background-color: #eee;
    padding: 0.2rem;
    border-radius: 3px;
  }

  details {
    margin-top: 1rem;
  }

  summary {
    cursor: pointer;
    font-weight: bold;
    color: #007bff;
  }
</style>

<script context="module">
  function htmlSafeInnerHtml(node, htmlContent) {
    // Sanitize HTML to prevent XSS
    const sanitizedContent = sanitizeHtml(htmlContent);
    
    // Set the inner HTML safely
    node.innerHTML = sanitizedContent;
    
    return {
      destroy() {
        // Clean up if needed
        node.innerHTML = '';
      }
    };
  }

  // Basic HTML sanitization function
  function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    const sanitized = temp.innerHTML;
    
    // Allow some safe HTML tags
    return sanitized
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
</script>