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
    lid: { kicker: 'THERMAL PATH', title: 'Heat spreader / lid', copy: 'The lid spreads heat from the dies toward a cooler. In production packages it also protects the silicon and helps maintain a flat mounting surface.', facts: ['Often copper or another thermally conductive material', 'Transfers heat through the thermal interface material', 'Mechanical design and die height affect contact'] },
    tim: { kicker: 'THERMAL PATH', title: 'Thermal interface material', copy: 'TIM fills microscopic gaps between the die tops and heat spreader, reducing thermal resistance across that contact.', facts: ['Sits between silicon and the lid', 'May be paste, film, solder, or another interface material', 'Not an electrical interconnect'] },
    compute: { kicker: 'LOGIC DIE', title: 'GPU compute chiplet', copy: 'The compute die runs parallel workloads. Placing it beside HBM can shorten the physical path for high-bandwidth memory traffic.', facts: ['Contains compute units, cache, and control logic', 'Connects to the package through microbumps', 'Shares interposer routing with memory and I/O'] },
    io: { kicker: 'LOGIC DIE', title: 'I/O chiplet', copy: 'A separate I/O die can host memory controllers, fabric links, and external interfaces while compute dies use a process optimized for logic.', facts: ['Connects internal fabric to package-level links', 'May integrate memory controllers and SerDes PHYs', 'The exact split depends on the system design'] },
    hbm: { kicker: 'STACKED MEMORY', title: 'HBM stack', copy: 'High Bandwidth Memory stacks DRAM dies vertically over a base die. Many parallel connections provide a wide interface close to the processor.', facts: ['DRAM dies are joined with vertical TSV connections', 'The base die fans signals out to the package', 'Multiple stacks can connect to one compute package'] },
    ports: { kicker: 'PACKAGE INTERFACE', title: 'High-speed ports and PHYs', copy: 'Physical-layer circuits condition and transmit signals between the chiplet fabric and external links. Ports connect the package to memory, other devices, or the board.', facts: ['SerDes converts between serial links and internal parallel data', 'PHYs handle electrical signaling and link training', 'Port locations constrain routing and package escape'] },
    microbumps: { kicker: 'DIE-TO-INTERPOSER', title: 'Microbumps', copy: 'Tiny solder joints connect each die to the interposer. Dense arrays carry signals, power, and ground between the silicon layers.', facts: ['Used at die-to-interposer and some die-to-die interfaces', 'Signal, power, and ground bumps share the array', 'Fine-pitch placement enables high connection density'] },
    pitch: { kicker: 'INTERCONNECT GEOMETRY', title: 'Bump pitch', copy: 'Pitch is the center-to-center spacing between neighboring bumps or pads. It sets a key limit on connection density and routing geometry.', facts: ['Smaller pitch can support more connections per area', 'The achievable pitch depends on the process and assembly', 'This conceptual drawing is not to scale and gives no fixed value'] },
    interposer: { kicker: '2.5D INTEGRATION', title: 'Silicon interposer', copy: 'The interposer provides dense lateral wiring between side-by-side compute, I/O, and HBM dies. TSVs carry selected connections down to the package substrate.', facts: ['Contains fine-pitch redistribution wiring', 'Hosts chiplets and memory stacks on one surface', 'Bridges signals and power toward the substrate'] },
    tsv: { kicker: 'VERTICAL INTERCONNECT', title: 'Through-silicon vias (TSVs)', copy: 'TSVs are conductive vias through silicon. They connect stacked HBM dies vertically and can route interposer signals down to the substrate.', facts: ['Filled with conductive material, commonly copper', 'HBM TSVs pass through memory dies', 'Interposer TSVs connect upper routing to lower package layers'] },
    rdl: { kicker: 'LATERAL INTERCONNECT', title: 'Redistribution layers (RDL)', copy: 'RDL metal layers reroute fine-pitch die connections across the interposer or package to reach the required bumps and vias.', facts: ['Routes data, clock, power, and ground', 'Multiple metal layers can cross and connect through vias', 'Trace width and spacing affect resistance and signal integrity'] },
    c4: { kicker: 'PACKAGE INTERCONNECT', title: 'C4 bumps', copy: 'Controlled Collapse Chip Connection bumps join the interposer to the organic package substrate. They are generally coarser than die-level microbumps.', facts: ['Connect interposer pads to substrate pads', 'Carry signals and distribute power and ground', 'Bridge fine silicon wiring to package routing'] },
    substrate: { kicker: 'PACKAGE BASE', title: 'Organic package substrate', copy: 'The substrate provides coarser multilayer routing, power distribution, and mechanical support between the silicon package and the circuit board.', facts: ['Builds out connections from the interposer', 'Routes power, ground, clocks, and I/O signals', 'Terminates at a larger array of board-level solder balls'] },
    bga: { kicker: 'BOARD INTERCONNECT', title: 'BGA solder balls', copy: 'The ball grid array connects the package substrate to matching pads on the printed circuit board.', facts: ['A regular array carries signals and power to the board', 'Ball placement and board routing affect escape paths', 'Solder joints also provide the package-to-board mechanical bond'] },
    pcb: { kicker: 'SYSTEM CONNECTION', title: 'Printed circuit board and ports', copy: 'The board routes package connections to power delivery, memory, expansion links, and other system components.', facts: ['Board traces connect package balls to system components', 'Power planes and decoupling support stable supply voltage', 'External ports connect the package to the wider system'] }
};

function wirePackageDetails() {
    const controls = stage.querySelectorAll('[data-part]');
    const kicker = stage.querySelector('#package-detail-kicker');
    const heading = stage.querySelector('#package-detail-title');
    const description = stage.querySelector('#package-detail-copy');
    const facts = stage.querySelector('#package-detail-facts');
    if (!controls.length || !kicker || !heading || !description || !facts) return;

    const selectPart = (key) => {
        const part = packageParts[key];
        if (!part) return;
        kicker.textContent = part.kicker;
        heading.textContent = part.title;
        description.textContent = part.copy;
        facts.replaceChildren(...part.facts.map((fact) => {
            const item = document.createElement('li');
            item.textContent = fact;
            return item;
        }));
        controls.forEach((control) => {
            const selected = control.dataset.part === key;
            control.classList.toggle('is-selected', selected);
            control.setAttribute('aria-pressed', String(selected));
        });
    };

    controls.forEach((control) => control.addEventListener('click', () => selectPart(control.dataset.part)));
    selectPart('compute');
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
