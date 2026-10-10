// Selected tool + selected seed type. Q/E cycle tools, R cycles seeds.
export function createToolbar(tools, crops) {
  const tb = { toolIndex: 0, seedIndex: 0 };
  const wrap = (i, n) => (i + n) % n;
  tb.tool = () => tools[tb.toolIndex];
  tb.seed = () => crops[tb.seedIndex];
  tb.nextTool = (dir) => { tb.toolIndex = wrap(tb.toolIndex + dir, tools.length); };
  tb.nextSeed = () => { tb.seedIndex = wrap(tb.seedIndex + 1, crops.length); };
  return tb;
}
