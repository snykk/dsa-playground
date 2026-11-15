import { HUFFMAN_CODE, huffmanTrace, parseHuffman, type HuffmanInput } from '../algorithms/huffmanCoding';
import { deadlineTrace, JOB_CODE, orderTrace, parseJobs, type JobInput } from '../algorithms/jobScheduling';
import type { VizSpec } from '../core/types';
import { HuffmanForest, stabilizeHuffman, type HuffmanState } from '../renderers/HuffmanForest';
import { IntervalTimeline, type IntervalTimelineState } from '../renderers/IntervalTimeline';
import { JobSlots, stabilizeSlots, type JobSlotsState } from '../renderers/JobSlots';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

function randomText(): string {
  const symbols = [...'abcdefgh'].sort(() => Math.random() - 0.5).slice(0, rint(3, 7));
  // Skewed, small counts: some symbols are common, and equal frequencies (ties) are likely.
  return Array.from({ length: rint(10, 24) }, () => symbols[Math.floor(Math.random() * Math.random() * symbols.length)]).join('');
}

export const huffmanCoding: VizSpec<HuffmanInput, HuffmanState> = {
  id: 'huffman-coding',
  title: 'Huffman Coding',
  inputKind: 'huffman-text',
  inputLabel: 'Text, or symbol counts',
  inputHelp:
    'A text such as abracadabra: up to 64 printable ASCII characters and at most 12 different symbols. Put it in double quotes to keep spaces at its ends ("" is the empty text). ' +
    'Or give counts, as the Python test does: "freq a:45, b:13, c:12" is the text a x45, then b x13, then c x12 (up to 100 characters).',
  examples: [
    { label: 'abracadabra', value: 'abracadabra' },
    { label: 'Textbook 45/13/12/16/9/5', value: 'freq a:45, b:13, c:12, d:16, e:9, f:5' },
    { label: 'Equal frequencies', value: 'aabbccdd' },
    { label: 'One symbol', value: 'aaaa' },
    { label: 'Empty text', value: '""' },
  ],
  randomInput: randomText,
  parse: parseHuffman,
  trace: (input) => stabilizeHuffman(huffmanTrace(input).frames),
  render: (state) => <HuffmanForest state={state} />,
  pseudocode: HUFFMAN_CODE,
  legend: [
    { role: 'compare', label: 'heap entries being compared; the path to a leaf' },
    { role: 'active', label: 'the entry moving in the heap; the merge, code or bits being made' },
    { role: 'done', label: 'popped out of the heap; leaves that have their code' },
    { role: 'idle', label: 'waiting in the heap' },
  ],
  complexity: { time: 'O(k log k) for the tree (k symbols); O(N) to count and to encode', space: 'O(k) for the heap, the tree and the codes' },
};

function randomJobs(rule: JobInput['rule']): string {
  const n = rule === 'deadline' ? rint(5, 8) : rint(3, 6);
  return Array.from({ length: n }, (_, i) => {
    const id = i + 1;
    if (rule === 'deadline') return `${id} ${rint(1, 4)} ${pick([10, 20, 20, 30, 40, 50, 60, 75])}`;
    if (rule === 'edf') return `${id} ${rint(1, 10)} ${rint(1, 4)}`;
    return `${id} ${rint(1, 5)} ${rint(1, 9)}`;
  }).join(', ');
}

