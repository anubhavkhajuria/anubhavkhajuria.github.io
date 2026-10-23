const dialog = document.getElementById('egg-dialog');
const stage = document.getElementById('egg-stage');
const title = document.getElementById('egg-title');
const copy = document.getElementById('egg-copy');
const label = document.getElementById('egg-label');
const foot = document.getElementById('egg-foot-label');
const closeButton = document.getElementById('egg-close');
const easterEggs = {
    cuda: {
        template: 'gpu-template',
        label: 'GPU PROGRAMMING / EXECUTION MODEL',
        title: '32 lanes. One warp. In motion.',
        copy: 'A warp issues one instruction across 32 lanes. Watch each lane light up as the block advances.',
        foot: 'CUDA / SIMT / MEMORY COALESCING'
    },
    mlir: {
        template: 'mlir-template',
        label: 'COMPILER EASTER EGG / PROGRESSIVE LOWERING',
        title: 'From tensor intent to machine work.',
        copy: 'MLIR moves through levels of abstraction so each pass can make a more hardware-aware decision.',
        foot: 'MLIR / LLVM / CODE GENERATION'
    },
    chip: {
        template: 'chip-template',
        label: 'CHIPLET EASTER EGG / ADVANCED PACKAGING',
        title: 'The package is part of the architecture.',
        copy: '2.5D links and 3D stacks bring compute and memory closer, while making the data path visible.',
        foot: '2.5D / 3D / HETEROGENEOUS SYSTEMS'
    }
};

function openEasterEgg(key) {
    const item = easterEggs[key];
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
    if (!dialog.open) dialog.showModal();
}

document.querySelectorAll('.egg-trigger[data-egg]').forEach((trigger) => {
    trigger.addEventListener('click', () => openEasterEgg(trigger.dataset.egg));
});

closeButton?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
});

let typed = '';
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        typed = '';
        return;
    }
    if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return;
    typed = (typed + event.key.toLowerCase()).slice(-4);
    if (easterEggs[typed]) {
        openEasterEgg(typed);
        typed = '';
    }
});
