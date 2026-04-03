
const PRESETS = [
     { name: 'Classic', arr: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
     { name: 'All Neg', arr: [-5, -3, -1, -4, -2, -6] },
     { name: 'All Pos', arr: [1, 2, 3, 4, 5, 6, 7] },
     { name: 'Zigzag', arr: [5, -3, 5, -3, 5, -3, 5] },
     { name: 'Worst BF', arr: [-1, -2, -3, -4, -5, -6, -7, -8] },
];

let currentAlgo = 'bf';
let arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
let steps = [];
let stepIdx = -1;
let playing = false;
let playTimer = null;
let speed = 1;
let totalOps = 0;


const PSEUDOCODES = {
     bf: [
          { t: '<span class="pc-fn">BruteForce</span>(A[0..n-1])', tip: 'Entry point. A is our array, n is its length.' },
          { t: '  <span class="pc-kw">let</span> maxSum = A[0] <span class="pc-cm">// start pessimistic</span>', tip: 'Initialize global maximum to first element (handles all-negative arrays).' },
          { t: '  <span class="pc-kw">let</span> bestL=0, bestR=0', tip: 'Track indices of the best subarray found so far.' },
          { t: '  <span class="pc-kw">for</span> i = 0 <span class="pc-kw">to</span> n-1 <span class="pc-cm">// outer: start</span>', tip: 'First loop: try every possible start index i.' },
          { t: '    <span class="pc-kw">for</span> j = i <span class="pc-kw">to</span> n-1 <span class="pc-cm">// middle: end</span>', tip: 'Second loop: try every possible end index j ≥ i.' },
          { t: '      <span class="pc-kw">let</span> sum = 0', tip: 'Reset accumulator for this (i,j) pair.' },
          { t: '      <span class="pc-kw">for</span> k = i <span class="pc-kw">to</span> j <span class="pc-cm">// inner: sum</span>', tip: 'Third loop: sum all elements from index i to j. This is the O(n³) culprit.' },
          { t: '        sum += A[k]', tip: 'Add each element. Every step here is one comparison operation.' },
          { t: '      <span class="pc-kw">if</span> sum > maxSum', tip: 'Did we find a new best subarray?' },
          { t: '        maxSum=sum; bestL=i; bestR=j', tip: 'Update global best: save the sum and the indices [i..j].' },
          { t: '  <span class="pc-kw">return</span> maxSum, bestL, bestR', tip: 'Return the maximum sum and the indices of the winning subarray.' },
     ],
     dc: [
          { t: '<span class="pc-fn">DivideConquer</span>(A, lo, hi)', tip: 'Recursive call on subarray A[lo..hi].' },
          { t: '  <span class="pc-kw">if</span> lo == hi: <span class="pc-kw">return</span> A[lo], lo, lo', tip: 'Base case: single element — it is trivially its own max subarray.' },
          { t: '  mid = (lo + hi) / 2', tip: 'Split point. Left half: [lo..mid], Right half: [mid+1..hi].' },
          { t: '  lMax,lL,lR = DivideConquer(A, lo, mid)', tip: 'Recurse on LEFT half. Best subarray entirely within A[lo..mid].' },
          { t: '  rMax,rL,rR = DivideConquer(A, mid+1, hi)', tip: 'Recurse on RIGHT half. Best subarray entirely within A[mid+1..hi].' },
          { t: '  cMax,cL,cR = CrossingMax(A, lo, mid, hi)', tip: 'MERGE step: find best subarray that CROSSES the midpoint.' },
          { t: '  <span class="pc-kw">return</span> max(lMax, rMax, cMax)', tip: 'Winner among left, right, and crossing. This is the key insight of D&C.' },
          { t: '', tip: '' },
          { t: '<span class="pc-fn">CrossingMax</span>(A, lo, mid, hi)', tip: 'Find best subarray that includes A[mid] and A[mid+1].' },
          { t: '  leftSum=−∞; sum=0', tip: 'Scan LEFT from mid towards lo.' },
          { t: '  <span class="pc-kw">for</span> i = mid <span class="pc-kw">downto</span> lo', tip: 'Expand leftward, tracking running sum and max suffix sum.' },
          { t: '    sum+=A[i]; leftSum=max(leftSum,sum)', tip: 'Update max suffix. leftSum is the best ending at mid.' },
          { t: '  rightSum=−∞; sum=0', tip: 'Scan RIGHT from mid+1 towards hi.' },
          { t: '  <span class="pc-kw">for</span> j = mid+1 <span class="pc-kw">to</span> hi', tip: 'Expand rightward, tracking running sum and max prefix sum.' },
          { t: '    sum+=A[j]; rightSum=max(rightSum,sum)', tip: 'Update max prefix. rightSum is the best starting at mid+1.' },
          { t: '  <span class="pc-kw">return</span> leftSum+rightSum', tip: 'Crossing max is left suffix + right prefix. Always includes the split point.' },
     ],
     ka: [
          { t: '<span class="pc-fn">Kadane</span>(A[0..n-1])', tip: 'Entry point. Single left-to-right scan — O(n) time, O(1) space.' },
          { t: '  <span class="pc-kw">let</span> currMax = A[0]', tip: 'Current subarray sum. Starts at first element.' },
          { t: '  <span class="pc-kw">let</span> globalMax = A[0]', tip: 'Global best seen so far. Initialize same as currMax.' },
          { t: '  bestL=0; bestR=0; tempL=0', tip: 'Track indices. tempL marks where current subarray begins.' },
          { t: '  <span class="pc-kw">for</span> i = 1 <span class="pc-kw">to</span> n-1', tip: 'Iterate through each element exactly once.' },
          { t: '    <span class="pc-kw">if</span> currMax + A[i] < A[i]', tip: 'DP decision: is it better to extend or start fresh at A[i]?' },
          { t: '      currMax = A[i]', tip: 'Starting fresh at A[i] is better — reset current subarray.' },
          { t: '      tempL = i', tip: 'The new subarray starts at index i.' },
          { t: '    <span class="pc-kw">else</span>', tip: 'Extending the previous subarray is better (or equal).' },
          { t: '      currMax += A[i]', tip: 'Extend: add A[i] to the current running sum.' },
          { t: '    <span class="pc-kw">if</span> currMax > globalMax', tip: 'Have we beaten the best subarray found so far?' },
          { t: '      globalMax=currMax; bestL=tempL; bestR=i', tip: 'Update global best and record the winning subarray indices.' },
          { t: '  <span class="pc-kw">return</span> globalMax, bestL, bestR', tip: 'Return the maximum sum and the subarray that achieves it.' },
     ],
};


function generateBFSteps(a) {
     const steps = [];
     const n = a.length;
     let maxSum = a[0], bestL = 0, bestR = 0, ops = 0;

     steps.push({
          type: 'init', pc: 0, ops, maxSum: a[0], bestL: 0, bestR: 0,
          explain: `<div class="step-title">Initialize Brute Force</div>Array has <code>n=${n}</code> elements. maxSum initialized to <code>A[0]=${a[0]}</code>.`,
          highlight: [], maxHL: []
     });

     for (let i = 0; i < n; i++) {
          steps.push({
               type: 'outer', pc: 3, i, ops, maxSum, bestL, bestR,
               explain: `<div class="step-title">Outer Loop: i = ${i}</div>Trying all subarrays starting at index <code>i=${i}</code> (value <code>${a[i]}</code>).`,
               highlight: [i], maxHL: range(bestL, bestR)
          });

          for (let j = i; j < n; j++) {
               let sum = 0;
               steps.push({
                    type: 'middle', pc: 4, i, j, ops, maxSum, bestL, bestR, sum,
                    explain: `<div class="step-title">Middle Loop: j = ${j}</div>Subarray from <code>i=${i}</code> to <code>j=${j}</code>. Will accumulate sum.`,
                    highlight: range(i, j), maxHL: range(bestL, bestR)
               });

               for (let k = i; k <= j; k++) {
                    ops++;
                    sum += a[k];
                    steps.push({
                         type: 'inner', pc: 6, i, j, k, sum, ops, maxSum, bestL, bestR,
                         explain: `<div class="step-title">Inner Loop: k = ${k}</div>Adding <code>A[${k}]=${a[k]}</code>. Running sum: <code>${sum}</code>. Total ops: <code>${ops}</code>.`,
                         highlight: range(i, j), activeK: k, maxHL: range(bestL, bestR)
                    });
               }

               steps.push({
                    type: 'compare', pc: 8, i, j, sum, ops, maxSum, bestL, bestR,
                    explain: `<div class="step-title">Compare</div>Subarray [${i}..${j}] has sum <code>${sum}</code>. Current max is <code>${maxSum}</code>. ${sum > maxSum ? '<strong>New maximum found!</strong>' : 'No update.'}`,
                    highlight: range(i, j), maxHL: range(bestL, bestR)
               });

               if (sum > maxSum) {
                    maxSum = sum; bestL = i; bestR = j;
                    steps.push({
                         type: 'update', pc: 9, i, j, sum, ops, maxSum, bestL, bestR,
                         explain: `<div class="step-title">Update Maximum</div>New best subarray: <code>[${i}..${j}]</code> with sum <code>${maxSum}</code>.`,
                         highlight: range(bestL, bestR), maxHL: range(bestL, bestR)
                    });
               }
          }
     }

     steps.push({
          type: 'done', pc: 10, ops, maxSum, bestL, bestR,
          explain: `<div class="step-title">Complete!</div>Maximum subarray: <code>A[${bestL}..${bestR}] = [${a.slice(bestL, bestR + 1).join(',')}]</code><br>Maximum sum: <code>${maxSum}</code><br>Total operations: <code>${ops}</code>`,
          highlight: range(bestL, bestR), maxHL: range(bestL, bestR)
     });

     return steps;
}

function range(l, r) {
     const out = [];
     for (let i = l; i <= r; i++) out.push(i);
     return out;
}


let dcSteps = [];

function generateDCSteps(a) {
     dcSteps = [];
     let opsCount = 0;
     const treeNodes = [];

     function dc(lo, hi, depth, parentId) {
          const nodeId = treeNodes.length;
          treeNodes.push({ id: nodeId, lo, hi, depth, parentId, maxSum: null, result: null });

          dcSteps.push({
               type: 'dc_enter', pc: 0, lo, hi, depth, ops: opsCount, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
               maxHL: [], highlight: range(lo, hi), dcSide: 'none',
               explain: `<div class="step-title">Enter DivideConquer(${lo}, ${hi})</div>Depth: <code>${depth}</code>. Processing subarray <code>[${lo}..${hi}]</code> = <code>[${a.slice(lo, hi + 1).join(',')}]</code>.`
          });

          if (lo === hi) {
               opsCount++;
               treeNodes[nodeId].maxSum = a[lo];
               treeNodes[nodeId].result = { maxSum: a[lo], l: lo, r: lo };
               dcSteps.push({
                    type: 'dc_base', pc: 1, lo, hi, depth, ops: opsCount, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
                    maxHL: [], highlight: [lo], dcSide: 'none',
                    explain: `<div class="step-title">Base Case at index ${lo}</div>Single element <code>A[${lo}]=${a[lo]}</code> is trivially the max subarray of itself.`
               });
               return { maxSum: a[lo], l: lo, r: lo };
          }

          const mid = Math.floor((lo + hi) / 2);
          dcSteps.push({
               type: 'dc_split', pc: 2, lo, hi, mid, depth, ops: opsCount, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
               maxHL: [], highlight: range(lo, hi), dcSide: 'split', mid,
               explain: `<div class="step-title">Split at mid = ${mid}</div>Left half: <code>[${lo}..${mid}]</code> = <code>[${a.slice(lo, mid + 1).join(',')}]</code><br>Right half: <code>[${mid + 1}..${hi}]</code> = <code>[${a.slice(mid + 1, hi + 1).join(',')}]</code>`
          });

          const lRes = dc(lo, mid, depth + 1, nodeId);
          const rRes = dc(mid + 1, hi, depth + 1, nodeId);

          // Crossing
          dcSteps.push({
               type: 'dc_crossing', pc: 8, lo, hi, mid, depth, ops: opsCount, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
               maxHL: [], highlight: range(lo, hi), dcSide: 'crossing',
               explain: `<div class="step-title">CrossingMax(${lo}, ${mid}, ${hi})</div>Finding the best subarray that crosses the midpoint between <code>${mid}</code> and <code>${mid + 1}</code>.`
          });

          let leftSum = -Infinity, sum = 0, cL = mid;
          for (let i = mid; i >= lo; i--) {
               opsCount++;
               sum += a[i];
               dcSteps.push({
                    type: 'dc_cross_left', pc: 11, lo, hi, mid, i, sum, leftSum: Math.max(leftSum, sum), depth, ops: opsCount, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
                    maxHL: [], highlight: [...range(i, mid)], dcSide: 'crossing',
                    explain: `<div class="step-title">Expand Left: i = ${i}</div>A[${i}] = <code>${a[i]}</code>. sum = <code>${sum}</code>. leftSum = <code>${Math.max(leftSum, sum)}</code>.`
               });
               if (sum > leftSum) { leftSum = sum; cL = i; }
          }

          let rightSum = -Infinity; sum = 0; let cR = mid + 1;
          for (let j = mid + 1; j <= hi; j++) {
               opsCount++;
               sum += a[j];
               dcSteps.push({
                    type: 'dc_cross_right', pc: 14, lo, hi, mid, j, sum, rightSum: Math.max(rightSum, sum), depth, ops: opsCount, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
                    maxHL: [], highlight: [...range(mid + 1, j)], dcSide: 'crossing',
                    explain: `<div class="step-title">Expand Right: j = ${j}</div>A[${j}] = <code>${a[j]}</code>. sum = <code>${sum}</code>. rightSum = <code>${Math.max(rightSum, sum)}</code>.`
               });
               if (sum > rightSum) { rightSum = sum; cR = j; }
          }

          const cMax = leftSum + rightSum;
          const winner = Math.max(lRes.maxSum, rRes.maxSum, cMax);
          let winRes;
          if (winner === cMax) winRes = { maxSum: cMax, l: cL, r: cR };
          else if (winner === lRes.maxSum) winRes = lRes;
          else winRes = rRes;

          treeNodes[nodeId].maxSum = winner;
          treeNodes[nodeId].result = winRes;

          dcSteps.push({
               type: 'dc_merge', pc: 6, lo, hi, mid, depth, ops: opsCount,
               lMax: lRes.maxSum, rMax: rRes.maxSum, cMax, winner, winRes, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
               maxHL: range(winRes.l, winRes.r), highlight: range(winRes.l, winRes.r), dcSide: 'none',
               explain: `<div class="step-title">Merge Result [${lo}..${hi}]</div>Left max: <code>${lRes.maxSum}</code>, Right max: <code>${rRes.maxSum}</code>, Cross max: <code>${cMax}</code>.<br>Winner: <code>${winner}</code> → subarray <code>[${winRes.l}..${winRes.r}]</code>.`
          });

          return winRes;
     }

     const finalRes = dc(0, a.length - 1, 0, null);
     dcSteps.push({
          type: 'done', pc: 6, ops: opsCount, treeNodes: JSON.parse(JSON.stringify(treeNodes)),
          maxHL: range(finalRes.l, finalRes.r), highlight: range(finalRes.l, finalRes.r), dcSide: 'none',
          maxSum: finalRes.maxSum, bestL: finalRes.l, bestR: finalRes.r,
          explain: `<div class="step-title">Complete!</div>Maximum subarray: <code>A[${finalRes.l}..${finalRes.r}] = [${a.slice(finalRes.l, finalRes.r + 1).join(',')}]</code><br>Maximum sum: <code>${finalRes.maxSum}</code><br>Operations: <code>${opsCount}</code>`
     });

     return dcSteps;
}

function generateKadaneSteps(a) {
     const steps = [];
     const n = a.length;
     let currMax = a[0], globalMax = a[0];
     let bestL = 0, bestR = 0, tempL = 0, ops = 0;
     const trace = [];

     steps.push({
          type: 'init', pc: 0, ops, currMax, globalMax, bestL, bestR, tempL, trace: [],
          highlight: [0], maxHL: [0],
          explain: `<div class="step-title">Initialize Kadane's</div>Set <code>currMax = globalMax = A[0] = ${a[0]}</code>. Scan begins at index 1.`
     });

     trace.push({ i: 0, val: a[0], curr: a[0], glob: a[0], decision: 'init' });

     for (let i = 1; i < n; i++) {
          ops++;
          const extend = currMax + a[i];
          const decision = extend < a[i] ? 'reset' : 'extend';

          steps.push({
               type: 'compare', pc: 5, i, ops, currMax, globalMax, bestL, bestR, tempL,
               trace: JSON.parse(JSON.stringify(trace)), highlight: [i], maxHL: range(bestL, bestR),
               extend, val: a[i],
               explain: `<div class="step-title">Evaluate i = ${i}</div>A[${i}] = <code>${a[i]}</code>. currMax + A[i] = <code>${extend}</code>. ${decision === 'reset' ? `Since <code>${extend} < ${a[i]}</code>, <strong>reset</strong> at index ${i}.` : `Since <code>${extend} ≥ ${a[i]}</code>, <strong>extend</strong> subarray.`}`
          });

          if (decision === 'reset') {
               currMax = a[i];
               tempL = i;
          } else {
               currMax = extend;
          }

          const updated = currMax > globalMax;
          if (updated) { globalMax = currMax; bestL = tempL; bestR = i; }

          trace.push({ i, val: a[i], curr: currMax, glob: globalMax, decision });

          steps.push({
               type: 'update', pc: decision === 'reset' ? 6 : 9, i, ops, currMax, globalMax, bestL, bestR, tempL,
               trace: JSON.parse(JSON.stringify(trace)), highlight: range(tempL, i), maxHL: range(bestL, bestR),
               decision, updated,
               explain: `<div class="step-title">${decision === 'reset' ? 'Reset' : 'Extend'} — ${updated ? 'New Max!' : 'No Max Update'}</div>currMax = <code>${currMax}</code>. globalMax = <code>${globalMax}</code>. Best subarray: <code>[${bestL}..${bestR}]</code>.`
          });
     }

     steps.push({
          type: 'done', pc: 12, ops, currMax, globalMax, bestL, bestR, tempL,
          trace: JSON.parse(JSON.stringify(trace)), highlight: range(bestL, bestR), maxHL: range(bestL, bestR),
          explain: `<div class="step-title">Complete!</div>Maximum subarray: <code>A[${bestL}..${bestR}] = [${a.slice(bestL, bestR + 1).join(',')}]</code><br>Maximum sum: <code>${globalMax}</code><br>Operations: <code>${ops}</code>`
     });

     return steps;
}



function renderArraySVG(step) {
     const svg = document.getElementById('arraySvg');
     const subSvg = document.getElementById('subarraySvg');
     const n = arr.length;
     if (!n) return;

     const W = svg.parentElement.clientWidth - 32;
     const barW = Math.max(20, Math.min(60, (W - 20) / n - 6));
     const gap = (W - n * barW) / (n + 1);
     const maxAbsVal = Math.max(...arr.map(Math.abs), 1);
     const chartH = 180;
     const zeroY = chartH * 0.6;
     const scale = (chartH * 0.55) / maxAbsVal;

     svg.setAttribute('height', chartH + 30);
     svg.setAttribute('viewBox', `0 0 ${W} ${chartH + 30}`);

     let html = '';

     html += `<line x1="0" y1="${zeroY}" x2="${W}" y2="${zeroY}" stroke="var(--border2)" stroke-width="1" stroke-dasharray="4,4"/>`;

     for (let i = 0; i < n; i++) {
          const x = gap + i * (barW + gap);
          const v = arr[i];
          const barH = Math.abs(v) * scale;
          const barY = v >= 0 ? zeroY - barH : zeroY;

          let color = v >= 0 ? 'var(--bar-pos)' : 'var(--bar-neg)';
          let opacity = '0.55';

          // Determine highlight
          const hl = step?.highlight || [];
          const maxHL = step?.maxHL || [];
          const isActive = hl.includes(i);
          const isMax = maxHL.includes(i);
          const isActiveK = step?.activeK === i;
          const dcSide = step?.dcSide;

          if (isMax) { color = 'var(--bar-max)'; opacity = '1'; }
          if (isActive) {
               opacity = '0.9';
               if (currentAlgo === 'dc' && dcSide === 'crossing') color = 'var(--bar-cross)';
               else if (currentAlgo === 'dc' && step?.mid !== undefined && i <= step.mid) color = 'var(--bar-left)';
               else if (currentAlgo === 'dc' && step?.mid !== undefined && i > step.mid) color = 'var(--bar-right)';
               else color = 'var(--bar-active)';
          }
          if (isActiveK) { color = 'var(--yellow)'; opacity = '1'; }

          html += `<rect x="${x}" y="${barY}" width="${barW}" height="${Math.max(barH, 1)}" rx="2" fill="${color}" opacity="${opacity}" class="bar" data-i="${i}">
      <title>Index ${i}: ${v}</title>
    </rect>`;

          html += `<text x="${x + barW / 2}" y="${chartH + 14}" text-anchor="middle" fill="var(--text3)" font-family="var(--mono)" font-size="9">${i}</text>`;
          const labelY = v >= 0 ? barY - 4 : barY + barH + 12;
          html += `<text x="${x + barW / 2}" y="${labelY}" text-anchor="middle" fill="${isActive || isMax ? 'var(--text)' : 'var(--text2)'}" font-family="var(--mono)" font-size="${barW > 30 ? 10 : 8}" font-weight="${isActive || isMax ? '700' : '400'}">${v}</text>`;
     }

     svg.innerHTML = html;

     const hl = step?.highlight || [];
     const maxHL = step?.maxHL || [];
     subSvg.setAttribute('viewBox', `0 0 ${W} 40`);
     subSvg.setAttribute('height', '40');
     let subHtml = '';

     if (hl.length > 1) {
          const x0 = gap + Math.min(...hl) * (barW + gap);
          const x1 = gap + Math.max(...hl) * (barW + gap) + barW;
          subHtml += `<rect x="${x0}" y="8" width="${x1 - x0}" height="24" rx="4" fill="var(--bar-active)" opacity="0.15" stroke="var(--bar-active)" stroke-width="1"/>`;
          const sum = hl.reduce((s, i) => s + arr[i], 0);
          subHtml += `<text x="${(x0 + x1) / 2}" y="24" text-anchor="middle" fill="var(--accent)" font-family="var(--mono)" font-size="10">sum = ${sum}</text>`;
     }

     if (maxHL.length > 1 && JSON.stringify(maxHL) !== JSON.stringify(hl)) {
          const x0 = gap + Math.min(...maxHL) * (barW + gap);
          const x1 = gap + Math.max(...maxHL) * (barW + gap) + barW;
          subHtml += `<rect x="${x0}" y="4" width="${x1 - x0}" height="32" rx="4" fill="var(--bar-max)" opacity="0.1" stroke="var(--bar-max)" stroke-width="1.5" stroke-dasharray="3,3"/>`;
     }

     subSvg.innerHTML = subHtml;
}

function renderDCTree(step) {
     const treeNodes = step?.treeNodes || [];
     if (!treeNodes.length) return;

     const svg = document.getElementById('dcTreeSvg');
     const W = svg.parentElement.clientWidth - 32;

     const byDepth = {};
     treeNodes.forEach(n => {
          if (!byDepth[n.depth]) byDepth[n.depth] = [];
          byDepth[n.depth].push(n);
     });

     const depths = Object.keys(byDepth).map(Number).sort((a, b) => a - b);
     const maxDepth = Math.max(...depths);
     const nodeH = 52, vGap = 36;
     const totalH = (maxDepth + 1) * (nodeH + vGap) + 20;

     svg.setAttribute('height', totalH);
     svg.setAttribute('viewBox', `0 0 ${W} ${totalH}`);

     const positions = {};
     depths.forEach(d => {
          const nodes = byDepth[d];
          const spacing = W / (nodes.length + 1);
          nodes.forEach((n, idx) => {
               positions[n.id] = { x: spacing * (idx + 1), y: 20 + d * (nodeH + vGap) };
          });
     });

     let html = '';


     treeNodes.forEach(n => {
          if (n.parentId !== null && positions[n.id] && positions[n.parentId]) {
               const p = positions[n.parentId];
               const c = positions[n.id];
               html += `<line x1="${p.x}" y1="${p.y + nodeH}" x2="${c.x}" y2="${c.y}" stroke="var(--border2)" stroke-width="1.5"/>`;
          }
     });


     const currentNode = step?.lo !== undefined ? treeNodes.find(n => n.lo === step.lo && n.hi === step.hi && n.depth === (step.depth || 0)) : null;

     treeNodes.forEach(n => {
          if (!positions[n.id]) return;
          const { x, y } = positions[n.id];
          const nodeW = Math.min(100, W / (byDepth[n.depth]?.length || 1) - 10);
          const isCurrent = currentNode && n.id === currentNode.id;
          const isDone = n.maxSum !== null;

          let fillColor = 'var(--surface2)';
          let strokeColor = 'var(--border2)';
          if (isCurrent) { fillColor = 'rgba(31,111,235,.2)'; strokeColor = 'var(--accent)'; }
          else if (isDone) { fillColor = 'rgba(63,185,80,.1)'; strokeColor = 'var(--green2)'; }

          html += `<rect x="${x - nodeW / 2}" y="${y}" width="${nodeW}" height="${nodeH}" rx="5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isCurrent ? 2 : 1}"/>`;
          html += `<text x="${x}" y="${y + 14}" text-anchor="middle" fill="var(--text3)" font-family="var(--mono)" font-size="8">[${n.lo}..${n.hi}]</text>`;
          html += `<text x="${x}" y="${y + 28}" text-anchor="middle" fill="var(--text2)" font-family="var(--mono)" font-size="9">[${arr.slice(n.lo, n.hi + 1).join(',')}]</text>`;
          if (isDone) {
               html += `<text x="${x}" y="${y + 44}" text-anchor="middle" fill="var(--green)" font-family="var(--mono)" font-size="10" font-weight="700">max=${n.maxSum}</text>`;
          }
     });

     svg.innerHTML = html;

     document.getElementById('dcDepthDisplay').textContent = step?.depth ?? '—';
}

function renderKadaneTrace(step) {
     const trace = step?.trace || [];
     const body = document.getElementById('kadaneTraceBody');
     let html = '';
     trace.forEach((row, idx) => {
          const isLast = idx === trace.length - 1;
          html += `<div class="trace-row${isLast ? ' active' : ''}">
      <span>${row.i}</span>
      <span style="color:${row.val >= 0 ? 'var(--green)' : 'var(--red)'}">${row.val}</span>
      <span style="color:var(--accent)">${row.curr}</span>
      <span style="color:var(--yellow)">${row.glob}</span>
      <span>${row.decision}</span>
    </div>`;
     });
     body.innerHTML = html;
     body.scrollTop = body.scrollHeight;
}

function renderComplexityChart() {
     const svg = document.getElementById('complexitySvg');
     const wrap = document.getElementById('complexityWrap');
     const W = wrap.clientWidth - 32;
     const H = wrap.clientHeight - 60;
     if (W < 100 || H < 100) return;

     svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
     svg.setAttribute('height', H);

     const pad = { l: 60, r: 20, t: 20, b: 50 };
     const chartW = W - pad.l - pad.r;
     const chartH = H - pad.t - pad.b;

     const ns = [];
     for (let i = 1; i <= 12; i++) ns.push(i);

     const ops = { bf: ns.map(n => n * n * n), dc: ns.map(n => Math.max(1, n * Math.log2(Math.max(n, 2)))), ka: ns.map(n => n) };
     const maxOp = Math.max(...ops.bf);

     const xScale = n => pad.l + ((n - 1) / (12 - 1)) * chartW;
     const yScale = v => pad.t + chartH - (v / maxOp) * chartH;

     let html = '';


     for (let i = 0; i <= 5; i++) {
          const y = pad.t + (i / 5) * chartH;
          const v = Math.round(maxOp * (1 - i / 5));
          html += `<line x1="${pad.l}" y1="${y}" x2="${pad.l + chartW}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
          html += `<text x="${pad.l - 5}" y="${y + 4}" text-anchor="end" fill="var(--text3)" font-family="var(--mono)" font-size="9">${v}</text>`;
     }
     for (let n = 1; n <= 12; n++) {
          const x = xScale(n);
          html += `<line x1="${x}" y1="${pad.t}" x2="${x}" y2="${pad.t + chartH}" stroke="var(--border)" stroke-width="1"/>`;
          html += `<text x="${x}" y="${pad.t + chartH + 16}" text-anchor="middle" fill="var(--text3)" font-family="var(--mono)" font-size="9">n=${n}</text>`;
     }


     html += `<text x="${pad.l + chartW / 2}" y="${H - 4}" text-anchor="middle" fill="var(--text2)" font-family="var(--mono)" font-size="10">Input Size (n)</text>`;
     html += `<text x="12" y="${pad.t + chartH / 2}" text-anchor="middle" fill="var(--text2)" font-family="var(--mono)" font-size="10" transform="rotate(-90,12,${pad.t + chartH / 2})">Operations</text>`;

     const algoMeta = [
          { key: 'bf', color: 'var(--red)', label: 'O(n³) Brute Force' },
          { key: 'dc', color: 'var(--purple)', label: 'O(n log n) D&C' },
          { key: 'ka', color: 'var(--green)', label: 'O(n) Kadane\'s' },
     ];

     algoMeta.forEach(({ key, color, label }) => {
          const pts = ns.map(n => `${xScale(n)},${yScale(ops[key][n - 1])}`).join(' ');
          html += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
          ns.forEach(n => {
               html += `<circle cx="${xScale(n)}" cy="${yScale(ops[key][n - 1])}" r="3" fill="${color}"/>`;
          });
     });

     if (arr.length > 0) {
          const n = arr.length;
          const cx = xScale(Math.min(n, 12));
          algoMeta.forEach(({ key, color }) => {
               const vy = yScale(ops[key][Math.min(n, 12) - 1]);
               html += `<circle cx="${cx}" cy="${vy}" r="6" fill="${color}" opacity="0.5" stroke="${color}" stroke-width="2"/>`;
          });
          html += `<line x1="${cx}" y1="${pad.t}" x2="${cx}" y2="${pad.t + chartH}" stroke="var(--yellow)" stroke-width="1" stroke-dasharray="4,3"/>`;
          html += `<text x="${cx + 6}" y="${pad.t + 12}" fill="var(--yellow)" font-family="var(--mono)" font-size="9">n=${n}</text>`;
     }

     algoMeta.forEach(({ color, label }, i) => {
          const lx = pad.l + i * (chartW / 3 + 20);
          const ly = H - 8;
          html += `<rect x="${lx}" y="${ly - 10}" width="14" height="4" rx="2" fill="${color}"/>`;
          html += `<text x="${lx + 18}" y="${ly - 4}" fill="var(--text2)" font-family="var(--mono)" font-size="9">${label}</text>`;
     });

     svg.innerHTML = html;
}


function renderPseudocode(activePC) {
     const pc = PSEUDOCODES[currentAlgo];
     const el = document.getElementById('pseudocode');
     el.innerHTML = pc.map((line, i) => {
          const isActive = i === activePC;
          return `<div class="pc-line${isActive ? ' active' : ''}">
      <span class="pc-num">${i + 1}</span>
      <span class="pc-text">${line.t}</span>
      ${line.tip ? `<div class="pc-tip">${line.tip}</div>` : ''}
    </div>`;
     }).join('');

     if (activePC !== undefined && activePC >= 0) {
          const lines = el.querySelectorAll('.pc-line');
          lines[activePC]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
     }
}


function renderHistory() {
     const el = document.getElementById('stepHistory');
     const maxShow = 40;
     const start = Math.max(0, stepIdx - maxShow + 1);
     let html = '';
     for (let i = start; i <= Math.min(stepIdx, steps.length - 1); i++) {
          const s = steps[i];
          const isActive = i === stepIdx;
          html += `<div class="history-row${isActive ? ' active' : ''}" onclick="jumpToStep(${i})">
      <span class="hn">#${i + 1}</span>
      <span class="ht">${s.type}</span>
      <span class="hv">${s.ops !== undefined ? s.ops + 'ops' : ''}</span>
    </div>`;
     }
     el.innerHTML = html;
     el.scrollTop = el.scrollHeight;
}


function applyStep(idx) {
     if (idx < 0 || idx >= steps.length) return;
     stepIdx = idx;
     const s = steps[idx];

     document.getElementById('stepCounter').textContent = `${idx + 1} / ${steps.length}`;
     document.getElementById('statStep').textContent = idx + 1;
     document.getElementById('statOps').textContent = s.ops ?? 0;

     const ms = s.maxSum ?? s.globalMax;
     document.getElementById('statMax').textContent = ms !== undefined ? ms : '—';

     const cs = s.sum ?? s.currMax;
     document.getElementById('statCurr').textContent = cs !== undefined ? cs : '—';

     if (s.type === 'done') {
          const bL = s.bestL ?? 0, bR = s.bestR ?? 0;
          document.getElementById('resultDisplay').innerHTML =
               `<div style="color:var(--yellow);font-size:14px;font-weight:700">Max Sum: ${ms}</div>
       <div>Subarray: [${arr.slice(bL, bR + 1).join(', ')}]</div>
       <div style="color:var(--text3)">Indices: [${bL}..${bR}]</div>`;
     }

     renderPseudocode(s.pc);

     document.getElementById('stepExplain').innerHTML = s.explain || '';

     renderArraySVG(s);

     if (currentAlgo === 'dc') {
          renderDCTree(s);
          document.getElementById('dcMergeWrap').style.display = '';
          const mergeEl = document.getElementById('dcMergeInfo');
          if (s.lMax !== undefined) {
               mergeEl.innerHTML = `Left max: <span class="highlight-val">${s.lMax}</span> &nbsp; Right max: <span class="highlight-val">${s.rMax}</span> &nbsp; Cross max: <span class="highlight-val">${s.cMax}</span> &nbsp; → Winner: <span class="highlight-val">${s.winner}</span>`;
          } else {
               mergeEl.innerHTML = s.type;
          }
     } else {
          document.getElementById('dcMergeWrap').style.display = 'none';
     }

     if (currentAlgo === 'ka') renderKadaneTrace(s);

     renderOpBars(s.ops ?? 0);

     renderHistory();

     if (s.type === 'done') setStatus('done', `Complete! Max sum = ${ms}`);
     else setStatus('running', `Step ${idx + 1}/${steps.length} — ${s.type}`);
}

function renderOpBars(ops) {
     const el = document.getElementById('opBars');
     const n = arr.length;
     const theoretical = { bf: n * n * n, dc: Math.round(n * Math.log2(Math.max(n, 2)) * 2), ka: n };
     const key = currentAlgo;
     const max = theoretical[key] || 1;
     const pct = Math.min(100, (ops / max) * 100);
     const color = currentAlgo === 'bf' ? 'var(--red)' : currentAlgo === 'dc' ? 'var(--purple)' : 'var(--green)';

     el.innerHTML = `<div class="op-bar-row">
    <span class="obl">Operations</span>
    <div class="op-bar-bg"><div class="op-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    <span class="obv">${ops} / ~${theoretical[key]}</span>
  </div>`;
}


function buildSteps() {
     const raw = document.getElementById('customInput').value;
     const parsed = raw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
     if (!parsed.length) return;
     arr = parsed;

     steps = [];
     stepIdx = -1;
     playing = false;
     clearInterval(playTimer);

     if (currentAlgo === 'bf') steps = generateBFSteps(arr);
     else if (currentAlgo === 'dc') steps = generateDCSteps(arr);
     else steps = generateKadaneSteps(arr);

     document.getElementById('playBtn').textContent = '▶';
     document.getElementById('playBtn').className = 'ctl-btn play';

     renderComplexityChart();
     setStatus('idle', `${steps.length} steps generated. Press ▷ or ▶ to begin.`);
     renderPseudocode(-1);
     document.getElementById('stepHistory').innerHTML = '';
     document.getElementById('statStep').textContent = '—';
     document.getElementById('statOps').textContent = '0';
     document.getElementById('statMax').textContent = '—';
     document.getElementById('statCurr').textContent = '—';
     document.getElementById('resultDisplay').textContent = 'Run algorithm to see result';
     document.getElementById('stepCounter').textContent = `0 / ${steps.length}`;

     renderArraySVG(null);
     document.getElementById('kadaneTraceBody').innerHTML = '';
}

function stepForward() {
     if (!steps.length) return;
     if (stepIdx < steps.length - 1) applyStep(stepIdx + 1);
}

function stepBack() {
     if (stepIdx > 0) applyStep(stepIdx - 1);
}

function togglePlay() {
     if (playing) {
          playing = false;
          clearInterval(playTimer);
          document.getElementById('playBtn').textContent = '▶';
          document.getElementById('playBtn').className = 'ctl-btn play';
          setStatus('idle', 'Paused.');
     } else {
          playing = true;
          document.getElementById('playBtn').textContent = '⏸';
          document.getElementById('playBtn').className = 'ctl-btn pause';
          setStatus('running', 'Playing…');
          if (stepIdx >= steps.length - 1) stepIdx = -1;
          const interval = Math.round(1200 / speed);
          playTimer = setInterval(() => {
               if (stepIdx >= steps.length - 1) {
                    clearInterval(playTimer);
                    playing = false;
                    document.getElementById('playBtn').textContent = '▶';
                    document.getElementById('playBtn').className = 'ctl-btn play';
                    setStatus('done', 'Playback complete!');
               } else {
                    applyStep(stepIdx + 1);
               }
          }, interval);
     }
}

function reset() {
     playing = false;
     clearInterval(playTimer);
     stepIdx = -1;
     document.getElementById('playBtn').textContent = '▶';
     document.getElementById('playBtn').className = 'ctl-btn play';
     renderArraySVG(null);
     document.getElementById('pseudocode').innerHTML = '';
     document.getElementById('stepHistory').innerHTML = '';
     document.getElementById('stepExplain').innerHTML = '<div class="step-title">Reset</div><p>Build steps and press Play to begin.</p>';
     document.getElementById('statStep').textContent = '—';
     document.getElementById('statOps').textContent = '0';
     document.getElementById('statMax').textContent = '—';
     document.getElementById('statCurr').textContent = '—';
     document.getElementById('resultDisplay').textContent = 'Run algorithm to see result';
     document.getElementById('stepCounter').textContent = `0 / ${steps.length}`;
     document.getElementById('kadaneTraceBody').innerHTML = '';
     setStatus('idle', 'Reset. Ready to run.');
}

function jumpToStep(idx) {
     if (playing) togglePlay();
     applyStep(idx);
}

function updateSpeed() {
     const v = document.getElementById('speedSlider').value;
     const speeds = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
     speed = speeds[v - 1];
     document.getElementById('speedVal').textContent = `${speed}×`;
}

function setPreset(idx) {
     const p = PRESETS[idx];
     document.getElementById('customInput').value = p.arr.join(',');
     buildSteps();
}

function setStatus(type, msg) {
     const dot = document.getElementById('statusDot');
     const text = document.getElementById('statusText');
     dot.className = `status-dot ${type}`;
     text.textContent = msg;
}

function toggleCollapse(header) {
     const body = header.nextElementSibling;
     body.classList.toggle('hidden');
     header.classList.toggle('collapsed');
}


document.querySelectorAll('.viz-tab').forEach(tab => {
     tab.addEventListener('click', () => {
          document.querySelectorAll('.viz-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.viz-panel').forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(`panel-${tab.dataset.panel}`).classList.add('active');
          if (tab.dataset.panel === 'complexity') setTimeout(renderComplexityChart, 50);
     });
});

document.querySelectorAll('.algo-tab').forEach(tab => {
     tab.addEventListener('click', () => {
          document.querySelectorAll('.algo-tab').forEach(t => { t.className = `algo-tab ${t.dataset.algo}`; });
          tab.classList.add('active');
          currentAlgo = tab.dataset.algo;
          reset();
          buildSteps();
     });
});


document.addEventListener('keydown', e => {
     if (e.target.tagName === 'INPUT') return;
     if (e.key === 'ArrowRight' || e.key === '.') stepForward();
     if (e.key === 'ArrowLeft' || e.key === ',') stepBack();
     if (e.key === ' ') { e.preventDefault(); togglePlay(); }
     if (e.key === 'r' || e.key === 'R') reset();
});


window.addEventListener('resize', () => {
     if (stepIdx >= 0) renderArraySVG(steps[stepIdx]);
     renderComplexityChart();
});


renderPseudocode(-1);
buildSteps();
renderComplexityChart();

setTimeout(() => {
     applyStep(0);
}, 300);
