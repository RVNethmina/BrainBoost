// Utilities
export const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export function shuffle<T>(a: T[]) { const arr=[...a]; for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }

// 1) Odd-one-out (shapes)
const SHAPES = ["▲","●","■","◆"];
export const makeOdd = (diff: "easy"|"medium"|"hard") => () => {
  const base = SHAPES[randInt(0, SHAPES.length-1)];
  const odd = SHAPES.filter(s => s!==base)[randInt(0, SHAPES.length-2)];
  const correctIndex = randInt(0,3);
  const opts = Array.from({length:4}, (_,i)=> i===correctIndex ? odd : base);
  const prompt = diff==="easy" ? "Which one is different?" : diff==="medium" ? "Find the odd shape" : "Spot the shape that does NOT match";
  return { prompt, options: opts, correctIndex };
};

// 2) Number sequence (what comes next?)
export const makeSeq = (diff: "easy"|"medium"|"hard") => () => {
  const start = randInt(1, 10);
  const step  = diff==="easy" ? randInt(1,3) : diff==="medium" ? randInt(2,5) : randInt(3,7);
  const seq   = Array.from({length:4}, (_,i)=> start + i*step);
  const next  = start + 4*step;
  const options = shuffle([next, next+1, next-1, next+step]).map(String);
  return { prompt: `What comes next: ${seq.join(", ")} , ?`, options, correctIndex: options.indexOf(String(next)) };
};

// 3) Arrow direction
const ARROWS = ["↑","↓","←","→"] as const;
const WORDS  = ["UP","DOWN","LEFT","RIGHT"] as const;
export const makeArrow = (diff: "easy"|"medium"|"hard") => () => {
  const correctIdx = randInt(0,3);
  const correctArrow = ARROWS[correctIdx];
  const targetWord  = diff==="hard" ? WORDS[randInt(0,3)] : WORDS[correctIdx]; // slight Stroop on hard
  const options = shuffle([...ARROWS]) as unknown as string[];
  return { prompt: `Tap the arrow pointing to: ${targetWord}`, options, correctIndex: options.indexOf(correctArrow) };
};

// 4) Number comparison (largest)
export const makeComp = (diff: "easy"|"medium"|"hard") => () => {
  const maxBase = diff==="easy" ? 20 : diff==="medium" ? 50 : 99;
  const nums = shuffle([randInt(1,maxBase), randInt(1,maxBase), randInt(1,maxBase), randInt(1,maxBase)]);
  const maxVal = Math.max(...nums);
  return { prompt: diff==="easy" ? "Which number is the largest?" : diff==="medium" ? "Select the greatest number" : "Pick the highest value", options: nums.map(String), correctIndex: nums.indexOf(maxVal) };
};
