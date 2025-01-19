
<script>
    export let task = null;

    function formatDateTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString();
    }
</script>

<div class="task-detail">
    {#if task}
        <div class="detail-section">
            <h3>Task Details</h3>
            <div class="detail-grid">
                <div class="detail-label">Type:</div>
                <div class="detail-value" style="color: {task.color}">{task.type}</div>
                
                <div class="detail-label">Status:</div>
                <div class="detail-value">{task.status}</div>
                
                <div class="detail-label">Started:</div>
                <div class="detail-value">{formatDateTime(task.timing?.start)}</div>
                
                <div class="detail-label">Ended:</div>
                <div class="detail-value">{formatDateTime(task.timing?.end)}</div>
            </div>
        </div>

        <div class="detail-section collapsible">
            <h3>Input</h3>
            <div class="detail-content">
                {#if task.input?.length}
                    {#each task.input as input}
                        <div class="input-item">
                            <div class="input-type">{input.type.text}</div>
                            <div class="input-value">{input.valueString}</div>
                        </div>
                    {/each}
                {:else}
                    <div class="empty-state">No input data</div>
                {/if}
            </div>
        </div>

        <div class="detail-section collapsible">
            <h3>Output</h3>
            <div class="detail-content">
                {#if task.output?.length}
                    {#each task.output as output}
                        <div class="output-item">
                            <div class="output-type">{output.type.text}</div>
                            <div class="output-value">{output.valueString}</div>
                        </div>
                    {/each}
                {:else}
                    <div class="empty-state">No output data</div>
                {/if}
            </div>
        </div>

        <div class="detail-section">
            <h3>Related Resources</h3>
            <div class="resource-links">
                {#if task.instantiatesCanonical}
                    <a href="#" class="resource-link">
                        {task.instantiatesCanonical}
                    </a>
                {/if}
                {#if task.partOf}
                    <a href="#" class="resource-link">
                        Parent Task: {task.partOf[0].reference}
                    </a>
                {/if}
            </div>
        </div>
    {:else}
        <div class="empty-state">
            Select a task to view details
        </div>
    {/if}
</div>

<style>
    .task-detail {
        height: 100%;
        overflow-y: auto;
        padding: 1rem;
    }

    .detail-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        padding: 1rem;
    }

    .detail-section h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: #111827;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem 1rem;
    }

    .detail-label {
        font-weight: 500;
        color: #6b7280;
    }

    .detail-value {
        color: #111827;
    }

    .input-item,
    .output-item {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        margin-bottom: 0.5rem;
    }

    .input-type,
    .output-type {
        font-size: 0.75rem;
        color: #6b7280;
        margin-bottom: 0.25rem;
    }

    .input-value,
    .output-value {
        font-family: monospace;
        font-size: 0.875rem;
        white-space: pre-wrap;
    }

    .resource-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .resource-link {
        color: #3b82f6;
        text-decoration: none;
        font-size: 0.875rem;
    }

    .resource-link:hover {
        text-decoration: underline;
    }

    .empty-state {
        color: #6b7280;
        font-style: italic;
        text-align: center;
        padding: 2rem;
    }
</style>