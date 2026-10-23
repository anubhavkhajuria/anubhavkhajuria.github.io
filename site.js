const dialog = document.getElementById('simulation-dialog');
const stage = document.getElementById('simulation-stage');
const title = document.getElementById('simulation-title');
const copy = document.getElementById('simulation-copy');
const label = document.getElementById('simulation-label');
const foot = document.getElementById('simulation-foot-label');
const closeButton = document.getElementById('simulation-close');

const simulations = {
    cuda: {
        template: 'gpu-template',
        label: 'CUDA / GPU EXECUTION',
        title: 'A warp in motion.',
        copy: 'A warp issues one instruction across 32 lanes. Follow the active lanes as work moves through the streaming multiprocessor.',
        foot: 'CUDA / SIMT / MEMORY COALESCING'
    },
    mlir: {
        template: 'mlir-template',
        label: 'MLIR → LLVM / COMPILER LOWERING',
        title: 'From tensor intent to machine work.',
        copy: 'Each lowering step makes the program more concrete, exposing new choices for optimization and target mapping.',
        foot: 'MLIR / LLVM / CODE GENERATION'
    },
    chip: {
        template: 'chip-template',
        label: '2.5D + 3D / PACKAGE ARCHITECTURE',
        title: 'The package is part of the architecture.',
        copy: 'Interposers and vertical links connect compute and memory chiplets, shaping bandwidth, power, and data movement.',
        foot: 'CHIPLETS / INTERPOSER / STACKING'
    }
};

let lastTrigger;

function openSimulation(key, trigger) {
    const item = simulations[key];
    if (!item || !dialog || !stage) return;
    const template = document.getElementById(item.template);
    if (!template) return;

    label.textContent = item.label;
    title.textContent = item.title;
    copy.textContent = item.copy;
    foot.textContent = item.foot;
    stage.replaceChildren(template.content.cloneNode(true));

    const lanes = stage.querySelector('#warp-grid');
    if (lanes) {
        const fragment = document.createDocumentFragment();
        for (let lane = 0; lane < 32; lane += 1) {
            const cell = document.createElement('span');
            cell.className = 'warp-lane';
            cell.textContent = String(lane).padStart(2, '0');
            cell.style.setProperty('--lane', String(lane));
            cell.setAttribute('aria-hidden', 'true');
            fragment.append(cell);
        }
        lanes.replaceChildren(fragment);
    }

    lastTrigger = trigger;
    if (!dialog.open) dialog.showModal();
}

document.querySelectorAll('.simulation-trigger[data-simulation]').forEach((trigger) => {
    trigger.addEventListener('click', () => openSimulation(trigger.dataset.simulation, trigger));
});

closeButton?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
});
dialog?.addEventListener('close', () => lastTrigger?.focus());