export const jobSchedulingDeadline: VizSpec<JobInput, JobSlotsState> = {
  id: 'job-scheduling',
  title: 'Job Scheduling (deadlines)',
  inputKind: 'jobs-deadline',
  inputLabel: 'Jobs as id deadline profit',
  inputHelp:
    'One job per comma: id, deadline, profit, as in "1 2 100, 2 1 19" (or Python tuples "(1, 2, 100)"). Every job takes one time unit. ' +
    'Ids are integers or words of up to 3 characters; deadlines go from -9 to 12 (0 or less is never scheduled), profits from -99 to 999. Up to 12 jobs.',
  examples: [
    { label: 'README example', value: '1 2 100, 2 1 19, 3 2 27, 4 1 25, 5 3 15' },
    { label: 'Job past every slot', value: '1 2 50, 2 2 40, 3 2 30, 4 1 60, 5 3 10' },
    { label: 'Deadline 0 or less', value: '1 0 50, 2 1 5, 3 -2 99' },
    { label: 'Id -1 (the old bug)', value: '-1 2 100, 2 1 50, 3 2 40' },
    { label: 'Equal profits', value: '1 1 10, 2 1 10, 3 2 10, 4 2 10, 5 3 5' },
  ],
  randomInput: () => randomJobs('deadline'),
  parse: (text) => parseJobs(text, 'deadline'),
  trace: (input) => stabilizeSlots(deadlineTrace(input.jobs).frames),
  render: (state) => <JobSlots state={state} />,
  pseudocode: JOB_CODE.deadline,
  legend: [
    { role: 'compare', label: 'sorted order; a job holding the slot being checked' },
    { role: 'active', label: 'the job being placed' },
    { role: 'good', label: 'free slot found: the job takes it' },
    { role: 'bad', label: 'slot taken, or job skipped' },
    { role: 'done', label: 'scheduled' },
    { role: 'muted', label: 'skipped (in the tray)' },
  ],
  complexity: { time: 'O(n log n + n * min(D, n)), D = the largest deadline', space: 'O(n + D): the sorted jobs and D + 1 slots' },
};

export const jobSchedulingEdf: VizSpec<JobInput, IntervalTimelineState> = {
  id: 'job-scheduling-edf',
  title: 'Job Scheduling (EDF)',
  inputKind: 'jobs-edf',
  inputLabel: 'Jobs as id deadline processing_time',
  inputHelp:
    'One job per comma: id, deadline, processing_time, as in "1 4 5, 2 2 3". The function only sorts by deadline and returns the ids; ' +
    'the bars show the processing times to make the order visible. Deadlines -9 to 99, times 0 to 20, up to 10 jobs.',
  examples: [
    { label: 'Python test', value: '1 4 5, 2 2 3, 3 6 4' },
    { label: 'Ties keep input order', value: 'a 3 2, b 1 1, c 3 1, d 2 2' },
    { label: 'Someone is late', value: '1 9 1, 2 2 3, 3 4 3, 4 3 2' },
  ],
  randomInput: () => randomJobs('edf'),
  parse: (text) => parseJobs(text, 'edf'),
  trace: (input) => orderTrace('edf', input.jobs).frames,
  render: (state) => <IntervalTimeline state={state} />,
  pseudocode: JOB_CODE.edf,
  legend: [
    { role: 'compare', label: 'just sorted' },
    { role: 'active', label: 'next in the returned order' },
    { role: 'done', label: 'placed; the hatched part runs past the deadline' },
    { role: 'idle', label: 'not reached yet' },
  ],
  complexity: { time: 'O(n log n): one sort', space: 'O(n) for the sorted copy' },
};

export const jobSchedulingSmith: VizSpec<JobInput, IntervalTimelineState> = {
  id: 'job-scheduling-smith',
  title: "Job Scheduling (Smith's rule)",
  inputKind: 'jobs-smith',
  inputLabel: 'Jobs as id processing_time weight',
  inputHelp:
    'One job per comma: id, processing_time, weight, as in "J1 3 1, J2 1 2". The code sorts by weight / processing_time, highest first, and sums weight x completion time. ' +
    'Times 0 to 20 (0 raises ZeroDivisionError, as in Python), weights 0 to 99, up to 10 jobs.',
  examples: [
    { label: 'README example', value: 'J1 3 1, J2 1 2, J3 2 3' },
    { label: 'Python test', value: '1 3 10, 2 1 20, 3 2 15' },
    { label: 'Equal ratios', value: '1 2 4, 2 1 2, 3 4 8, 4 3 3' },
    { label: 'Processing time 0', value: '1 2 3, 2 0 5, 3 1 1' },
  ],
  randomInput: () => randomJobs('smith'),
  parse: (text) => parseJobs(text, 'smith'),
  trace: (input) => orderTrace('smith', input.jobs).frames,
  render: (state) => <IntervalTimeline state={state} />,
  pseudocode: JOB_CODE.smith,
  legend: [
    { role: 'compare', label: 'just sorted by weight / time' },
    { role: 'active', label: 'running now: adds weight x completion time' },
    { role: 'done', label: 'finished' },
    { role: 'bad', label: 'processing_time 0: ZeroDivisionError' },
    { role: 'idle', label: 'not reached yet' },
  ],
  complexity: { time: 'O(n log n): one sort, then one pass', space: 'O(n) for the sorted copy' },
};
