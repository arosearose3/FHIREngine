<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { planDefStore } from './planDefStore';
    import { writable } from 'svelte/store';
    import { base } from '$app/paths'; 
        
    export let tasks = [];
    export let level = 0;

    const dispatch = createEventDispatcher();
    $: indent = level * 20;

    let currentFetchBatch = Promise.resolve();
    const planDefinitionNames = writable({});
    const fetchedPlanDefs = writable({
        successful: new Set(),
        failed: new Set()
    });
    
    async function handleDeleteTask(taskId, event) {
        event.stopPropagation(); // Prevent task selection
        
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`${base}/api/task/${taskId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
                
                // Emit refresh event to parent
                dispatch('refresh');
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            }
        }
    }
    
    // Add: Delete completed tasks handler
    async function handleDeleteCompletedTasks() {
        if (confirm('Are you sure you want to delete all completed tasks?')) {
            try {
                const response = await fetch(`${base}/api/task/completed`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete completed tasks');
                }
                
                const result = await response.json();
                alert(`Successfully deleted ${result.deletedCount} completed tasks`);
                
                // Emit refresh event to parent
                dispatch('refresh');
            } catch (error) {
                console.error('Error deleting completed tasks:', error);
                alert('Failed to delete completed tasks. Please try again.');
            }
        }
    }


    function getTaskTypeColor(task) {
        switch(task.type) {
            case 'webhook': return '#3b82f6';  // blue
            case 'parallel-group': return '#8b5cf6';  // purple
            case 'activity': return '#10b981';  // green
            default: return '#6b7280';  // gray
        }
    }

    function getStatusIcon(status) {
        switch(status) {
            case 'completed': return '✓';
            case 'failed': return '✗';
            case 'in-progress': return '⟳';
            default: return '•';
        }
    }

    function formatTiming(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        const startDay = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const startYear = startDate.getFullYear();
        const startTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2, hour12: true });

        const endDay = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endYear = endDate.getFullYear();
        const endTime = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2, hour12: true });

        let formatted = `${startDay} '${startYear.toString().slice(-2)} ${startTime}`;

        if (startDay === endDay && startYear === endYear) {
            formatted += ` - ${endTime}`;
        } else if (startYear === endYear) {
            formatted += ` - ${endDay} ${endTime}`;
        } else {
            formatted += ` - ${endDay} '${endYear.toString().slice(-2)} ${endTime}`;
        }

        return formatted;
    }


    async function fetchPlanDefinitions(taskList) {
    // Get all unique IDs including nested tasks
        const uniqueIds = new Set();
        
        function collectIds(items) {
            items.forEach(task => {
                if (task.name) uniqueIds.add(task.name);
                if (task.children?.length) collectIds(task.children);
            });
        }
        
        collectIds(taskList);
        
        // Fetch all in parallel
        await Promise.all(
            Array.from(uniqueIds).map(id => planDefStore.fetchPlanDef(id))
        );
    }

function flattenTasks(taskList) {
    const seen = new Set();
    const flattened = [];
    
    function recurse(tasks, depth = 0) {
        tasks.forEach(task => {
            const indent = ' '.repeat(depth * 2);
            console.log(`${indent}Processing task:`, {
                name: task.name,
                title: task.title,
                children: task.children?.length || 0
            });
            
            if (task.name && !seen.has(task.name)) {
                seen.add(task.name);
                flattened.push(task);
            }
            if (Array.isArray(task.children)) {
                recurse(task.children, depth + 1);
            }
        });
    }
    
    console.log('Starting to flatten task list:', taskList.length, 'root tasks');
    recurse(taskList);
    console.log('Flattened unique tasks:', flattened.map(t => t.name));
    
    return flattened;
}

// Add: Debug log when tasks prop changes
$: {
    if (tasks) {
        console.log('Tasks updated:', {
            rootCount: tasks.length,
            tasks: tasks.map(t => ({
                name: t.name,
                childCount: t.children?.length || 0
            }))
        });
    }
}

// Replace: onMount with logging
onMount(() => {
    if (tasks?.length) {
        fetchPlanDefinitions(tasks);
    }
});



$: if (tasks) {
    fetchPlanDefinitions(tasks);
}

onDestroy(() => {
        planDefStore.reset();
    });


</script>

<div class="task-tree">
    {#if level === 0}
        <div class="controls">
            <button 
                class="delete-completed-btn"
                on:click={handleDeleteCompletedTasks}
            >
                Delete Completed Tasks
            </button>
        </div>
    {/if}

    {#each tasks as task}
        <div 
            class="task-item"
            style="margin-left: {indent}px; color: {getTaskTypeColor(task)}"
            on:click={() => dispatch('select', task)}
        >

            <button 
                class="delete-btn"
                on:click={(e) => handleDeleteTask(task.id, e)}
                title="Delete task"
            >
                ×
            </button>

            {#if task.children?.length}
                <span class="expand-icon">▼</span>
            {/if}
            <span class="status-icon" class:rotating={task.status === 'in-progress'}>
                {getStatusIcon(task.status)}
            </span>
            <span class="task-name">
                {#if task.name}
                    {#if $planDefStore.inFlight.has(task.name)}
                        <span class="loading">Loading...</span>
                    {:else if $planDefStore.error.has(task.name)}
                        <span class="error" title={$planDefStore.error.get(task.name)}>
                            {task.name}
                        </span>
                    {:else}
                        <span class="def-name" 
                              title={$planDefStore.types.get(task.name)}>
                            {$planDefStore.cache.get(task.name) || task.name}
                        </span>
                    {/if}
                {:else}
                    {task.title}
                {/if}
                
                {#if task.timing}
                    <span class="task-timing">
                        {formatTiming(task.timing.start, task.timing.end)}
                    </span>
                {/if}
            </span>
        </div>
        
        {#if task.children?.length}
            <svelte:self 
                tasks={task.children} 
                level={level + 1}
                on:select
            />
        {/if}
    {/each}
</div>

<style>

.controls {
        margin-bottom: 1rem;
        display: flex;
        gap: 0.5rem;
    }
    
    .delete-completed-btn {
        padding: 0.5rem 1rem;
        background-color: #ef4444;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }
    
    .delete-completed-btn:hover {
        background-color: #dc2626;
    }
    
    .delete-btn {
        padding: 0.25rem 0.5rem;
        background-color: transparent;
        color: #ef4444;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.2s;
    }
    
    .task-item:hover .delete-btn {
        opacity: 1;
    }
    
    .delete-btn:hover {
        background-color: #fee2e2;
    }
    
    .def-name {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .loading {
        opacity: 0.6;
        font-style: italic;
    }
    
    .error {
        color: #ef4444;
        text-decoration: underline dotted;
    }

    .task-tree {
        padding: 0.5rem;
        overflow-y: auto;
    }

    .task-item {
        padding: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
    }

    .task-item:hover {
        background: #f3f4f6;
    }

    .expand-icon {
        font-size: 0.75rem;
        width: 1rem;
    }

    .status-icon {
        font-size: 1rem;
        width: 1rem;
        display: inline-block;
    }

    .status-icon.rotating {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .task-name {
        font-size: 0.875rem;
        flex: 1;
    }

    .task-timing {
        font-size: 0.75rem;
        color: #6b7280;
        margin-left: 0.5rem;
    }
</style>