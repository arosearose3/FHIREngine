<script>
    import { onMount, onDestroy } from 'svelte';
    import { slide } from 'svelte/transition';
    import TaskTree from './TaskTree.svelte';
    import TaskDetail from './TaskDetail.svelte';

    let selectedTask = null;
    let tasks = [];
    let leftPaneWidth = 300;
    let isDragging = false;
    const minWidth = 200;
    const maxWidth = 600;

    // Handle dragging
    function startDragging() {
        isDragging = true;
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleDragging);
        window.addEventListener('mouseup', stopDragging);
    }

    function handleDragging(event) {
        if (!isDragging) return;
        const newWidth = event.clientX;
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            leftPaneWidth = newWidth;
        }
    }

    function stopDragging() {
        isDragging = false;
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleDragging);
        window.removeEventListener('mouseup', stopDragging);
    }

    // Load tasks
    async function loadTasks() {
        try {
            const response = await fetch('/api/task/hierarchy');
            if (!response.ok) throw new Error('Failed to load tasks');
            tasks = await response.json();
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    function handleTaskSelect(event) {
        selectedTask = event.detail;
    }

    onMount(loadTasks);

    onDestroy(() => {
        window.removeEventListener('mousemove', handleDragging);
        window.removeEventListener('mouseup', stopDragging);
    });
</script>

<div class="task-monitor">
    <div class="task-tree-pane" style="width: {leftPaneWidth}px">
        <div class="pane-header">
            <h2>Tasks</h2>
            <button class="btn-refresh" on:click={loadTasks}>
                Refresh
            </button>
        </div>
        <TaskTree {tasks} on:select={handleTaskSelect} />
    </div>

    <div 
        class="divider"
        on:mousedown={startDragging}
        class:dragging={isDragging}
    >
        <div class="divider-handle"></div>
    </div>

    <div class="task-detail-pane">
        <TaskDetail task={selectedTask} />
    </div>
</div>

<style>
    .task-monitor {
        display: flex;
        height: 100vh;
        background: #f9fafb;
        overflow: hidden;
    }

    .task-tree-pane {
        display: flex;
        flex-direction: column;
        border-right: none;
        background: white;
    }

    .task-detail-pane {
        flex: 1;
        overflow: hidden;
        background: white;
    }

    .pane-header {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .pane-header h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
    }

    .btn-refresh {
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-refresh:hover {
        background: #2563eb;
    }

    .divider {
        width: 8px;
        background: transparent;
        cursor: col-resize;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .divider:hover,
    .divider.dragging {
        background: #e5e7eb;
    }

    .divider-handle {
        width: 2px;
        height: 100%;
        background: #d1d5db;
    }
</style>