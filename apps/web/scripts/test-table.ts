/**
 * Test thao tác bảng (chạy: pnpm --filter web exec jiti scripts/test-table.ts):
 * chèn/xóa hàng-cột theo vị trí, đồng bộ cellStyles, định dạng theo vùng, schema.
 */
import { tableElementSchema } from "@repo/shared";
import {
  clampPos,
  clearCellStyles,
  inRange,
  insertCol,
  insertRow,
  normalizeRange,
  patchCellStyles,
  removeCols,
  removeRows,
  type TableProps,
} from "../src/lib/editor/table";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    console.error(`✗ ${name}:`, e instanceof Error ? e.message : e);
  }
}

function eq<T>(actual: T, expected: T, msg?: string) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg ?? "eq"}: ${a} !== ${b}`);
}

function assert(cond: boolean, msg = "assert failed") {
  if (!cond) throw new Error(msg);
}

const base: TableProps = {
  rows: [
    ["H1", "H2", "H3"],
    ["a1", "a2", "a3"],
    ["b1", "b2", "b3"],
  ],
  headerRow: true,
};

test("normalizeRange đảo hướng kéo", () => {
  eq(normalizeRange({ r: 2, c: 3 }, { r: 0, c: 1 }), { r1: 0, r2: 2, c1: 1, c2: 3 });
});

test("inRange biên", () => {
  const r = { r1: 1, r2: 2, c1: 0, c2: 1 };
  assert(inRange(1, 0, r) && inRange(2, 1, r) && !inRange(0, 0, r) && !inRange(1, 2, r));
});

test("insertRow chèn đúng vị trí giữa", () => {
  const next = insertRow(base, 1);
  eq(next.rows.length, 4);
  eq(next.rows[1], ["", "", ""]);
  eq(next.rows[2], ["a1", "a2", "a3"]);
});

test("insertRow đồng bộ cellStyles", () => {
  const withStyle = patchCellStyles(base, { r1: 1, r2: 1, c1: 0, c2: 0 }, { bg: "#ff0000" });
  const next = insertRow(withStyle, 1); // chèn TRƯỚC hàng có style → style dời xuống hàng 2
  eq(next.cellStyles?.[1]?.[0], null);
  eq(next.cellStyles?.[2]?.[0], { bg: "#ff0000" });
});

test("removeRows xóa đúng vùng + giữ tối thiểu 1 hàng", () => {
  const next = removeRows(base, 0, 1);
  eq(next.rows, [["b1", "b2", "b3"]]);
  const noop = removeRows(base, 0, 2); // xóa hết → giữ nguyên
  eq(noop.rows.length, 3);
});

test("insertCol chèn đúng vị trí + reset columnWidths", () => {
  const withWidths: TableProps = { ...base, columnWidths: [1, 2, 1] };
  const next = insertCol(withWidths, 1);
  eq(next.rows[0], ["H1", "", "H2", "H3"]);
  eq(next.columnWidths, undefined);
});

test("removeCols xóa đúng vùng + đồng bộ cellStyles", () => {
  const withStyle = patchCellStyles(base, { r1: 0, r2: 0, c1: 2, c2: 2 }, { color: "#00ff00" });
  const next = removeCols(withStyle, 0, 1);
  eq(next.rows[0], ["H3"]);
  eq(next.cellStyles?.[0]?.[0], { color: "#00ff00" }); // style cột 2 cũ dời về cột 0
  const noop = removeCols(base, 0, 2);
  eq(noop.rows[0]!.length, 3);
});

test("patchCellStyles gộp field, không đè field cũ khác", () => {
  let p = patchCellStyles(base, { r1: 1, r2: 1, c1: 1, c2: 1 }, { bg: "#111111" });
  p = patchCellStyles(p, { r1: 1, r2: 1, c1: 1, c2: 1 }, { color: "#222222" });
  eq(p.cellStyles?.[1]?.[1], { bg: "#111111", color: "#222222" });
});

test("patchCellStyles áp cả vùng chữ nhật", () => {
  const p = patchCellStyles(base, { r1: 0, r2: 1, c1: 0, c2: 1 }, { bg: "#eeeeee" });
  for (const [r, c] of [[0, 0], [0, 1], [1, 0], [1, 1]] as const) {
    eq(p.cellStyles?.[r]?.[c]?.bg, "#eeeeee", `ô ${r},${c}`);
  }
  eq(p.cellStyles?.[2]?.[2], null, "ngoài vùng không đổi");
});

test("clearCellStyles về null; toàn null → cellStyles undefined (gọn JSON)", () => {
  const p = patchCellStyles(base, { r1: 0, r2: 0, c1: 0, c2: 0 }, { bg: "#123456" });
  const cleared = clearCellStyles(p, { r1: 0, r2: 0, c1: 0, c2: 0 });
  eq(cleared.cellStyles, undefined);
});

test("clampPos kẹp sau khi thu nhỏ bảng", () => {
  const small = removeRows(base, 1, 2);
  eq(clampPos(small, { r: 5, c: 9 }), { r: 0, c: 2 });
});

test("schema nhận cellStyles + round-trip", () => {
  const el = {
    id: "t1",
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    zIndex: 1,
    type: "table" as const,
    props: patchCellStyles(base, { r1: 0, r2: 1, c1: 0, c2: 0 }, { bg: "#fee2e2", color: "#991b1b" }),
  };
  const parsed = tableElementSchema.parse(el);
  eq(parsed.props.cellStyles?.[0]?.[0], { bg: "#fee2e2", color: "#991b1b" });
});

test("schema từ chối cellStyles sai kiểu", () => {
  const r = tableElementSchema.safeParse({
    id: "t1",
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    zIndex: 1,
    type: "table",
    props: { rows: [["a"]], cellStyles: [[{ bg: 123 }]] },
  });
  assert(!r.success);
});

console.log(`\n${passed}/${passed + failed} pass${failed ? ` — ${failed} FAIL` : ""}`);
if (failed > 0) process.exit(1);
