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
        title: '2.5D and 3D chiplet package',
        copy: 'Select a labeled part to see how compute, memory, interconnect, thermal management, and board-level connections fit together.',
        foot: 'CHIPLETS / INTERPOSER / STACKING'
    }
};

let lastTrigger;

const packageParts = {
    lid: { title: 'Heat spreader / lid', copy: 'Spreads die heat into the cooler and protects the package.' },
    tim: { title: 'Thermal interface material', copy: 'Fills the contact gap between silicon and the heat spreader.' },
    compute: { title: 'GPU compute chiplet', copy: 'Runs parallel workloads and exchanges data through the interposer.' },
    io: { title: 'I/O chiplet', copy: 'Connects compute fabric to memory controllers and external links.' },
    hbm: { title: 'HBM stack', copy: 'Vertically stacked DRAM dies provide a wide, high-bandwidth memory interface.' },
    ports: { title: 'High-speed ports / PHYs', copy: 'SerDes and PHY blocks drive package links to other devices.' },
    microbumps: { title: 'Microbumps', copy: 'Fine-pitch joints connect each die to the interposer.' },
    pitch: { title: 'Bump pitch', copy: 'Center-to-center bump spacing sets the local connection density.' },
    interposer: { title: 'Silicon interposer', copy: 'Dense silicon wiring links the compute, I/O, and HBM dies.' },
    tsv: { title: 'Through-silicon vias (TSVs)', copy: 'Copper-filled vertical vias connect HBM tiers and interposer routing.' },
    rdl: { title: 'Redistribution layers (RDL)', copy: 'Metal traces fan signals, clocks, power, and ground across the package.' },
    c4: { title: 'C4 bumps', copy: 'Larger solder joints bridge the interposer and package substrate.' },
    substrate: { title: 'Package substrate', copy: 'Multilayer package routing carries signals and power toward the board.' },
    bga: { title: 'BGA solder balls', copy: 'The ball grid array joins the package substrate to the circuit board.' },
    pcb: { title: 'Printed circuit board', copy: 'Board traces connect the package to system power, memory, and I/O.' }
};

function wirePackageDetails() {
    const controls = stage.querySelectorAll('[data-part]');
    const kicker = stage.querySelector('#package-detail-kicker');
    const heading = stage.querySelector('#package-detail-title');
    const description = stage.querySelector('#package-detail-copy');
    if (!controls.length || !kicker || !heading || !description) return;

    const selectPart = (key) => {
        const part = packageParts[key];
        if (!part) return;
        kicker.textContent = 'SELECTED COMPONENT';
        heading.textContent = part.title;
        description.textContent = part.copy;
        controls.forEach((control) => {
            const selected = control.dataset.part === key;
            control.classList.toggle('is-selected', selected);
            control.setAttribute('aria-pressed', String(selected));
        });
    };

    controls.forEach((control) => {
        control.addEventListener('click', () => selectPart(control.dataset.part));
        control.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            selectPart(control.dataset.part);
        });
    });
}

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

    if (key === 'chip') wirePackageDetails();

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
